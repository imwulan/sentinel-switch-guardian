import { Activity, Brain } from "lucide-react";

function Fingerprint() {
  // Procedural SVG "AI activity fingerprint"
  const points = Array.from({ length: 64 }, (_, i) => {
    const a = (i / 64) * Math.PI * 2;
    const r = 38 + Math.sin(i * 0.7) * 8 + Math.cos(i * 1.3) * 6;
    return [80 + Math.cos(a) * r, 80 + Math.sin(a) * r];
  });
  const d = points.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + "Z";
  return (
    <svg viewBox="0 0 160 160" className="h-40 w-40">
      <defs>
        <radialGradient id="g" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.85 0.22 145)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="oklch(0.85 0.22 145)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="80" cy="80" r="60" fill="url(#g)" />
      {[20, 35, 50].map((r) => (
        <circle key={r} cx="80" cy="80" r={r} fill="none" stroke="oklch(1 0 0 / 0.08)" />
      ))}
      <path d={d} fill="none" stroke="oklch(0.85 0.22 145)" strokeWidth="1.4" />
      <path d={d} fill="oklch(0.85 0.22 145 / 0.08)" />
      <circle cx="80" cy="80" r="3" fill="oklch(0.85 0.22 145)" />
    </svg>
  );
}

function Heatmap() {
  const cells = Array.from({ length: 24 }, (_, i) => {
    const v = Math.max(0, Math.sin((i - 8) * 0.5) * 0.7 + Math.random() * 0.3);
    return Math.min(1, v);
  });
  return (
    <div className="flex items-end gap-[3px]">
      {cells.map((v, i) => (
        <div
          key={i}
          className="w-1.5 rounded-sm bg-safe"
          style={{ height: `${8 + v * 28}px`, opacity: 0.25 + v * 0.75 }}
        />
      ))}
    </div>
  );
}

export function BehaviorPanel() {
  return (
    <section className="glass relative overflow-hidden rounded-2xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-safe" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Behavior Profile
          </h2>
        </div>
        <span className="glass inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-safe">
          <Activity className="h-3 w-3" /> Stable Pattern
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <div className="flex justify-center">
          <Fingerprint />
        </div>

        <div className="grid grid-cols-2 gap-4 self-center">
          <Metric label="Avg tx size" value="2.41 SOL" trend="+4%" />
          <Metric label="Top destinations" value="6 known" trend="stable" />
          <Metric label="Active hours" value="14:00 — 22:00 UTC" wide />
          <div className="col-span-2">
            <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              Activity heatmap (24h)
            </p>
            <Heatmap />
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  trend,
  wide,
}: {
  label: string;
  value: string;
  trend?: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-sm text-foreground">{value}</p>
      {trend && <p className="text-[10px] text-safe">{trend}</p>}
    </div>
  );
}
