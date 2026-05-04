import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Header } from "@/components/sentinel/Header";
import { BehaviorPanel } from "@/components/sentinel/BehaviorPanel";
import { ActivityFeed } from "@/components/sentinel/ActivityFeed";
import { SecurityPanel } from "@/components/sentinel/SecurityPanel";
import { AnomalyModal } from "@/components/sentinel/AnomalyModal";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSentinel } from "@/providers/SentinelProvider";
import type { WalletStatus } from "@/components/sentinel/StatusBadge";
import { AlertTriangle, Home, Activity, Bell, Settings } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Sentinel Switch — Behavioral AI Firewall on Solana" },
      {
        name: "description",
        content:
          "Sentinel Switch is a behavioral AI firewall for Solana wallets. Real-time anomaly detection, kill-switch protection, and on-chain trust.",
      },
    ],
  }),
});

function Index() {
  const { selectedWallet, events, settings, simulate } = useSentinel();
  const [open, setOpen] = useState(false);
  const [txToSimulate, setTxToSimulate] = useState("");
  const [simState, setSimState] = useState<"idle" | "loading" | "done">("idle");
  const [simSummary, setSimSummary] = useState<string>("");

  const status = useMemo<WalletStatus>(() => {
    if (events.some((e) => e.risk === "high")) return "threat";
    if (events.some((e) => e.risk === "medium")) return "suspicious";
    return "normal";
  }, [events]);

  const trigger = () => {
    setOpen(true);
  };
  const onApprove = () => {
    setOpen(false);
  };
  const onKill = () => {
    setOpen(false);
  };

  const runSimulation = async () => {
    if (!txToSimulate.trim()) {
      toast.error("Paste a base64 transaction first");
      return;
    }
    setSimState("loading");
    const result = await simulate(txToSimulate.trim());
    setSimState("done");
    if (!result.ok) {
      const reason = result.error ?? "Unknown simulation error";
      setSimSummary(`Simulation failed: ${reason}`);
      toast.error("Simulation failed");
      return;
    }
    const lines = result.logs.slice(-3).join(" | ");
    setSimSummary(`Simulation passed. Logs: ${lines || "No logs."}`);
    toast.success("Simulation completed");
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* ambient grid */}
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-40" />

      <main className="relative mx-auto max-w-7xl space-y-5 p-4 md:p-6">
        <Header
          status={status}
          wallet={selectedWallet ?? "No wallet connected"}
        />

        <Hero onTrigger={trigger} status={status} />

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <BehaviorPanel />
            <ActivityFeed items={events} />
          </div>
          <div className="space-y-5">
            <SecurityPanel events={events} />
            <SimulationCard
              onSimulate={runSimulation}
              value={txToSimulate}
              onChange={setTxToSimulate}
              status={simState}
              summary={simSummary}
            />
            <SwitchCard onTrigger={trigger} />
          </div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="glass-strong fixed bottom-3 left-3 right-3 z-20 grid grid-cols-4 rounded-2xl px-2 py-2 md:hidden">
        {[
          { icon: Home, label: "Home" },
          { icon: Activity, label: "Activity" },
          { icon: Bell, label: "Alerts" },
          { icon: Settings, label: "Settings" },
        ].map(({ icon: Icon, label }, i) => {
          const isSettings = label === "Settings";
          const className = `flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] uppercase tracking-wider ${
            i === 0 ? "text-safe" : "text-muted-foreground"
          }`;
          if (isSettings) {
            return (
              <Link key={label} to="/settings" className={className}>
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          }
          return (
            <button key={label} className={className}>
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </nav>

      <AnomalyModal
        open={open}
        countdown={settings.countdown}
        onApprove={onApprove}
        onKill={onKill}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

function SimulationCard({
  value,
  onChange,
  onSimulate,
  status,
  summary,
}: {
  value: string;
  onChange: (next: string) => void;
  onSimulate: () => void;
  status: "idle" | "loading" | "done";
  summary: string;
}) {
  return (
    <section className="glass rounded-2xl p-6">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Pre-sign simulation
      </h2>
      <p className="mb-4 text-xs text-muted-foreground">
        Paste a base64 Solana transaction to dry-run before signing.
      </p>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="AQAAAAAAAAAAAA..."
        className="mb-3 min-h-20 font-mono text-xs"
      />
      <button
        onClick={onSimulate}
        className="rounded-xl bg-safe/15 px-4 py-2 text-xs font-semibold text-safe hover:bg-safe/25"
      >
        {status === "loading" ? "Simulating..." : "Run simulation"}
      </button>
      {summary ? <p className="mt-3 text-xs text-muted-foreground">{summary}</p> : null}
    </section>
  );
}

function Hero({ onTrigger, status }: { onTrigger: () => void; status: WalletStatus }) {
  return (
    <section className="glass relative overflow-hidden rounded-3xl p-7 md:p-10 scanline">
      <div className="relative z-10 grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-safe/30 bg-safe/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-safe">
            <span className="h-1.5 w-1.5 rounded-full bg-safe ticker" />
            Guardian online
          </p>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            Your wallet, <span className="text-safe">watched</span> by an AI that
            learns how <em className="not-italic text-foreground/80">you</em> move.
          </h2>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
            Sentinel Switch builds a behavioral fingerprint of your on-chain activity and freezes
            anything that doesn't fit. One tap to approve. One tap to kill.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onTrigger}
              className="group inline-flex items-center gap-2 rounded-xl bg-threat px-5 py-3 text-sm font-bold uppercase tracking-wider text-white glow-threat transition-transform hover:scale-[1.03]"
            >
              <AlertTriangle className="h-4 w-4" />
              Simulate threat
            </button>
            <button className="rounded-xl border border-border bg-secondary/60 px-5 py-3 text-sm font-medium text-foreground/90 transition-colors hover:bg-secondary">
              View baseline
            </button>
          </div>
        </div>

        <div className="relative grid place-items-center">
          <div className="absolute h-56 w-56 rounded-full bg-safe/10 blur-3xl" />
          <div className="relative grid h-44 w-44 place-items-center rounded-full border border-safe/30 bg-secondary/40 glow-safe pulse-safe">
            <div className="grid h-32 w-32 place-items-center rounded-full bg-background/60 backdrop-blur">
              <div className="text-center">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Status
                </p>
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
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        The Switch
      </h2>
      <p className="mb-5 text-xs text-muted-foreground">
        Manual override for the next pending transaction.
      </p>

      <div className="grid gap-3">
        <button className="group rounded-xl border border-safe/30 bg-safe/10 px-4 py-3.5 text-sm font-semibold text-safe transition-all hover:bg-safe/20 hover:glow-safe">
          ✓ Approve next action
        </button>
        <button
          onClick={onTrigger}
          className="rounded-xl bg-threat px-4 py-3.5 text-sm font-bold uppercase tracking-wide text-white glow-threat transition-transform hover:scale-[1.02]"
        >
          ⛔ Kill Process
        </button>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        If no decision is made within the countdown, Sentinel Switch will auto-block the
        transaction by default.
      </p>
    </section>
  );
}
