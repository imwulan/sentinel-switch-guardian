import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/sentinel/Header";
import { useSentinel } from "@/providers/SentinelProvider";
import { ArrowLeft, Check, X, Clock, Download } from "lucide-react";

export const Route = createFileRoute("/audit")({
  component: AuditPage,
  head: () => ({ meta: [{ title: "Audit log — Sentinel Switch" }] }),
});

const log = [
  { t: "12:42:01", action: "killed", target: "Unknown program Pdr…7Xa2", reason: "Drainer signature match", score: 96 },
  { t: "12:31:12", action: "approved", target: "Jupiter swap 8 SOL → USDC", reason: "Matches behavioral baseline", score: 18 },
  { t: "11:58:44", action: "auto-killed", target: "Token approval (unlimited)", reason: "Off-baseline + countdown elapsed", score: 88 },
  { t: "11:14:07", action: "approved", target: "SOL transfer 0.4 → friend.sol", reason: "Allowlisted recipient", score: 4 },
  { t: "10:02:22", action: "manual-killed", target: "NFT mint contract", reason: "User decision", score: 64 },
];

const map = {
  approved: { c: "text-safe", icon: Check },
  killed: { c: "text-threat", icon: X },
  "auto-killed": { c: "text-threat", icon: Clock },
  "manual-killed": { c: "text-warn", icon: X },
};

function AuditPage() {
  const { selectedWallet } = useSentinel();
  return (
    <div className="min-h-screen pb-12">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-40" />
      <main className="relative mx-auto max-w-5xl space-y-5 p-4 md:p-6">
        <Header status="normal" wallet={selectedWallet ?? "No wallet connected"} />

        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-3 py-1.5 text-xs hover:bg-secondary">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>

        <section className="glass rounded-2xl p-6">
          <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every Sentinel decision, on-chain reason, and confidence score — fully exportable for compliance.
          </p>
        </section>

        <section className="glass overflow-hidden rounded-2xl">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Target</th>
                <th className="px-4 py-3 text-left">Reason</th>
                <th className="px-4 py-3 text-right">AI score</th>
              </tr>
            </thead>
            <tbody>
              {log.map((l, i) => {
                const m = map[l.action as keyof typeof map];
                const Icon = m.icon;
                return (
                  <tr key={i} className="border-t border-border/40 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.t}</td>
                    <td className={`px-4 py-3 ${m.c}`}>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                        <Icon className="h-3.5 w-3.5" /> {l.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">{l.target}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{l.reason}</td>
                    <td className="px-4 py-3 text-right font-mono">{l.score}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
