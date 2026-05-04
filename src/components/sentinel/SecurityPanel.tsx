import { Lock, ShieldCheck } from "lucide-react";
import type { SentinelEvent } from "@/lib/sentinel-types";

export function SecurityPanel({
  confidence = 96,
  events,
}: {
  confidence?: number;
  events: SentinelEvent[];
}) {
  const highRisk = events.filter((e) => e.risk === "high").length;
  const lastBlocked = events.find((e) => e.risk === "high");
  const lastBlockedTime = lastBlocked
    ? `${Math.max(1, Math.floor((Date.now() - lastBlocked.timestamp) / 60000))}m ago`
    : "No recent threats";

  return (
    <section className="glass rounded-2xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-safe" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Firewall
          </h2>
        </div>
        <div className="glass flex items-center gap-2 rounded-full px-2.5 py-1">
          <Lock className="h-3 w-3 text-safe" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-safe">Active</span>
        </div>
      </div>

      <div className="mb-5 flex items-center gap-3">
        <div className="relative h-7 w-12 rounded-full bg-safe/30 glow-safe">
          <div className="absolute right-0.5 top-0.5 h-6 w-6 rounded-full bg-safe" />
        </div>
        <p className="text-xs text-muted-foreground">Locked while protection is on</p>
      </div>

      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">AI confidence</span>
          <span className="font-mono text-safe">{confidence}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-safe glow-safe"
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4 text-xs">
        <div>
          <p className="text-muted-foreground">Last threat blocked</p>
          <p className="mt-0.5 font-mono">{lastBlockedTime}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Threats this week</p>
          <p className="mt-0.5 font-mono text-safe">{highRisk} flagged</p>
        </div>
      </div>
    </section>
  );
}
