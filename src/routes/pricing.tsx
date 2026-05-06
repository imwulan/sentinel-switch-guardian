import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/sentinel/Header";
import { useSentinel } from "@/providers/SentinelProvider";
import { ArrowLeft, Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({ meta: [{ title: "Pricing — Sentinel Switch" }] }),
});

const tiers = [
  {
    name: "Guardian",
    price: "Free",
    desc: "For single wallets — basic AI firewall.",
    features: ["1 wallet", "Behavioral baseline", "Manual kill switch", "Mobile push alerts"],
    cta: "Current plan",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$9 /mo",
    desc: "For active traders & power users.",
    features: ["5 wallets", "Advanced AI scoring", "Pre-sign simulation", "Telegram + Email alerts", "Custom risk thresholds", "7-day audit retention"],
    cta: "Upgrade to Pro",
    highlight: true,
  },
  {
    name: "Teams",
    price: "$99 /mo",
    desc: "For DAOs, treasuries & multisigs.",
    features: ["Unlimited wallets", "Multisig protection", "Slack / Discord webhooks", "Role-based access", "Compliance audit export", "SLA + dedicated support"],
    cta: "Talk to sales",
    highlight: false,
  },
];

function PricingPage() {
  const { selectedWallet } = useSentinel();
  return (
    <div className="min-h-screen pb-12">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-40" />
      <main className="relative mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        <Header status="normal" wallet={selectedWallet ?? "No wallet connected"} />

        <Link to="/app" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>

        <section className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Protection that <span className="text-safe">scales</span> with you.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Start free for personal wallets. Upgrade as you protect more value.
          </p>
        </section>

        <div className="grid gap-5 md:grid-cols-3">
          {tiers.map((t) => (
            <article
              key={t.name}
              className={`glass relative rounded-2xl p-6 ${t.highlight ? "border-safe/40 glow-safe" : ""}`}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-safe px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-background">
                  Most popular
                </span>
              )}
              <h2 className="text-lg font-semibold">{t.name}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
              <p className="mt-4 font-mono text-3xl">{t.price}</p>
              <ul className="mt-5 space-y-2">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-safe" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-semibold ${
                  t.highlight
                    ? "bg-safe text-background hover:bg-safe/90"
                    : "border border-border bg-secondary/60 hover:bg-secondary"
                }`}
              >
                {t.cta}
              </button>
            </article>
          ))}
        </div>

        <section className="glass rounded-2xl p-6 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include real-time anomaly detection, kill switch, and on-chain transparency.
          </p>
        </section>
      </main>
    </div>
  );
}
