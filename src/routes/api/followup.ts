import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/followup")({
  server: { handlers: { POST: async ({ request }) => {
    const { handleFollowup } = await import("@/lib/followup.server");
    return handleFollowup(request);
  } } },
});