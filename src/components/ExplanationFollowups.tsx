import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Square, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export function ExplanationFollowups({ explanationId }: { explanationId: string }) {
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState("");
  const [answer, setAnswer] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const qc = useQueryClient();
  useEffect(() => () => abort.current?.abort(), []);
  const { data: history = [], isLoading, error: loadError } = useQuery({
    queryKey: ["followups", explanationId],
    queryFn: async () => {
      const { data, error } = await supabase.from("explanation_followups").select("id, question, answer").eq("explanation_id", explanationId).order("created_at");
      if (error) throw error;
      return data;
    },
  });
  async function ask() {
    if (!question.trim() || busy) return;
    const q = question.trim();
    setBusy(true); setPending(q); setAnswer(""); setReasoning(""); setError(""); setQuestion("");
    const controller = new AbortController(); abort.current = controller;
    let done = false;
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error("Please sign in again.");
      const response = await fetch("/api/followup", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}` },
        body: JSON.stringify({ explanationId, question: q }), signal: controller.signal,
      });
      if (!response.ok) { const result = await response.json().catch(() => null); throw new Error(result?.error ?? "Could not answer this question. Please try again."); }
      if (!response.body) throw new Error("No answer received.");
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = "";
      const consume = (line: string) => {
        if (!line.trim()) return;
        const event = JSON.parse(line) as { type: string; text?: string; error?: string };
        if (event.type === "text") setAnswer((a) => a + (event.text ?? ""));
        if (event.type === "reasoning") setReasoning((a) => a + (event.text ?? ""));
        if (event.type === "error") throw new Error(event.error ?? "AI could not answer.");
        if (event.type === "done") done = true;
      };
      while (true) {
        const chunk = await reader.read(); if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        const lines = buffer.split("\n"); buffer = lines.pop() ?? ""; lines.forEach(consume);
      }
      consume(buffer);
      if (done) { await qc.invalidateQueries({ queryKey: ["followups", explanationId] }); setPending(""); setAnswer(""); }
      else throw new Error("The answer was interrupted.");
    } catch (e) {
      if (controller.signal.aborted) setError("Answer stopped. This question was not saved.");
      else setError(e instanceof Error ? e.message : "Could not reach AI.");
      setQuestion(q);
    } finally { setBusy(false); abort.current = null; input.current?.focus(); }
  }
  return <div className="mt-6 space-y-4 border-t pt-5">
    <h3 className="flex items-center gap-2 font-semibold"><MessageCircle className="size-4 text-primary" />Follow-up questions</h3>
    {isLoading && <p className="text-sm text-muted-foreground">Loading questions…</p>}
    {loadError && <p role="alert" className="text-sm text-destructive">Could not load saved questions.</p>}
    {history.map((entry) => <div key={entry.id} className="space-y-2 border-b pb-4">
      <p className="break-words font-medium">{entry.question}</p>
      <div className="prose-explain min-w-0 break-words"><ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.answer}</ReactMarkdown></div>
    </div>)}
    {pending && <div className="space-y-2" aria-live="polite">
      <p className="break-words font-medium">{pending}</p>
      {reasoning && <details className="text-sm text-muted-foreground"><summary className="cursor-pointer">Thinking</summary><p className="whitespace-pre-wrap break-words">{reasoning}</p></details>}
      {answer ? <div className="prose-explain break-words"><ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown></div> : busy && <Loader2 aria-label="Preparing answer" className="size-4 animate-spin text-primary" />}
    </div>}
    {error && <p role="alert" className="break-words text-sm text-destructive">{error}</p>}
    <form onSubmit={(e) => { e.preventDefault(); void ask(); }} className="flex items-end gap-2">
      <Textarea ref={input} aria-label="Follow-up question" placeholder="Ask about this code…" maxLength={2000} value={question} onChange={(e) => setQuestion(e.target.value)} className="min-h-20 flex-1" />
      {busy ? <Button type="button" variant="outline" size="icon" title="Stop answer" aria-label="Stop answer" onClick={() => abort.current?.abort()}><Square className="size-4" /></Button> : <Button type="submit" size="icon" title="Ask question" aria-label="Ask question" disabled={!question.trim() || isLoading || !!loadError}><Send className="size-4" /></Button>}
    </form>
  </div>;
}