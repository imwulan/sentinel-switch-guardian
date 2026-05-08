import { createFileRoute } from "@tanstack/react-router";
import { upsertWalletEvents } from "@/server/event-store";
import { normalizeHeliusEvent } from "@/server/webhook-normalize";
import { sendTelegramAlert, shouldAlertTelegram } from "@/lib/telegram";
import { createClient } from "@supabase/supabase-js";

type WebhookBody = Array<Record<string, unknown>>;

function getWalletFromTx(tx: Record<string, unknown>) {
  const feePayer = tx.feePayer;
  if (typeof feePayer === "string") return feePayer;
  return null;
}

function getAnonClient() {
  const url = process.env.SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? "";
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function getTelegramConfig() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN ?? "";
  const chatId = process.env.TELEGRAM_CHAT_ID ?? "";
  return botToken && chatId ? { botToken, chatId } : null;
}

export const Route = createFileRoute("/api/webhooks/helius")({
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
        let telegramSent = 0;
        const supabase = getAnonClient();
        const telegram = getTelegramConfig();

        for (const [wallet, txs] of byWallet.entries()) {
          const normalized = txs.map((tx) =>
            normalizeHeliusEvent(tx as Parameters<typeof normalizeHeliusEvent>[0], wallet)
          );
          upsertWalletEvents(wallet, normalized);

          if (supabase) {
            const rows = normalized.map((e) => ({
              id: e.id,
              wallet,
              signature: e.signature,
              slot: e.slot,
              ts: e.timestamp,
              kind: e.kind,
              label: e.label,
              detail: e.detail,
              risk: e.risk,
              programs: e.programs,
              from_account: e.from ?? null,
              to_account: e.to ?? null,
              amount_sol: e.amountSol ?? null,
            }));
            await supabase.from("wallet_transactions").upsert(rows, { onConflict: "id" });
          }

          if (telegram) {
            for (const event of normalized) {
              if (shouldAlertTelegram(event, 70)) {
                const result = await sendTelegramAlert(event, wallet, telegram.botToken, telegram.chatId);
                if (result.ok) telegramSent++;
                else console.error("[Sentinel] Telegram alert failed:", result.error);
              }
            }
          }

          accepted += normalized.length;
        }

        return Response.json({
          ok: true,
          wallets: byWallet.size,
          accepted,
          telegramSent,
        });
      },
    },
  },
});
