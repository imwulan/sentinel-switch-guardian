import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Shield, ShieldCheck, Brain, Zap, Activity, Lock, Eye, AlertTriangle,
  ArrowRight, Check, Sparkles, Github, Twitter,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Sentinel Switch — Behavioral AI Firewall on Solana" },
      {
        name: "description",
        content:
          "Stop drainers before they drain. Sentinel Switch learns how you move on-chain and freezes anything that doesn't fit. One tap to approve. One tap to kill.",
      },
      { property: "og:title", content: "Sentinel Switch — Behavioral AI Firewall on Solana" },
      { property: "og:description", content: "AI-powered behavioral firewall for Solana wallets." },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-30" />

      <Nav />

      <main className="relative mx-auto max-w-6xl px-4 md:px-6">
        <Hero />
        <Logos />
        <Stats />
        <Features />
        <HowItWorks />
        <Testimonials />
        <PricingTeaser />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="relative z-30">
      <div className="glass-strong mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary glow-safe">
            <Shield className="h-4 w-4 text-safe" strokeWidth={2.4} />
          </div>
          <span className="font-semibold tracking-tight">Sentinel Switch</span>
        </Link>
        <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
          <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
          <Link to="/intel" className="hover:text-foreground">Threat intel</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/onboarding" className="hidden rounded-xl border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium hover:bg-secondary md:inline-flex">
            Get started
          </Link>
          <Link to="/app" className="inline-flex items-center gap-1.5 rounded-xl bg-safe/15 px-3 py-1.5 text-xs font-semibold text-safe hover:bg-safe/25">
            Launch app <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative pt-20 pb-24 text-center md:pt-28 md:pb-32">
      <div className="absolute left-1/2 top-10 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-safe/10 blur-[120px]" />
      <p className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-safe/30 bg-safe/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-safe">
        <Sparkles className="h-3 w-3" />
        Live on Solana mainnet
      </p>
      <h1 className="mx-auto max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
        Stop drainers before <br className="hidden md:inline" />
        they <span className="text-threat">drain</span>.
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
        Sentinel Switch is a behavioral AI firewall for Solana wallets. It learns how you move,
        watches every transaction, and freezes anything suspicious — before you sign.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link to="/onboarding" className="inline-flex items-center gap-2 rounded-xl bg-safe px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-background glow-safe transition-transform hover:scale-[1.03]">
          Protect my wallet <ArrowRight className="h-4 w-4" />
        </Link>
        <Link to="/app" className="rounded-xl border border-border bg-secondary/60 px-6 py-3.5 text-sm font-medium hover:bg-secondary">
          See live dashboard
        </Link>
      </div>
      <p className="mt-5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        Free during beta · Non-custodial · Open source
      </p>
    </section>
  );
}

function Logos() {
  return (
    <section className="border-y border-border/50 py-8">
      <p className="mb-5 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Trusted by wallets, DAOs and traders across
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 font-mono text-sm text-muted-foreground/70">
        <span>Phantom</span>
        <span>Solflare</span>
        <span>Backpack</span>
        <span>Jupiter</span>
        <span>Tensor</span>
        <span>Marginfi</span>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { v: "23,901", l: "Wallets protected" },
    { v: "$48.2M", l: "Threats blocked" },
    { v: "142", l: "Behavioral signals" },
    { v: "<400ms", l: "Decision latency" },
  ];
  return (
    <section className="grid grid-cols-2 gap-3 py-14 md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.l} className="glass rounded-2xl p-5 text-center">
          <p className="font-mono text-2xl font-bold text-safe md:text-3xl">{s.v}</p>
          <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{s.l}</p>
        </div>
      ))}
    </section>
  );
}

