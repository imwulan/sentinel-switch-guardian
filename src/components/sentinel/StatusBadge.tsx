import { cn } from "@/lib/utils";

export type WalletStatus = "normal" | "suspicious" | "threat";

const map = {
  normal: { dot: "bg-safe", label: "Normal", text: "text-safe", ring: "pulse-safe" },
  suspicious: { dot: "bg-warn", label: "Suspicious", text: "text-warn", ring: "" },
  threat: { dot: "bg-threat", label: "Threat Detected", text: "text-threat", ring: "pulse-threat" },
};

export function StatusBadge({ status }: { status: WalletStatus }) {
  const s = map[status];
  return (
    <div className="glass inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5">
      <span className={cn("relative h-2.5 w-2.5 rounded-full", s.dot, s.ring)} />
      <span className={cn("text-xs font-medium tracking-wide uppercase", s.text)}>{s.label}</span>
    </div>
  );
}
