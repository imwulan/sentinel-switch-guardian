import { createFileRoute } from "@tanstack/react-router";
import { listWalletEvents } from "@/server/event-store";
import { createClient } from "@supabase/supabase-js";
import type { SentinelEvent } from "@/lib/sentinel-types";

function getAnonClient() {
  const url = process.env.SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? "";
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export const Route = createFileRoute("/api/events")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const wallet = url.searchParams.get("wallet");
        if (!wallet) {
          return Response.json({ error: "wallet is required" }, { status: 400 });
        }

        const supabase = getAnonClient();
        if (supabase) {
          const { data, error } = await supabase
            .from("wallet_transactions")
            .select("*")
            .eq("wallet", wallet)
            .order("ts", { ascending: false })
            .limit(100);

          if (!error && data && data.length > 0) {
            const events: SentinelEvent[] = data.map((row) => ({
              id: row.id,
              signature: row.signature,
              slot: row.slot ?? 0,
              timestamp: row.ts,
              kind: row.kind as SentinelEvent["kind"],
              label: row.label,
              detail: row.detail,
              risk: row.risk as SentinelEvent["risk"],
              programs: row.programs ?? [],
              from: row.from_account ?? undefined,
              to: row.to_account ?? undefined,
              amountSol: row.amount_sol ?? undefined,
            }));
            return Response.json({ wallet, events });
          }
        }

        return Response.json({ wallet, events: listWalletEvents(wallet) });
      },
    },
  },
});