function Features() {
  const items = [
    { icon: Brain, title: "Behavioral fingerprint", desc: "An AI baseline of your on-chain habits — counterparties, sizes, timing, programs." },
    { icon: AlertTriangle, title: "Anomaly detection", desc: "Real-time scoring catches drainers, phishing approvals, and impostor programs." },
    { icon: Lock, title: "Pre-sign simulation", desc: "Every transaction is dry-run before you sign. See balance deltas, not blind hashes." },
    { icon: Zap, title: "Kill Switch", desc: "One tap freezes all activity. Auto-block by default if you don't decide in time." },
    { icon: Eye, title: "Threat intel network", desc: "Community-flagged programs, drainer clusters, and honeypots — updated live." },
    { icon: Activity, title: "Audit-ready logs", desc: "Every Sentinel decision exported with full reasoning, scores and confidence." },
  ];
  return (
    <section id="features" className="py-20">
      <div className="mb-12 text-center">
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-safe">Features</p>
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">A guardian, not a gate.</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Sentinel Switch never holds your keys. It just stands watch and gives you the kill switch.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map(({ icon: Icon, title, desc }) => (
          <article key={title} className="glass rounded-2xl p-6 transition-colors hover:bg-secondary/30">
            <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-safe/10 text-safe">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Connect", d: "Link your wallet read-only. We never touch your keys or signing flow." },
    { n: "02", t: "Learn", d: "Sentinel observes 7 days of activity to build your behavioral baseline." },
    { n: "03", t: "Watch", d: "Every new transaction is scored against 142 signals in under 400ms." },
    { n: "04", t: "Decide", d: "Approve, kill, or let auto-block trigger. You stay in control, always." },
  ];
  return (
    <section id="how" className="py-20">
      <div className="mb-12 text-center">
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-safe">How it works</p>
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Set up in 60 seconds.</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {steps.map((s) => (
          <div key={s.n} className="glass rounded-2xl p-6">
            <p className="font-mono text-3xl font-bold text-safe/80">{s.n}</p>
            <h3 className="mt-3 text-base font-semibold">{s.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    { q: "Sentinel caught a fake Jupiter program before I signed. Saved me 14 SOL.", a: "@degen.sol", r: "Trader" },
    { q: "We route every treasury proposal through Sentinel now. Non-negotiable.", a: "Ops Lead", r: "DAO" },
    { q: "Finally a wallet guard that learns me instead of asking 'are you sure?'.", a: "@cryptojen", r: "Builder" },
  ];
  return (
    <section className="py-20">
      <div className="grid gap-4 md:grid-cols-3">
        {quotes.map((q) => (
          <figure key={q.a} className="glass rounded-2xl p-6">
            <ShieldCheck className="h-5 w-5 text-safe" />
            <blockquote className="mt-4 text-sm leading-relaxed text-foreground/90">"{q.q}"</blockquote>
            <figcaption className="mt-4 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{q.a}</span> · {q.r}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function PricingTeaser() {
  const tiers = [
    { name: "Guardian", price: "Free", items: ["1 wallet", "Behavioral baseline", "Pre-sign simulation"] },
    { name: "Pro", price: "$9/mo", items: ["10 wallets", "Threat intel feed", "Webhooks & Telegram"], featured: true },
    { name: "Teams", price: "Custom", items: ["Multisig & treasury", "Role-based access", "Priority signers"] },
  ];
  return (
    <section className="py-20">
      <div className="mb-10 text-center">
        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-safe">Pricing</p>
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Free forever for solo wallets.</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {tiers.map((t) => (
          <div key={t.name} className={`glass rounded-2xl p-6 ${t.featured ? "border border-safe/40 glow-safe" : ""}`}>
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t.name}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{t.price}</p>
            <ul className="mt-5 space-y-2 text-sm">
              {t.items.map((i) => (
                <li key={i} className="flex items-center gap-2 text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-safe" /> {i}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link to="/pricing" className="inline-flex items-center gap-1.5 text-sm font-medium text-safe hover:underline">
          Compare all plans <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20">
      <div className="glass relative overflow-hidden rounded-3xl p-10 text-center scanline md:p-16">
        <div className="absolute left-1/2 top-0 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-threat/20 blur-[100px]" />
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
          Your next signature could cost you everything.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground md:text-base">
          Or it could cost you nothing — because Sentinel was watching.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/onboarding" className="inline-flex items-center gap-2 rounded-xl bg-safe px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-background glow-safe transition-transform hover:scale-[1.03]">
            Activate Sentinel <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/app" className="rounded-xl border border-border bg-secondary/60 px-6 py-3.5 text-sm font-medium hover:bg-secondary">
            Open dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative mx-auto mt-12 max-w-6xl px-4 pb-10 md:px-6">
      <div className="glass flex flex-col items-center justify-between gap-4 rounded-2xl px-6 py-5 text-xs text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-safe" />
          <span>© 2026 Sentinel Switch · Built on Solana</span>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/intel" className="hover:text-foreground">Threat intel</Link>
          <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
          <a href="#" className="hover:text-foreground" aria-label="Twitter"><Twitter className="h-3.5 w-3.5" /></a>
          <a href="#" className="hover:text-foreground" aria-label="GitHub"><Github className="h-3.5 w-3.5" /></a>
        </div>
      </div>
    </footer>
  );
}
