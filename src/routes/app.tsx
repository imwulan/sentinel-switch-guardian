import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/sentinel/Header";
import { BehaviorPanel } from "@/components/sentinel/BehaviorPanel";
import { ActivityFeed } from "@/components/sentinel/ActivityFeed";
import { SecurityPanel } from "@/components/sentinel/SecurityPanel";
import { AnomalyModal } from "@/components/sentinel/AnomalyModal";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSentinel } from "@/providers/SentinelProvider";
import type { WalletStatus } from "@/components/sentinel/StatusBadge";
import { AlertTriangle, Home, Activity, Bell, Settings, Wallet, Brain, ShieldCheck, ShieldAlert, Zap, Sparkles, X } from "lucide-react";
import { DEMO_BALANCE_SOL, DEMO_EVENTS, DEMO_WALLET_FULL, DEMO_WALLET_SHORT } from "@/lib/demo";

export const Route = createFileRoute("/app")({
  component: AppDashboard,
  head: () => ({
    meta: [
      { title: "Dashboard — Sentinel Switch" },
      { name: "description", content: "Live behavioral firewall dashboard for your Solana wallets." },
    ],
  }),
});

function AppDashboard() {
  const { selectedWallet, events, settings, simulate } = useSentinel();
  const [open, setOpen] = useState(false);
  const [txToSimulate, setTxToSimulate] = useState("");
  const [simState, setSimState] = useState<"idle" | "loading" | "done">("idle");
  const [simSummary, setSimSummary] = useState<string>("");
  const [demoDismissed, setDemoDismissed] = useState(false);

  const isDemo = !selectedWallet && events.length === 0;
  const displayWallet = isDemo ? DEMO_WALLET_FULL : (selectedWallet ?? "No wallet connected");
  const displayEvents = isDemo ? DEMO_EVENTS : events;

  const status = useMemo<WalletStatus>(() => {
    if (displayEvents.some((e) => e.risk === "high")) return "threat";
    if (displayEvents.some((e) => e.risk === "medium")) return "suspicious";
    return "normal";
  }, [displayEvents]);

  const trigger = () => setOpen(true);

  const runSimulation = async () => {
    if (!txToSimulate.trim()) {
      toast.error("Paste a base64 transaction first");
      return;
    }
    setSimState("loading");
    const result = await simulate(txToSimulate.trim());
    setSimState("done");
    if (!result.ok) {
      setSimSummary(`Simulation failed: ${result.error ?? "Unknown error"}`);
      toast.error("Simulation failed");
      return;
    }
    setSimSummary(`Simulation passed. Logs: ${result.logs.slice(-3).join(" | ") || "No logs."}`);
    toast.success("Simulation completed");
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-40" />
      <main className="relative mx-auto max-w-7xl space-y-5 p-4 md:p-6">
        {isDemo && !demoDismissed && <DemoBanner onDismiss={() => setDemoDismissed(true)} />}
        <Header status={status} wallet={displayWallet} />
        <SubNav />
        <Hero onTrigger={trigger} status={status} isDemo={isDemo} />
        <ThreatTicker />
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <AIScoreCard status={status} isDemo={isDemo} />
            <BehaviorPanel />
            <ActivityFeed items={displayEvents} />
          </div>
          <div className="space-y-5">
            <SecurityPanel events={displayEvents} />
            <SimulationCard onSimulate={runSimulation} value={txToSimulate} onChange={setTxToSimulate} status={simState} summary={simSummary} />
            <SwitchCard onTrigger={trigger} />
          </div>
        </div>
      </main>

      <nav className="glass-strong fixed bottom-3 left-3 right-3 z-20 grid grid-cols-5 rounded-2xl px-2 py-2 md:hidden">
        {[
          { icon: Home, label: "Home", to: "/app" },
          { icon: Wallet, label: "Wallets", to: "/wallets" },
          { icon: Activity, label: "Audit", to: "/audit" },
          { icon: Bell, label: "Alerts", to: "/alerts" },
          { icon: Settings, label: "Settings", to: "/settings" },
        ].map(({ icon: Icon, label, to }) => (
          <Link
            key={label}
            to={to}
            activeOptions={{ exact: true }}
            className="flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] uppercase tracking-wider text-muted-foreground"
            activeProps={{ className: "flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] uppercase tracking-wider text-safe" }}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <AnomalyModal
        open={open}
        countdown={settings.countdown}
        onApprove={() => setOpen(false)}
        onKill={() => setOpen(false)}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

function SimulationCard({ value, onChange, onSimulate, status, summary }: { value: string; onChange: (n: string) => void; onSimulate: () => void; status: "idle" | "loading" | "done"; summary: string; }) {
  return (
    <section className="glass rounded-2xl p-6">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Pre-sign simulation</h2>
      <p className="mb-4 text-xs text-muted-foreground">Paste a base64 Solana transaction to dry-run before signing.</p>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder="AQAAAAAAAAAAAA..." className="mb-3 min-h-20 font-mono text-xs" />
      <button onClick={onSimulate} className="rounded-xl bg-safe/15 px-4 py-2 text-xs font-semibold text-safe hover:bg-safe/25">
        {status === "loading" ? "Simulating..." : "Run simulation"}
      </button>
      {summary ? <p className="mt-3 text-xs text-muted-foreground">{summary}</p> : null}
    </section>
  );
}

function Hero({ onTrigger, status, isDemo }: { onTrigger: () => void; status: WalletStatus; isDemo?: boolean }) {
  return (
    <section className="glass relative overflow-hidden rounded-3xl p-7 md:p-10 scanline">
      <div className="relative z-10 grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-safe/30 bg-safe/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-safe">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-safe opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-safe" />
            </span>
            Guardian online{isDemo ? " · Demo" : ""}
          </p>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            Your wallet, <span className="text-safe">watched</span> by an AI that learns how <em className="not-italic text-foreground/80">you</em> move.
          </h2>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
            Sentinel Switch builds a behavioral fingerprint of your on-chain activity and freezes anything that doesn't fit. One tap to approve. One tap to kill.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button onClick={onTrigger} className="group inline-flex items-center gap-2 rounded-xl bg-threat px-5 py-3 text-sm font-bold uppercase tracking-wider text-white glow-threat transition-transform hover:scale-[1.03]">
              <AlertTriangle className="h-4 w-4" />
              Simulate threat
            </button>
            <button className="rounded-xl border border-border bg-secondary/60 px-5 py-3 text-sm font-medium text-foreground/90 transition-colors hover:bg-secondary">View baseline</button>
          </div>
        </div>
        <div className="relative grid place-items-center">
          <div className="absolute h-56 w-56 rounded-full bg-safe/10 blur-3xl" />
          <div className="relative grid h-44 w-44 place-items-center rounded-full border border-safe/30 bg-secondary/40 glow-safe pulse-safe">
            <div className="grid h-32 w-32 place-items-center rounded-full bg-background/60 backdrop-blur">
              <div className="text-center">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Status</p>
                <p className={`mt-1 text-lg font-bold ${status === "threat" ? "text-threat" : status === "suspicious" ? "text-warn" : "text-safe"}`}>
                  {status === "threat" ? "Threat" : status === "suspicious" ? "Suspicious" : "Secured"}
                </p>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">SOL · mainnet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SwitchCard({ onTrigger }: { onTrigger: () => void }) {
  return (
    <section className="glass rounded-2xl p-6">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">The Switch</h2>
      <p className="mb-5 text-xs text-muted-foreground">Manual override for the next pending transaction.</p>
      <div className="grid gap-3">
        <button className="group rounded-xl border border-safe/30 bg-safe/10 px-4 py-3.5 text-sm font-semibold text-safe transition-all hover:bg-safe/20 hover:glow-safe">✓ Approve next action</button>
        <button onClick={onTrigger} className="rounded-xl bg-threat px-4 py-3.5 text-sm font-bold uppercase tracking-wide text-white glow-threat transition-transform hover:scale-[1.02]">⛔ Kill Process</button>
        <Link to="/panic" className="rounded-xl border border-threat/40 bg-threat/10 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-threat hover:bg-threat/20">
          Panic Mode → Revoke all approvals
        </Link>
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">If no decision is made within the countdown, Sentinel Switch will auto-block the transaction by default.</p>
    </section>
  );
}

function SubNav() {
  const items = [
    { to: "/app", label: "Dashboard", icon: Home },
    { to: "/wallets", label: "Wallets", icon: Wallet },
    { to: "/intel", label: "Threat intel", icon: Brain },
    { to: "/audit", label: "Audit log", icon: Activity },
    { to: "/alerts", label: "Alerts", icon: Bell },
    { to: "/panic", label: "Panic", icon: ShieldAlert },
    { to: "/pricing", label: "Pricing", icon: Zap },
    { to: "/settings", label: "Settings", icon: Settings },
  ];
  return (
    <nav className="hidden md:block">
      <div className="glass flex flex-wrap gap-1 rounded-2xl p-1.5">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            activeProps={{ className: "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium bg-safe/15 text-safe" }}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function ThreatTicker() {
  const items = [
    "🚨 Drainer cluster active — 12 wallets compromised in the last hour",
    "⚠️ Program Pdr…7Xa2 flagged as malicious (98% confidence)",
    "🛡 23,901 wallets currently protected by Sentinel",
    "🔥 $RUGME token confirmed honeypot — 100% buy tax",
  ];
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="flex animate-[marquee_40s_linear_infinite] gap-12 whitespace-nowrap px-4 py-2.5 text-xs text-muted-foreground">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-safe" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function AIScoreCard({ status }: { status: WalletStatus }) {
  const score = status === "threat" ? 88 : status === "suspicious" ? 52 : 14;
  const color = score >= 70 ? "text-threat" : score >= 35 ? "text-warn" : "text-safe";
  const ring = score >= 70 ? "stroke-threat" : score >= 35 ? "stroke-warn" : "stroke-safe";
  const offset = 264 - (264 * score) / 100;
  return (
    <section className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Live AI risk score</h2>
          <p className="mt-1 text-xs text-muted-foreground">Composite of 142 behavioral, on-chain, and intel signals.</p>
        </div>
        <Brain className="h-5 w-5 text-safe" />
      </div>
      <div className="mt-6 grid grid-cols-[auto_1fr] items-center gap-6">
        <div className="relative h-28 w-28">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="42" strokeWidth="8" className="stroke-secondary" fill="none" />
            <circle cx="50" cy="50" r="42" strokeWidth="8" fill="none" strokeLinecap="round" className={ring} strokeDasharray="264" strokeDashoffset={offset} />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className={`font-mono text-2xl font-bold ${color}`}>{score}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">/ 100</p>
            </div>
          </div>
        </div>
        <ul className="space-y-2 text-xs">
          {[
            { l: "Behavioral fit", v: status === "threat" ? "Off-baseline" : "Matches baseline", c: status === "threat" ? "text-threat" : "text-safe" },
            { l: "Counterparty trust", v: status === "threat" ? "Unknown program" : "Allowlisted", c: status === "threat" ? "text-warn" : "text-safe" },
            { l: "Velocity", v: "Within normal", c: "text-safe" },
            { l: "Intel match", v: status === "threat" ? "Drainer signature" : "Clean", c: status === "threat" ? "text-threat" : "text-safe" },
          ].map((s) => (
            <li key={s.l} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-1.5">
              <span className="text-muted-foreground">{s.l}</span>
              <span className={`font-medium ${s.c}`}>{s.v}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
