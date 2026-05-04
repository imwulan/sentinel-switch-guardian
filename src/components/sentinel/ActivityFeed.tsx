import { ArrowUpRight, ArrowLeftRight, Sparkles, FileSignature } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SentinelEvent } from "@/lib/sentinel-types";

const iconMap = {
  transfer: ArrowUpRight,
  swap: ArrowLeftRight,
  program_call: FileSignature,
  unknown: Sparkles,
};

const riskStyle = {
  low: "text-safe bg-safe/10 border-safe/30",
  medium: "text-warn bg-warn/10 border-warn/30",
  high: "text-threat bg-threat/10 border-threat/30",
};

function relativeTime(timestamp: number) {
  const sec = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  return `${hrs}h ago`;
}

export function ActivityFeed({ items }: { items: SentinelEvent[] }) {
  return (
    <section className="glass rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Live Activity
        </h2>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-safe ticker" />
          live
        </span>
      </div>

      <ul className="divide-y divide-border/40">
        {items.map((it) => {
          const Icon = iconMap[it.kind];
          return (
            <li key={it.id} className="flex items-center gap-4 py-3 transition-colors hover:bg-white/[0.02]">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary">
                <Icon className="h-4 w-4 text-foreground/80" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{it.label}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">{it.detail}</p>
              </div>
              <span className="hidden text-xs text-muted-foreground sm:inline">{relativeTime(it.timestamp)}</span>
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  riskStyle[it.risk]
                )}
              >
                {it.risk}
              </span>
            </li>
          );
        })}
        {items.length === 0 && (
          <li className="py-8 text-center text-xs text-muted-foreground">
            Connect a wallet to stream activity.
          </li>
        )}
      </ul>
    </section>
  );
}
