import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { explainInputSchema, detectLanguage, makeTitle } from "./explain-options";
import { buildSystemPrompt, buildUserPrompt } from "./prompt.server";

type Result =
  | { ok: true; id: string; explanation: string; language: string; saved: boolean }
  | { ok: false; error: string };

export const explainCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => explainInputSchema.parse(d))
  .handler(async ({ data, context }): Promise<Result> => {
    const apiKey = process.env["GEMINI_API_KEY"];
    if (!apiKey) return { ok: false, error: "The Gemini API key is not configured yet. Add GEMINI_API_KEY in the project's secrets." };
    // Verified via Google's models.list + generateContent for this key (gemini-2.5-flash is retired for new users).
    const model = process.env["GEMINI_MODEL"] || "gemini-3.8-flash";

    // Basic abuse protection: max 8 explanations per user per minute.
    const since = new Date(Date.now() - 60_000).toISOString();
    const { count } = await context.supabase
      .from("explanations")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since);
    if ((count ?? 0) >= 8) return { ok: false, error: "Too many requests. Please wait a minute and try again." };

    const language = data.language === "Auto Detect" ? detectLanguage(data.code) : data.language;

    let res: Response;
    try {
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: buildSystemPrompt(data, language) }] },
            contents: [{ role: "user", parts: [{ text: buildUserPrompt(data.code) }] }],
            generationConfig: { temperature: 0.3 },
          }),
        },
      );
    } catch {
      return { ok: false, error: "Could not reach Google Gemini. Check your connection and try again." };
    }

    if (!res.ok) {
      const status = res.status;
      console.error("Gemini error", status, (await res.text()).slice(0, 300));
      if (status === 400 || status === 401 || status === 403)
        return { ok: false, error: "Gemini rejected the request. The API key may be invalid or lack access to this model." };
      if (status === 404) return { ok: false, error: `The Gemini model "${model}" is not available for this key.` };
      if (status === 429) return { ok: false, error: "Gemini rate limit or quota reached. Please wait and try again." };
      return { ok: false, error: "Gemini is having problems right now. Please try again shortly." };
    }

    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[];
      promptFeedback?: { blockReason?: string };
    };
    if (json.promptFeedback?.blockReason) return { ok: false, error: "Gemini declined to explain this code." };
    const explanation = (json.candidates?.[0]?.content?.parts ?? [])
      .filter((p) => !p.thought)
      .map((p) => p.text ?? "")
      .join("")
      .trim();
    if (explanation.length < 40) return { ok: false, error: "Gemini returned an empty or unusable answer. Please try again." };

    const { data: row, error } = await context.supabase
      .from("explanations")
      .insert({
        user_id: context.userId,
        title: makeTitle(data.code, language),
        code: data.code,
        language,
        difficulty: data.difficulty,
        settings: data.settings,
        explanation,
      })
      .select("id")
      .single();
    if (error) console.error("save failed", error.message);
    return { ok: true, id: row?.id ?? "", explanation, language, saved: !error };
  });
