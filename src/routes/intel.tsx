import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/sentinel/Header";
import { useSentinel } from "@/providers/SentinelProvider";
import { ArrowLeft, Brain, Flame, Skull, ShieldCheck, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/intel")({
  component: IntelPage,
  head: () => ({ meta: [{ title: "Threat intel — Sentinel Switch" }] }),
});

const feed = [
  { kind: "scam", title: "Drainer cluster active", body: "12 wallets in last hour signed malicious tx via fake Jupiter site.", t: "live" },
  { kind: "program", title: "Program flagged", body: "Pdr…7Xa2 — pattern matches known token-drainer (98% confidence).", t: "12m" },
  { kind: "token", title: "Honeypot token", body: "$RUGME — 100% buy tax, sells fail. Avoid.", t: "1h" },
  { kind: "trend", title: "Phishing wave", body: "Spike in fake airdrop signatures across mainnet.", t: "3h" },
];

const icon = { scam: Skull, program: Flame, token: ShieldCheck, trend: TrendingUp };
const tone = {
  scam: "text-threat bg-threat/10 border-threat/30",
  program: "text-warn bg-warn/10 border-warn/30",
  token: "text-warn bg-warn/10 border-warn/30",
  trend: "text-safe bg-safe/10 border-safe/30",
};

function IntelPage() {
  const { selectedWallet } = useSentinel();
  return (
    <div className="min-h-screen pb-12">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-40" />
      <main className="relative mx-auto max-w-5xl space-y-5 p-4 md:p-6">
        <Header status="normal" wallet={selectedWallet ?? "No wallet connected"} />

        <Link to="/app" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>

        <section className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Brain className="h-5 w-5 text-safe" />
            <h1 className="text-2xl font-semibold tracking-tight">Threat intelligence</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time threat feed cross-referenced with our AI model + community-flagged programs.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { l: "Devnet Monitoring Active", v: "Active", c: "text-safe" },
            { l: "Active drainer clusters", v: "7", c: "text-threat" },
            { l: "Beta Security Engine", v: "Online", c: "text-foreground" },
          ].map((s) => (
            <div key={s.l} className="glass rounded-2xl p-5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.l}</p>
              <p className={`mt-2 font-mono text-3xl ${s.c}`}>{s.v}</p>
            </div>
          ))}
        </div>

        <section className="glass rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Live feed</h2>
          <ul className="space-y-3">
            {feed.map((f, i) => {
              const Icon = icon[f.kind as keyof typeof icon];
              return (
                <li key={i} className="flex gap-4 rounded-xl bg-secondary/40 p-4">
                  <div className={`grid h-10 w-10 place-items-center rounded-xl border ${tone[f.kind as keyof typeof tone]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{f.title}</p>
                      <span className="text-[11px] text-muted-foreground">{f.t}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{f.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}
