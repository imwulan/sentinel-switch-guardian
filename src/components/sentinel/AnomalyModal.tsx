import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onApprove: () => void;
  onKill: () => void;
  onClose: () => void;
};

export function AnomalyModal({ open, onApprove, onKill, onClose }: Props) {
  const [count, setCount] = useState(10);

  useEffect(() => {
    if (!open) {
      setCount(10);
      return;
    }
    const id = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(id);
          onKill();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [open, onKill]);

  if (!open) return null;

  const pct = (count / 10) * 100;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4 animate-fade-in">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-threat/40 bg-card p-7 shadow-2xl glow-threat animate-modal-in flicker-threat">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-white/5"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-threat/15 pulse-threat">
            <AlertTriangle className="h-6 w-6 text-threat" />
          </div>
          <div>
            <h3 className="text-xl font-semibold tracking-tight">Anomaly Detected</h3>
            <p className="text-xs uppercase tracking-[0.18em] text-threat">
              Risk Level · Critical
            </p>
          </div>
        </div>

        <p className="mb-5 text-sm text-muted-foreground">
          This action significantly deviates from your usual on-chain behavior. Review before approving.
        </p>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <Compare title="Expected" tone="safe" rows={[
            ["Action", "Token swap"],
            ["Amount", "≤ 5 SOL"],
            ["Program", "Jupiter"],
          ]} />
          <Compare title="Current" tone="threat" rows={[
            ["Action", "approve(∞)"],
            ["Amount", "Unlimited"],
            ["Program", "Unknown"],
          ]} />
        </div>

        <div className="mb-4">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="text-muted-foreground">Auto-block in</span>
            <span className="font-mono text-threat">{count}s</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-threat transition-all duration-1000 ease-linear"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onApprove}
            className="rounded-xl border border-safe/40 bg-safe/10 px-4 py-3.5 text-sm font-semibold text-safe transition-all hover:bg-safe/20 hover:glow-safe"
          >
            ✓ Approve
          </button>
          <button
            onClick={onKill}
            className="rounded-xl bg-threat px-4 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition-all hover:scale-[1.02] glow-threat"
          >
            ⛔ Kill Process
          </button>
        </div>

        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          No response will automatically block the transaction.
        </p>
      </div>
    </div>
  );
}

function Compare({
  title,
  tone,
  rows,
}: {
  title: string;
  tone: "safe" | "threat";
  rows: [string, string][];
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        tone === "safe" ? "border-safe/30 bg-safe/5" : "border-threat/40 bg-threat/10"
      )}
    >
      <p
        className={cn(
          "mb-3 text-[10px] font-bold uppercase tracking-[0.18em]",
          tone === "safe" ? "text-safe" : "text-threat"
        )}
      >
        {title}
      </p>
      <dl className="space-y-1.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-2 text-xs">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="truncate font-mono">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
