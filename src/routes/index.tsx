import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Code2, ListOrdered, GraduationCap, History, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Code Explainer — understand code line by line" },
      { name: "description", content: "Paste any code and get a line-by-line explanation at beginner, intermediate or expert level, powered by Google Gemini." },
      { property: "og:title", content: "AI Code Explainer" },
      { property: "og:description", content: "Line-by-line code explanations for students, powered by Google Gemini." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Code2, title: "Paste code", text: "Python, Java, JavaScript, C, C++, SQL and more." },
  { icon: ListOrdered, title: "Line by line", text: "Every line explained with its original line number." },
  { icon: GraduationCap, title: "Your level", text: "Beginner, intermediate or expert explanations." },
  { icon: History, title: "History", text: "Every explanation is saved to your account." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 font-bold">
          <span className="grid size-8 place-items-center rounded-lg bg-brand text-primary-foreground"><Code2 className="size-4" /></span>
          AI Code Explainer
        </div>
        <Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button>
      </header>

      <main className="relative">
        <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <section className="relative mx-auto max-w-4xl px-6 pb-16 pt-20 text-center">
          <span className="inline-block rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">B.Tech CSE (AI) · Batch 2026–2030 · Md Dilshan</span>
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-6xl">
            Understand any code,<br /><span className="text-brand">one line at a time.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Paste a program, choose your level, and get a clear explanation powered by Google Gemini.
          </p>
          <Button asChild size="lg" className="mt-8 bg-brand shadow-card">
            <Link to="/explain">Start Explaining Code <ArrowRight /></Link>
          </Button>

          <div className="mx-auto mt-14 max-w-2xl overflow-hidden rounded-xl border bg-code text-left font-mono text-sm text-code-foreground shadow-card">
            {[`def greet(name):`, `    return "Hi " + name`, ``, `print(greet("Dilshan"))`].map((l, i) => (
              <div key={i} className="flex gap-4 px-4 py-0.5 first:pt-4 last:pb-4">
                <span className="w-4 text-right text-code-gutter">{i + 1}</span><span className="whitespace-pre">{l}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="relative mx-auto grid max-w-5xl gap-4 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-5 shadow-card">
              <f.icon className="size-5 text-primary" />
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
