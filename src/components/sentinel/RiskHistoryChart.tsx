import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { SentinelEvent } from "@/lib/sentinel-types";
import { Activity } from "lucide-react";

const RISK_SCORE: Record<SentinelEvent["risk"], number> = {
  low: 14,
  medium: 52,
  high: 88,
};

const DEMO_HISTORY = (() => {
  const now = Date.now();
  const pts: { t: number; score: number; label: string }[] = [
    { t: now - 1000 * 60 * 180, score: 12, label: "Token swap" },
    { t: now - 1000 * 60 * 155, score: 18, label: "Transfer" },
    { t: now - 1000 * 60 * 130, score: 9,  label: "Swap" },
    { t: now - 1000 * 60 * 110, score: 52, label: "New program" },
    { t: now - 1000 * 60 * 90,  score: 67, label: "Unknown program" },
    { t: now - 1000 * 60 * 72,  score: 88, label: "High-risk drain" },
    { t: now - 1000 * 60 * 55,  score: 41, label: "Recovery tx" },
    { t: now - 1000 * 60 * 40,  score: 22, label: "Allowlisted swap" },
    { t: now - 1000 * 60 * 25,  score: 15, label: "Transfer" },
    { t: now - 1000 * 60 * 10,  score: 10, label: "Stake deposit" },
    { t: now - 1000 * 60 * 4,   score: 14, label: "Jupiter swap" },
  ];
  return pts;
})();

function fmt(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function scoreColor(score: number) {
  if (score >= 70) return "#ef4444";
  if (score >= 35) return "#f59e0b";
  return "#22c55e";
}

type Point = { time: string; score: number; label: string; ts: number };

interface Props {
  events: SentinelEvent[];
  isDemo?: boolean;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: Point }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const color = scoreColor(d.score);
  return (
    <div className="rounded-xl border border-white/10 bg-background/90 px-3 py-2.5 text-xs shadow-xl backdrop-blur">
      <p className="mb-1 font-mono text-[10px] text-muted-foreground">{d.time}</p>
      <p className="font-medium text-foreground">{d.label}</p>
      <p className="mt-0.5 font-mono font-bold" style={{ color }}>
        Risk {d.score}<span className="text-muted-foreground">/100</span>
      </p>
    </div>
  );
}

export function RiskHistoryChart({ events, isDemo }: Props) {
  const data = useMemo<Point[]>(() => {
    const raw = isDemo || events.length === 0
      ? DEMO_HISTORY
      : events
          .slice()
          .sort((a, b) => a.timestamp - b.timestamp)
          .map((e) => ({ t: e.timestamp, score: RISK_SCORE[e.risk], label: e.label }));

    return raw.map((r) => ({
      ts: r.t,
      time: fmt(r.t),
      score: r.score,
      label: r.label,
    }));
  }, [events, isDemo]);

  const maxScore = Math.max(...data.map((d) => d.score));
  const gradientColor = scoreColor(maxScore);

  const gradientId = "riskGrad";

  return (
    <section className="glass rounded-2xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Risk score history
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Transaction risk over the last 3 hours{isDemo ? " · demo data" : ""}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: gradientColor, background: `${gradientColor}18` }}
          >
            Peak {maxScore}
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={gradientColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={gradientColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />

          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }}
            axisLine={false}
            tickLine={false}
            ticks={[0, 35, 70, 100]}
          />

          <ReferenceLine
            y={35}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            strokeOpacity={0.4}
            label={{ value: "Med", position: "insideTopRight", fontSize: 9, fill: "#f59e0b", opacity: 0.6 }}
          />
          <ReferenceLine
            y={70}
            stroke="#ef4444"
            strokeDasharray="4 4"
            strokeOpacity={0.4}
            label={{ value: "High", position: "insideTopRight", fontSize: 9, fill: "#ef4444", opacity: 0.6 }}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }} />

          <Area
            type="monotone"
            dataKey="score"
            stroke={gradientColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, fill: gradientColor, stroke: "rgba(0,0,0,0.4)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-safe" />
          Low (&lt;35)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-warn" />
          Medium (35–70)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-threat" />
          High (&gt;70)
        </span>
        <span className="ml-auto font-mono">
          {data.length} tx{data.length !== 1 ? "s" : ""}
        </span>
      </div>
    </section>
  );
}
