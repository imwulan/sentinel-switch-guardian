import { useEffect, useRef, useState } from "react";
import { Shield, ShieldCheck, Wallet, Brain, X, ArrowRight, Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Persistence ────────────────────────────────────────────────────────────
const ONBOARDING_KEY = "sentinel.onboarding.v1";

function hasSeenOnboarding(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(ONBOARDING_KEY) === "done";
}

function markOnboardingDone() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ONBOARDING_KEY, "done");
}

// ─── Wallet icon SVGs ────────────────────────────────────────────────────────
function PhantomIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 128 128" className={className} aria-label="Phantom wallet">
      <rect width="128" height="128" rx="28" fill="#AB9FF2" />
      <path
        d="M110.6 64.3c0 25.4-20.6 46-46 46-25.4 0-46-20.6-46-46s20.6-46 46-46c25.4 0 46 20.6 46 46Z"
        fill="#fff"
        fillOpacity=".15"
      />
      <path
        d="M96.5 55.5H83.2c-1.5-9.8-9.9-17.3-20.1-17.3-11.3 0-20.4 9.1-20.4 20.4 0 11.3 9.1 20.4 20.4 20.4 5.3 0 10.1-2 13.7-5.3h8.4c-4.3 7.8-12.6 13.1-22.1 13.1-13.9 0-25.2-11.3-25.2-25.2 0-13.9 11.3-25.2 25.2-25.2 12.8 0 23.4 9.5 25 21.9h8.4v-2.8Z"
        fill="#fff"
      />
      <circle cx="63.1" cy="58.6" r="6.5" fill="#AB9FF2" />
    </svg>
  );
}

function SolflareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 128 128" className={className} aria-label="Solflare wallet">
      <rect width="128" height="128" rx="28" fill="#FC8B24" />
      <path
        d="M64 22 L96 96 H32 Z"
        fill="none"
        stroke="#fff"
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <circle cx="64" cy="64" r="10" fill="#fff" />
    </svg>
  );
}

// ─── Animated progress bar ───────────────────────────────────────────────────
function BaselineProgressBar() {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 2800;

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(Math.round(eased * 73)); // stops at 73% — "in progress"
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Analyzing on-chain history…</span>
        <span className="font-mono text-safe">{progress}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-safe transition-all duration-300 ease-out"
          style={{ width: `${progress}%`, boxShadow: "0 0 12px oklch(0.85 0.22 145 / 0.6)" }}
        />
      </div>
    </div>
  );
}

// ─── Risk score ring (Step 3) ────────────────────────────────────────────────
function RiskRing({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(score * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [score]);

  const offset = 264 - (264 * displayed) / 100;

  return (
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r="42" strokeWidth="8" className="stroke-secondary" fill="none" />
        <circle
          cx="50"
          cy="50"
          r="42"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          className="stroke-safe transition-all duration-300"
          strokeDasharray="264"
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="font-mono text-xl font-bold tabular-nums text-safe">{displayed}</p>
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">/ 100</p>
        </div>
      </div>
    </div>
  );
}

// ─── Step content ────────────────────────────────────────────────────────────
function Step1({ onTryDemo, onConnect }: { onTryDemo: () => void; onConnect: () => void }) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Connect your Solana wallet to activate your behavioral firewall. Sentinel is non-custodial — we only observe, never sign.
      </p>

      {/* Wallet options */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onConnect}
          className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-secondary/40 p-5 transition-all hover:border-safe/40 hover:bg-safe/5"
        >
          <PhantomIcon className="h-12 w-12 transition-transform group-hover:scale-105" />
          <span className="text-sm font-medium">Phantom</span>
        </button>
        <button
          onClick={onConnect}
          className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-secondary/40 p-5 transition-all hover:border-safe/40 hover:bg-safe/5"
        >
          <SolflareIcon className="h-12 w-12 transition-transform group-hover:scale-105" />
          <span className="text-sm font-medium">Solflare</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        onClick={onTryDemo}
        className="w-full rounded-xl border border-safe/30 bg-safe/10 py-3 text-sm font-semibold text-safe transition-all hover:bg-safe/20"
      >
        <Zap className="mr-2 inline h-3.5 w-3.5" />
        Try Demo — no wallet needed
      </button>

      <p className="text-center text-[11px] text-muted-foreground">
        Read-only access · Non-custodial · No private keys
      </p>
    </div>
  );
}

