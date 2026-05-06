import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/sentinel/Header";
import { useSentinel } from "@/providers/SentinelProvider";
import { ArrowLeft, Bell, Mail, MessageCircle, Smartphone, Webhook } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/alerts")({
  component: AlertsPage,
  head: () => ({ meta: [{ title: "Alerts — Sentinel Switch" }] }),
});

const channels = [
  { id: "push", icon: Smartphone, label: "Mobile push", desc: "Instant on iOS / Android", on: true },
  { id: "email", icon: Mail, label: "Email", desc: "Daily digest + critical alerts", on: false },
  { id: "telegram", icon: MessageCircle, label: "Telegram", desc: "@SentinelSwitchBot", on: true },
  { id: "discord", icon: MessageCircle, label: "Discord webhook", desc: "Pings #treasury channel", on: false },
  { id: "webhook", icon: Webhook, label: "Custom webhook", desc: "POST every event to your endpoint", on: false },
];

const recent = [
  { t: "2m ago", title: "High-risk swap blocked", body: "Unknown program drained 12.4 SOL — auto-killed.", level: "threat" },
  { t: "1h ago", title: "New device approved", body: "Phantom on iPhone (San Francisco).", level: "safe" },
  { t: "4h ago", title: "Velocity warning", body: "8 outflows in 60s exceeded baseline.", level: "warn" },
  { t: "yesterday", title: "Token allowance revoked", body: "Stale Magic Eden approval cleared.", level: "safe" },
];

const lvl = { threat: "text-threat", warn: "text-warn", safe: "text-safe" };

function AlertsPage() {
  const { selectedWallet } = useSentinel();
  return (
    <div className="min-h-screen pb-12">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-40" />
      <main className="relative mx-auto max-w-4xl space-y-5 p-4 md:p-6">
        <Header status="normal" wallet={selectedWallet ?? "No wallet connected"} />

        <Link to="/app" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>

        <section className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-safe" />
            <h1 className="text-2xl font-semibold tracking-tight">Alerts & notifications</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Pick how Sentinel reaches you when something off-pattern happens.</p>
        </section>

        <section className="glass rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Channels</h2>
          <ul className="divide-y divide-border/40">
            {channels.map((c) => (
              <li key={c.id} className="flex items-center gap-4 py-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary">
                  <c.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </div>
                <Switch defaultChecked={c.on} />
              </li>
            ))}
          </ul>
        </section>

        <section className="glass rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Recent alerts</h2>
          <ul className="space-y-3">
            {recent.map((r, i) => (
              <li key={i} className="flex gap-4 rounded-xl bg-secondary/40 p-4">
                <span className={`mt-1 h-2 w-2 rounded-full bg-current ${lvl[r.level as keyof typeof lvl]}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{r.title}</p>
                    <span className="text-[11px] text-muted-foreground">{r.t}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
