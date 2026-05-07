import { createFileRoute } from "@tanstack/react-router";
import { listWalletEvents } from "@/server/event-store";

export const Route = createFileRoute("/api/events")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const wallet = url.searchParams.get("wallet");
        if (!wallet) {
          return Response.json({ error: "wallet is required" }, { status: 400 });
        }
        return Response.json({
          wallet,
          events: listWalletEvents(wallet),
        });
      },
    },
  },
});