function Step2() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Sentinel analyzes your on-chain history to build a behavioral fingerprint unique to you. This baseline is what the AI uses to detect anomalies.
      </p>

      <BaselineProgressBar />

      <div className="grid gap-3">
        {[
          { label: "Transaction patterns", status: "done" },
          { label: "Counterparty graph", status: "done" },
          { label: "Program interactions", status: "active" },
          { label: "Velocity baseline", status: "pending" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-3"
          >
            <span className="text-sm text-foreground/90">{item.label}</span>
            {item.status === "done" && (
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-safe">
                <Check className="h-3.5 w-3.5" /> Done
              </span>
            )}
            {item.status === "active" && (
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-warn">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-warn" />
                Scanning
              </span>
            )}
            {item.status === "pending" && (
              <span className="text-[11px] text-muted-foreground">Queued</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-safe/20 bg-safe/5 px-4 py-3 text-xs text-muted-foreground">
        <Brain className="mt-0.5 h-4 w-4 shrink-0 text-safe" />
        <p>
          Full baseline accuracy takes <span className="font-semibold text-foreground">~24 hours</span> of live observation. Sentinel starts protecting you immediately with a partial model.
        </p>
      </div>
    </div>
  );
}

function Step3() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Your behavioral firewall is live. Sentinel will block any transaction that deviates from your baseline and alert you in real time.
      </p>

      {/* Status card */}
      <div className="flex items-center gap-5 rounded-2xl border border-safe/30 bg-safe/5 p-5">
        <RiskRing score={14} />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-safe opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-safe" />
            </span>
            <span className="text-sm font-semibold text-safe">Secured</span>
          </div>
          <p className="text-xs text-muted-foreground">Risk score: <span className="font-mono font-semibold text-safe">14 / 100</span></p>
          <p className="text-xs text-muted-foreground">Firewall: <span className="font-medium text-foreground">Active</span></p>
        </div>
      </div>

      {/* Feature list */}
      <ul className="space-y-2.5">
        {[
          "Real-time anomaly detection on every transaction",
          "One-tap approve or kill-switch override",
          "Behavioral fingerprint updates continuously",
          "Threat intel from 23,000+ flagged programs",
        ].map((feat) => (
          <li key={feat} className="flex items-start gap-2.5 text-sm text-foreground/80">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-safe" />
            {feat}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Step config ─────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: "connect",
    icon: Wallet,
    title: "Connect your wallet",
    subtitle: "Step 1 of 3",
  },
  {
    id: "baseline",
    icon: Brain,
    title: "Sentinel learns your baseline",
    subtitle: "Step 2 of 3",
  },
  {
    id: "active",
    icon: ShieldCheck,
    title: "Your firewall is active",
    subtitle: "Step 3 of 3",
  },
];

// ─── Main modal ───────────────────────────────────────────────────────────────
export function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  // Show only for first-time visitors
  useEffect(() => {
    if (!hasSeenOnboarding()) {
      // Small delay so the dashboard renders first
      const id = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(id);
    }
  }, []);

  const dismiss = () => {
    markOnboardingDone();
    setOpen(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  };

  const handleConnect = () => next();
  const handleTryDemo = () => next();

  if (!open) return null;

  const current = STEPS[step];
  const StepIcon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Sentinel Switch"
    >
      {/* Dim overlay */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div className="animate-modal-in relative w-full max-w-md">
        {/* Subtle glow behind the card */}
        <div className="pointer-events-none absolute -inset-px rounded-3xl bg-safe/5 blur-xl" />

        <div className="glass-strong relative overflow-hidden rounded-3xl border border-white/10">
          {/* Top accent line */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-safe/60 to-transparent" />

          <div className="p-7">
            {/* Header row */}
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary glow-safe">
                  <Shield className="h-4 w-4 text-safe" strokeWidth={2.4} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Sentinel Switch</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Behavioral AI Firewall
                  </p>
                </div>
              </div>
              <button
                onClick={dismiss}
                aria-label="Skip onboarding"
                className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Progress dots */}
            <div className="mb-6 flex items-center gap-2">
              {STEPS.map((s, i) => (
                <div
                  key={s.id}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-all duration-500",
                    i < step
                      ? "bg-safe"
                      : i === step
                        ? "bg-safe/70"
                        : "bg-secondary",
                  )}
                />
              ))}
            </div>

            {/* Step icon + title */}
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-safe/15">
                <StepIcon className="h-5 w-5 text-safe" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {current.subtitle}
                </p>
                <h2 className="text-lg font-semibold leading-tight tracking-tight">
                  {current.title}
                </h2>
              </div>
            </div>

            {/* Step body */}
            <div className="min-h-[260px]">
              {step === 0 && (
                <Step1 onTryDemo={handleTryDemo} onConnect={handleConnect} />
              )}
              {step === 1 && <Step2 />}
              {step === 2 && <Step3 />}
            </div>

            {/* Footer actions */}
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                onClick={dismiss}
                className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                Skip for now
              </button>
              <button
                onClick={next}
                className="inline-flex items-center gap-2 rounded-xl bg-safe px-5 py-2.5 text-sm font-bold text-background transition-transform hover:scale-[1.03]"
              >
                {isLast ? "Open dashboard" : "Continue"}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export helper so tests / storybook can reset the flag
export { hasSeenOnboarding, markOnboardingDone };
