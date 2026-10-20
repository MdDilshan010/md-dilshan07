import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { fetchHistory, type Entry } from "@/lib/history";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — AI Code Explainer" }, { name: "description", content: "Your saved code explanations." }, { property: "og:title", content: "History — AI Code Explainer" }, { property: "og:description", content: "Revisit your saved code explanations and follow-up answers." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ["history"], queryFn: fetchHistory });
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState("");
  const qc = useQueryClient();
  const nav = useNavigate();
  const list = data.filter((e) => (!diff || e.difficulty === diff) && [e.title, e.language, e.code].some((s) => s.toLowerCase().includes(q.toLowerCase())));

  async function del(id?: string) {
    if (!confirm(id ? "Delete this entry?" : "Clear all history?")) return;
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { toast.error("Please sign in again."); return; }
    const r = id ? await supabase.from("explanations").delete().eq("id", id) : await supabase.from("explanations").delete().eq("user_id", u.user.id);
    if (r.error) toast.error(r.error.message); else { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["history"] }); }
  }
  const open = (e: Entry) => { sessionStorage.setItem("reuse", JSON.stringify(e)); nav({ to: "/explain" }); };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search title, language or code" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <select className="h-9 rounded-md border bg-card px-2 text-sm" value={diff} onChange={(e) => setDiff(e.target.value)}><option value="">All levels</option><option>beginner</option><option>intermediate</option><option>expert</option></select>
        {data.length > 0 && <Button variant="outline" className="ml-auto" onClick={() => del()}>Clear history</Button>}
      </div>
      {isLoading ? <p className="text-muted-foreground">Loading…</p> : list.length === 0 ? <p className="rounded-xl border bg-card p-8 text-center text-muted-foreground">No explanations yet.</p> :
        list.map((e) => (
          <div key={e.id} className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-card">
            <div className="min-w-0 flex-1"><p className="truncate font-medium">{e.title}</p><p className="text-xs text-muted-foreground">{e.language} · {e.difficulty} · {new Date(e.created_at).toLocaleString()}</p></div>
            <Button size="sm" onClick={() => open(e)}>Open</Button>
            <Button size="sm" variant="ghost" onClick={() => del(e.id)}>Delete</Button>
          </div>
        ))}
    </div>
  );
}
