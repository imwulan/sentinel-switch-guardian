import { ArrowUpRight, ArrowLeftRight, Sparkles, FileSignature, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

type Risk = "low" | "medium" | "high";
type Item = {
  id: string;
  kind: "send" | "swap" | "mint" | "contract" | "stake";
  label: string;
  detail: string;
  time: string;
  risk: Risk;
};

const items: Item[] = [
  { id: "1", kind: "swap", label: "Swap", detail: "12.5 SOL → USDC · Jupiter", time: "2s ago", risk: "low" },
  { id: "2", kind: "contract", label: "Contract call", detail: "Unknown program · approve(∞)", time: "47s ago", risk: "high" },
  { id: "3", kind: "send", label: "Transfer", detail: "0.8 SOL → 7Hk2…q9Lm", time: "3m ago", risk: "low" },
  { id: "4", kind: "mint", label: "NFT mint", detail: "Tensorian #2841", time: "12m ago", risk: "medium" },
  { id: "5", kind: "stake", label: "Stake", detail: "150 SOL → Marinade", time: "1h ago", risk: "low" },
  { id: "6", kind: "swap", label: "Swap", detail: "USDC → BONK · Raydium", time: "2h ago", risk: "low" },
];

const iconMap = {
  send: ArrowUpRight,
  swap: ArrowLeftRight,
  mint: Sparkles,
  contract: FileSignature,
  stake: Coins,
};

const riskStyle: Record<Risk, string> = {
  low: "text-safe bg-safe/10 border-safe/30",
  medium: "text-warn bg-warn/10 border-warn/30",
  high: "text-threat bg-threat/10 border-threat/30",
};

export function ActivityFeed() {
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
              <span className="hidden text-xs text-muted-foreground sm:inline">{it.time}</span>
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
      </ul>
    </section>
  );
}
