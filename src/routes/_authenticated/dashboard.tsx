import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { fetchHistory } from "@/lib/history";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — AI Code Explainer" }, { name: "description", content: "Your code explanation dashboard." }, { property: "og:title", content: "Dashboard — AI Code Explainer" }, { property: "og:description", content: "Your learning progress and recent code explanations." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data = [] } = useQuery({ queryKey: ["history"], queryFn: fetchHistory });
  const langs = [...new Set(data.map((d) => d.language))].slice(0, 5);
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-2xl bg-brand p-8 text-primary-foreground shadow-card">
        <h1 className="text-2xl font-bold">Welcome to AI Code Explainer, Md Dilshan</h1>
        <p className="mt-1 opacity-90">Paste code and learn it line by line.</p>
        <Button asChild variant="secondary" className="mt-5"><Link to="/explain">Explain code</Link></Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-card"><p className="text-sm text-muted-foreground">Total explanations</p><p className="mt-1 text-3xl font-bold">{data.length}</p></div>
        <div className="rounded-xl border bg-card p-5 shadow-card"><p className="text-sm text-muted-foreground">Recent languages</p><p className="mt-2 font-medium">{langs.join(", ") || "None yet"}</p></div>
      </div>
    </div>
  );
}
