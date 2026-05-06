import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/sentinel/Header";
import { ArrowLeft, Copy, ExternalLink, Shield, Brain, Activity, AlertTriangle, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/wallets/$address")({
  component: WalletDetail,
  head: ({ params }) => ({
    meta: [
      { title: `${params.address.slice(0, 6)}… — Wallet · Sentinel Switch` },
      { name: "description", content: "Behavioral baseline, AI risk score and recent activity for this protected wallet." },
    ],
  }),
});

function WalletDetail() {
  const { address } = Route.useParams();
  const short = `${address.slice(0, 4)}…${address.slice(-4)}`;
  const copy = async () => {
    await navigator.clipboard.writeText(address);
    toast.success("Address copied");
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-40" />
      <main className="relative mx-auto max-w-5xl space-y-5 p-4 md:p-6">
        <Header status="normal" wallet={address} />

        <Link to="/wallets" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> All wallets
        </Link>

        <section className="glass rounded-2xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Protected wallet</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{short}</h1>
              <div className="mt-2 flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <span className="break-all">{address}</span>
                <button onClick={copy} className="opacity-60 hover:opacity-100" aria-label="Copy address">
                  <Copy className="h-3 w-3" />
                </button>
                <a href={`https://solscan.io/account/${address}`} target="_blank" rel="noreferrer" className="opacity-60 hover:opacity-100">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="rounded-xl border border-border bg-secondary/60 px-4 py-2 text-xs font-medium hover:bg-secondary">Tune AI</button>
              <button className="rounded-xl bg-threat/15 px-4 py-2 text-xs font-semibold text-threat hover:bg-threat/25">Pause Sentinel</button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { l: "Balance", v: "24.81 SOL", c: "text-foreground" },
              { l: "Risk score", v: "14/100", c: "text-safe" },
              { l: "Threats blocked", v: "37", c: "text-foreground" },
              { l: "Watching since", v: "12d", c: "text-muted-foreground" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-secondary/40 p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</p>
                <p className={`mt-1 font-mono text-lg font-bold ${s.c}`}>{s.v}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-safe" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Behavioral baseline</h2>
            </div>
            <ul className="mt-4 space-y-2 text-xs">
              {[
                { l: "Avg tx size", v: "2.4 SOL" },
                { l: "Counterparties", v: "147 known" },
                { l: "Active hours", v: "9–23 UTC" },
                { l: "Top program", v: "Jupiter v6" },
                { l: "Velocity (24h)", v: "Within normal" },
              ].map((s) => (
                <li key={s.l} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-1.5">
                  <span className="text-muted-foreground">{s.l}</span>
                  <span className="font-medium text-foreground">{s.v}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-safe" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Protection rules</h2>
            </div>
            <ul className="mt-4 space-y-2 text-xs">
              {[
                { l: "Auto-block on high risk", v: "On" },
                { l: "Approve unknown programs", v: "Ask" },
                { l: "Daily withdrawal cap", v: "20 SOL" },
                { l: "Allowlist", v: "12 entries" },
                { l: "Blocklist", v: "4 entries" },
              ].map((s) => (
                <li key={s.l} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-1.5">
                  <span className="text-muted-foreground">{s.l}</span>
                  <span className="font-medium text-safe">{s.v}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-safe" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Recent decisions</h2>
          </div>
          <ul className="mt-4 divide-y divide-border/50">
            {[
              { t: "2m ago", l: "Approved swap on Jupiter v6", r: "low", icon: TrendingUp },
              { t: "1h ago", l: "Blocked: unknown program Pdr…7Xa2", r: "high", icon: AlertTriangle },
              { t: "5h ago", l: "Approved transfer to known address 9aBcD", r: "low", icon: TrendingUp },
              { t: "Yesterday", l: "Blocked: drainer signature match", r: "high", icon: AlertTriangle },
            ].map((e, i) => (
              <li key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <e.icon className={`h-4 w-4 ${e.r === "high" ? "text-threat" : "text-safe"}`} />
                  <div>
                    <p className="text-sm">{e.l}</p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{e.t}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${e.r === "high" ? "bg-threat/15 text-threat" : "bg-safe/15 text-safe"}`}>
                  {e.r}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
