import { createFileRoute } from "@tanstack/react-router";
import { upsertWalletEvents } from "@/server/event-store";
import { normalizeHeliusEvent } from "@/server/webhook-normalize";

type WebhookBody = Array<Record<string, unknown>>;

function getWalletFromTx(tx: Record<string, unknown>) {
  const feePayer = tx.feePayer;
  if (typeof feePayer === "string") return feePayer;
  return null;
}

export const Route = createFileRoute("/api/webhooks/helius")({
  // @ts-expect-error server handlers supported by TanStack Start runtime
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const secret =
          import.meta.env.SENTINEL_WEBHOOK_SECRET ?? import.meta.env.VITE_HELIUS_WEBHOOK_SECRET;
        if (secret) {
          const url = new URL(request.url);
          const headerSecret = request.headers.get("x-sentinel-secret");
          const querySecret = url.searchParams.get("secret");
          if (headerSecret !== secret && querySecret !== secret) {
            return Response.json({ error: "unauthorized webhook" }, { status: 401 });
          }
        }

        const payload = (await request.json()) as WebhookBody;
        if (!Array.isArray(payload)) {
          return Response.json({ error: "payload must be an array" }, { status: 400 });
        }

        const byWallet = new Map<string, Array<Record<string, unknown>>>();
        for (const tx of payload) {
          const wallet = getWalletFromTx(tx);
          if (!wallet) continue;
          const arr = byWallet.get(wallet) ?? [];
          arr.push(tx);
          byWallet.set(wallet, arr);
        }

        let accepted = 0;
        for (const [wallet, txs] of byWallet.entries()) {
          const normalized = txs.map((tx) =>
            normalizeHeliusEvent(tx as Parameters<typeof normalizeHeliusEvent>[0], wallet)
          );
          upsertWalletEvents(wallet, normalized);
          accepted += normalized.length;
        }

        return Response.json({
          ok: true,
          wallets: byWallet.size,
          accepted,
        });
      },
    },
  },
});
