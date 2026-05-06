import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/sentinel/Header";
import { useSentinel } from "@/providers/SentinelProvider";
import { Plus, Wallet, Users, Shield, ArrowLeft, Trash2, Star } from "lucide-react";

export const Route = createFileRoute("/wallets")({
  component: WalletsPage,
  head: () => ({
    meta: [
      { title: "Wallets — Sentinel Switch" },
      { name: "description", content: "Manage multiple wallets, multisigs and treasuries protected by Sentinel Switch." },
    ],
  }),
});

type Wallet = {
  address: string;
  label: string;
  kind: "personal" | "treasury" | "multisig";
  balance: number;
  status: "secured" | "watching" | "threat";
  primary?: boolean;
};

const MOCK: Wallet[] = [
  { address: "7xKXt...P9aQ", label: "Main", kind: "personal", balance: 24.81, status: "secured", primary: true },
  { address: "9aBcD...kL3m", label: "Trading", kind: "personal", balance: 142.5, status: "watching" },
  { address: "DAOmu...3rX8", label: "DAO Treasury", kind: "multisig", balance: 18420.0, status: "secured" },
  { address: "Tres1...nQa2", label: "Ops Treasury", kind: "treasury", balance: 5210.4, status: "threat" },
];

const kindIcon = { personal: Wallet, treasury: Shield, multisig: Users };
const statusStyle = {
  secured: "text-safe bg-safe/10 border-safe/30",
  watching: "text-warn bg-warn/10 border-warn/30",
  threat: "text-threat bg-threat/10 border-threat/30",
};

function WalletsPage() {
  const { selectedWallet } = useSentinel();
  return (
    <div className="min-h-screen pb-12">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-40" />
      <main className="relative mx-auto max-w-5xl space-y-5 p-4 md:p-6">
        <Header status="normal" wallet={selectedWallet ?? "No wallet connected"} />

        <div className="flex items-center justify-between">
          <Link to="/app" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
          </Link>
          <button className="inline-flex items-center gap-2 rounded-xl bg-safe/15 px-4 py-2 text-xs font-semibold text-safe hover:bg-safe/25">
            <Plus className="h-3.5 w-3.5" /> Add wallet
          </button>
        </div>

        <section className="glass rounded-2xl p-6">
          <h1 className="text-2xl font-semibold tracking-tight">Protected wallets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Watch personal addresses, multisigs and treasury accounts under one Sentinel.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          {MOCK.map((w) => {
            const Icon = kindIcon[w.kind];
            return (
              <Link key={w.address} to="/wallets/$address" params={{ address: w.address }} className="glass block rounded-2xl p-5 transition-colors hover:bg-secondary/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary">
                      <Icon className="h-4 w-4 text-foreground/80" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{w.label}</h3>
                        {w.primary && <Star className="h-3 w-3 fill-warn text-warn" />}
                      </div>
                      <p className="font-mono text-[11px] text-muted-foreground">{w.address}</p>
                    </div>
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusStyle[w.status]}`}>
                    {w.status}
                  </span>
                </div>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Balance</p>
                    <p className="font-mono text-xl">{w.balance.toLocaleString()} <span className="text-xs text-muted-foreground">SOL</span></p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-[11px] hover:bg-secondary">Tune AI</button>
                    <button className="rounded-lg border border-threat/30 bg-threat/10 px-2 py-1.5 text-threat hover:bg-threat/20">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <section className="glass rounded-2xl p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Treasury monitoring</h2>
          <p className="text-xs text-muted-foreground">
            Multisig & DAO accounts get extra signers, withdrawal velocity caps, and Slack/Telegram alerts to all members. Available on the Teams plan.
          </p>
          <Link to="/pricing" className="mt-4 inline-block rounded-xl bg-safe/15 px-4 py-2 text-xs font-semibold text-safe hover:bg-safe/25">
            Upgrade to Teams →
          </Link>
        </section>
      </main>
    </div>
  );
}
