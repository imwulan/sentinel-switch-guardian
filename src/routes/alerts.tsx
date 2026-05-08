import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/sentinel/Header";
import { useSentinel } from "@/providers/SentinelProvider";
import { ArrowLeft, Bell, CheckCircle2, Copy, MessageCircle, Send, XCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/alerts")({
  component: AlertsPage,
  head: () => ({ meta: [{ title: "Alerts — Sentinel Switch" }] }),
});

const recent = [
  { t: "2m ago", title: "High-risk swap blocked", body: "Unknown program drained 12.4 SOL — auto-killed.", level: "threat" },
  { t: "1h ago", title: "New device approved", body: "Phantom on iPhone (San Francisco).", level: "safe" },
  { t: "4h ago", title: "Velocity warning", body: "8 outflows in 60s exceeded baseline.", level: "warn" },
  { t: "yesterday", title: "Token allowance revoked", body: "Stale Magic Eden approval cleared.", level: "safe" },
];

const lvl = { threat: "text-threat", warn: "text-warn", safe: "text-safe" };

function AlertsPage() {
  const { selectedWallet } = useSentinel();
  const [telegramEnabled, setTelegramEnabled] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"idle" | "ok" | "error">("idle");

  const webhookUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/webhooks/helius`
    : "/api/webhooks/helius";

  const copyWebhook = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    toast.success("Webhook URL copied");
  };

  const testTelegram = async () => {
    setTesting(true);
    setTestResult("idle");
    try {
      const res = await fetch("/api/telegram-test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const data = await res.json() as { ok: boolean; error?: string };
      if (data.ok) {
        setTestResult("ok");
        toast.success("Test message sent to Telegram!");
      } else {
        setTestResult("error");
        toast.error(data.error ?? "Telegram test failed");
      }
    } catch {
      setTestResult("error");
      toast.error("Could not reach test endpoint");
    } finally {
      setTesting(false);
    }
  };

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
          <p className="mt-1 text-sm text-muted-foreground">Pick how Sentinel reaches you when a risk score exceeds 70.</p>
        </section>

        <section className="glass rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-safe/10">
              <MessageCircle className="h-4 w-4 text-safe" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Telegram alerts</h2>
                <Switch checked={telegramEnabled} onCheckedChange={setTelegramEnabled} />
              </div>
              <p className="text-xs text-muted-foreground">Fires instantly when risk score ≥ 70 on any monitored wallet.</p>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-border bg-secondary/30 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Setup instructions</p>

            <div className="space-y-2">
              <p className="text-xs"><span className="font-semibold text-foreground">Step 1 —</span> Message <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-safe underline">@BotFather</a> on Telegram and create a new bot. Copy the <span className="font-mono bg-secondary px-1 rounded text-[11px]">HTTP API token</span>.</p>
              <p className="text-xs"><span className="font-semibold text-foreground">Step 2 —</span> Message <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-safe underline">@userinfobot</a> to get your Telegram chat ID (or use a group ID).</p>
              <p className="text-xs"><span className="font-semibold text-foreground">Step 3 —</span> Add these two secrets in the Replit <span className="font-semibold text-foreground">Secrets</span> tab:</p>
              <div className="rounded-lg bg-background/60 p-3 font-mono text-[11px] space-y-1">
                <p><span className="text-safe">TELEGRAM_BOT_TOKEN</span> = <span className="text-muted-foreground">123456:ABCdef...</span></p>
                <p><span className="text-safe">TELEGRAM_CHAT_ID</span> = <span className="text-muted-foreground">-1001234567890</span></p>
              </div>
              <p className="text-xs text-muted-foreground">After adding secrets, restart the workflow to activate alerts.</p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={testTelegram}
                disabled={testing}
                className="inline-flex items-center gap-2 rounded-xl bg-safe/15 px-4 py-2 text-xs font-semibold text-safe hover:bg-safe/25 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {testing ? "Sending…" : "Send test message"}
              </button>
              {testResult === "ok" && (
                <span className="flex items-center gap-1.5 text-xs text-safe">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Delivered
                </span>
              )}
              {testResult === "error" && (
                <span className="flex items-center gap-1.5 text-xs text-threat">
                  <XCircle className="h-3.5 w-3.5" /> Failed — check secrets
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="glass rounded-2xl p-6">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Helius webhook URL</h2>
          <p className="mb-3 text-xs text-muted-foreground">Configure this in your Helius dashboard to stream transactions into Sentinel.</p>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-4 py-3">
            <code className="flex-1 truncate font-mono text-xs text-foreground">{webhookUrl}</code>
            <button onClick={copyWebhook} className="shrink-0 text-muted-foreground hover:text-foreground">
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>

        <section className="glass rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Recent alerts</h2>
          <ul className="space-y-3">
            {recent.map((r, i) => (
              <li key={i} className="flex gap-4 rounded-xl bg-secondary/40 p-4">
                <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full bg-current", lvl[r.level as keyof typeof lvl])} />
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
