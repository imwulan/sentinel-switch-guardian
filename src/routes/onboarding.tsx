import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, Check, ArrowRight, ArrowLeft, Wallet, Brain, Bell, Zap } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useSentinel } from "@/providers/SentinelProvider";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
  head: () => ({
    meta: [
      { title: "Get started — Sentinel Switch" },
      { name: "description", content: "Activate your behavioral AI firewall in under 60 seconds." },
    ],
  }),
});

const STEPS = [
  { id: "connect", title: "Connect wallet", icon: Wallet, desc: "Read-only — we never sign anything." },
  { id: "baseline", title: "Build baseline", icon: Brain, desc: "Sentinel observes your past 7 days." },
  { id: "alerts", title: "Choose alerts", icon: Bell, desc: "Where should we ping you?" },
  { id: "thresholds", title: "Set risk levels", icon: Zap, desc: "Tune sensitivity to your style." },
  { id: "done", title: "All set", icon: Check, desc: "Sentinel is now watching." },
];

function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { connectedWallet } = useSentinel();
  const Current = STEPS[step].icon;

  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : navigate({ to: "/app" }));
  const back = () => step > 0 && setStep(step - 1);

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-30" />
      <main className="relative mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8 md:py-12">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-secondary glow-safe">
              <Shield className="h-4 w-4 text-safe" />
            </div>
            <span className="font-semibold">Sentinel Switch</span>
          </Link>
          <Link to="/app" className="text-xs text-muted-foreground hover:text-foreground">
            Skip →
          </Link>
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-safe" : "bg-secondary"}`} />
            ))}
          </div>
          <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </p>
        </div>

        <section className="glass flex-1 rounded-3xl p-8 md:p-12">
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-safe/15 text-safe">
            <Current className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{STEPS[step].title}</h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">{STEPS[step].desc}</p>

          <div className="mt-8">
            {step === 0 && <ConnectStep walletConnected={!!connectedWallet} />}
            {step === 1 && <BaselineStep />}
            {step === 2 && <AlertsStep />}
            {step === 3 && <ThresholdsStep />}
            {step === 4 && <DoneStep />}
          </div>
        </section>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-4 py-2.5 text-sm font-medium text-foreground/90 disabled:opacity-40"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <button
            onClick={next}
            className="inline-flex items-center gap-2 rounded-xl bg-safe px-5 py-2.5 text-sm font-bold text-background hover:scale-[1.02]"
          >
            {step === STEPS.length - 1 ? "Open dashboard" : "Continue"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </main>
    </div>
  );
}

function ConnectStep({ walletConnected }: { walletConnected: boolean }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-secondary/40 p-5">
        <p className="text-xs text-muted-foreground">Sentinel is non-custodial. Connecting only lets us watch — never sign.</p>
      </div>
      <WalletMultiButton className="!h-11 !w-full !justify-center !rounded-xl !bg-safe/15 !font-semibold !text-safe hover:!bg-safe/25" />
      {walletConnected && (
        <p className="flex items-center gap-2 text-xs text-safe">
          <Check className="h-3.5 w-3.5" /> Wallet connected. You can continue.
        </p>
      )}
    </div>
  );
}

function BaselineStep() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">We'll analyze your last 7 days of on-chain activity to build your behavioral fingerprint.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { l: "Counterparties", v: "147" },
          { l: "Avg tx size", v: "2.4 SOL" },
          { l: "Active hours", v: "9–23 UTC" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl bg-secondary/40 p-4">
            <p className="font-mono text-lg font-bold text-safe">{s.v}</p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertsStep() {
  const channels = [
    { id: "push", l: "Browser push", on: true },
    { id: "tg", l: "Telegram", on: true },
    { id: "email", l: "Email digest", on: false },
    { id: "wh", l: "Webhook", on: false },
  ];
  return (
    <div className="space-y-2">
      {channels.map((c) => (
        <label key={c.id} className="flex cursor-pointer items-center justify-between rounded-xl bg-secondary/40 p-4 hover:bg-secondary/60">
          <span className="text-sm">{c.l}</span>
          <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${c.on ? "bg-safe" : "bg-secondary"}`}>
            <span className={`block h-4 w-4 rounded-full bg-background transition-transform ${c.on ? "translate-x-4" : ""}`} />
          </span>
        </label>
      ))}
    </div>
  );
}

function ThresholdsStep() {
  const [v, setV] = useState(60);
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Risk threshold</span>
          <span className="font-mono text-sm font-bold text-safe">{v}/100</span>
        </div>
        <input type="range" min="0" max="100" value={v} onChange={(e) => setV(+e.target.value)} className="mt-3 w-full accent-[oklch(var(--safe))]" />
        <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Permissive</span><span>Balanced</span><span>Strict</span>
        </div>
      </div>
      <div className="rounded-xl bg-secondary/40 p-4 text-xs text-muted-foreground">
        At <span className="text-safe font-semibold">{v}</span>, Sentinel will block ~12 anomalies per month based on similar wallets.
      </div>
    </div>
  );
}

function DoneStep() {
  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-safe/15 glow-safe">
        <Check className="h-9 w-9 text-safe" />
      </div>
      <p className="text-sm text-muted-foreground">Your wallet is now under Sentinel protection.</p>
    </div>
  );
}
