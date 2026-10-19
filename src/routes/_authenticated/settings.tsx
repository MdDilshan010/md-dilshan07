import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — AI Code Explainer" }, { name: "description", content: "App settings." }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { dark, toggle } = useTheme();
  return (
    <div className="mx-auto max-w-xl rounded-xl border bg-card p-6 shadow-card">
      <h1 className="text-xl font-bold">Settings</h1>
      <div className="mt-4 flex items-center justify-between"><span>Theme: {dark ? "Dark" : "Light"}</span><Button variant="outline" onClick={toggle}>Toggle theme</Button></div>
    </div>
  );
}
