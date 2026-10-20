import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { explainCode } from "@/lib/explain.functions";
import { LANGUAGES, DIFFICULTIES, defaultSettings, MAX_CODE_CHARS, type ExplainSettings } from "@/lib/explain-options";
import { SAMPLES } from "@/lib/samples";
import { ExplanationFollowups } from "@/components/ExplanationFollowups";

export const Route = createFileRoute("/_authenticated/explain")({
  head: () => ({ meta: [{ title: "Explain Code — AI Code Explainer" }, { name: "description", content: "Get a line-by-line explanation of your code." }, { property: "og:title", content: "Explain Code — AI Code Explainer" }, { property: "og:description", content: "Understand code and ask follow-up questions about saved explanations." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: ExplainPage,
});

function ExplainPage() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<(typeof LANGUAGES)[number]>("Auto Detect");
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>("beginner");
  const [settings, setSettings] = useState<ExplainSettings>(defaultSettings);
  const [out, setOut] = useState("");
  const [savedId, setSavedId] = useState("");
  const [busy, setBusy] = useState(false);
  const run = useServerFn(explainCode);
  const qc = useQueryClient();

  useEffect(() => {
    const r = sessionStorage.getItem("reuse");
    if (r) { try { const e = JSON.parse(r); setCode(e.code); setOut(e.explanation ?? ""); setSavedId(e.id ?? ""); } catch { toast.error("Could not open this explanation."); } sessionStorage.removeItem("reuse"); }
  }, []);

  async function go() {
    if (!code.trim()) { toast.error("Please paste some code first."); return; }
    if (code.length > MAX_CODE_CHARS) { toast.error("Code is too long."); return; }
    setBusy(true);
    try {
      const r = await run({ data: { code, language, difficulty, settings } });
      if (!r.ok) toast.error(r.error);
      else { setOut(r.explanation); setSavedId(r.saved ? r.id : ""); toast.success(r.saved ? "Explanation saved to history" : "Explained (not saved)"); qc.invalidateQueries({ queryKey: ["history"] }); }
    } catch { toast.error("Request failed. Check your connection."); }
    setBusy(false);
  }

  const set = <K extends keyof ExplainSettings>(k: K, v: ExplainSettings[K]) => setSettings({ ...settings, [k]: v });
  const sel = "h-9 rounded-md border bg-card px-2 text-sm";

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="space-y-3 rounded-xl border bg-card p-4 shadow-card">
        <div className="flex flex-wrap gap-2">
          <select aria-label="Language" className={sel} value={language} onChange={(e) => setLanguage(e.target.value as never)}>{LANGUAGES.map((l) => <option key={l}>{l}</option>)}</select>
          <select aria-label="Load example" className={sel} value="" onChange={(e) => { const s = SAMPLES[+e.target.value]; if (s) { setCode(s.code); setLanguage(s.language as never); } }}>
            <option value="">Load example…</option>{SAMPLES.map((s, i) => <option key={s.name} value={i}>{s.name}</option>)}
          </select>
          <Button size="sm" variant="outline" onClick={async () => { try { setCode(await navigator.clipboard.readText()); } catch { toast.error("Clipboard not available"); } }}>Paste</Button>
          <Button size="sm" variant="outline" onClick={() => setCode("")}>Clear</Button>
        </div>
        <Textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder="Paste your code here…" className="min-h-72 font-mono text-sm" spellCheck={false}
          onKeyDown={(e) => { if (e.key === "Tab") { e.preventDefault(); const t = e.currentTarget, s = t.selectionStart; setCode(code.slice(0, s) + "    " + code.slice(t.selectionEnd)); } }} />
        <div className="flex gap-2">{DIFFICULTIES.map((d) => <Button key={d} size="sm" variant={difficulty === d ? "default" : "outline"} className="capitalize" onClick={() => setDifficulty(d)}>{d}</Button>)}</div>
        <details className="rounded-lg border p-3 text-sm">
          <summary className="cursor-pointer font-medium">Advanced settings</summary>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <select className={sel} value={settings.detail} onChange={(e) => set("detail", e.target.value as never)}><option value="brief">Brief</option><option value="balanced">Balanced</option><option value="detailed">Detailed</option></select>
            <select className={sel} value={settings.style} onChange={(e) => set("style", e.target.value as never)}><option value="tutorial">Tutorial</option><option value="step-by-step">Step-by-Step</option><option value="technical">Technical</option></select>
            <select className={sel} value={settings.outputLanguage} onChange={(e) => set("outputLanguage", e.target.value as never)}><option>English</option><option>Hindi</option><option>Hinglish</option></select>
          </div>
          <div className="mt-3 flex flex-wrap gap-4">
            {(["examples", "complexity", "improvements", "sampleIO"] as const).map((k) => (
              <label key={k} className="flex items-center gap-1.5"><input type="checkbox" checked={settings[k]} onChange={(e) => set(k, e.target.checked)} />{k === "sampleIO" ? "Sample I/O" : k.charAt(0).toUpperCase() + k.slice(1)}</label>
            ))}
          </div>
          <Textarea className="mt-3" maxLength={500} placeholder="Custom instructions (optional)" value={settings.customInstructions} onChange={(e) => set("customInstructions", e.target.value)} />
        </details>
        <Button className="w-full bg-brand" onClick={go} disabled={busy}>{busy && <Loader2 className="animate-spin" />}Explain Code</Button>
      </section>
      <section className="rounded-xl border bg-card p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">AI Explanation</h2>
          {out && <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(out); toast.success("Copied"); }}><Copy />Copy</Button>}</div>
        {busy ? <p className="text-muted-foreground">Gemini is explaining your code…</p> : out ? <div className="prose-explain"><ReactMarkdown remarkPlugins={[remarkGfm]}>{out}</ReactMarkdown></div> : <p className="text-muted-foreground">Your explanation will appear here.</p>}
        {!busy && savedId && out && <ExplanationFollowups key={savedId} explanationId={savedId} />}
      </section>
    </div>
  );
}
