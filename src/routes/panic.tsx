import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ShieldAlert, Loader2 } from "lucide-react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createRevokeInstruction,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { useSentinel } from "@/providers/SentinelProvider";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/panic")({
  component: PanicPage,
  head: () => ({
    meta: [
      { title: "Panic Mode — Sentinel Switch" },
      { name: "description", content: "Instantly revoke all SPL token approvals (delegates) on your Solana wallet." },
    ],
  }),
});

type Approval = {
  account: string;
  mint: string;
  delegate: string;
  amount: string;
  programId: string;
};

function PanicPage() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { selectedWallet } = useSentinel();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [revoking, setRevoking] = useState(false);

  const wallet = publicKey?.toBase58() ?? selectedWallet ?? null;

  const scan = async () => {
    if (!wallet) {
      toast.error("Connect a wallet first");
      return;
    }
    setLoading(true);
    setApprovals([]);
    try {
      const owner = new PublicKey(wallet);
      const programs = [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID];
      const found: Approval[] = [];
      for (const pid of programs) {
        const res = await connection.getParsedTokenAccountsByOwner(owner, { programId: pid });
        for (const it of res.value) {
          const info = it.account.data.parsed?.info;
          if (info?.delegate) {
            found.push({
              account: it.pubkey.toBase58(),
              mint: info.mint,
              delegate: info.delegate,
              amount: info.delegatedAmount?.uiAmountString ?? "0",
              programId: pid.toBase58(),
            });
          }
        }
      }
      setApprovals(found);
      toast.success(`Found ${found.length} active approval${found.length === 1 ? "" : "s"}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wallet) void scan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  const revokeAll = async () => {
    if (!publicKey) return toast.error("Connect your wallet to sign");
    if (approvals.length === 0) return toast.message("No approvals to revoke");
    setRevoking(true);
    try {
      const tx = new Transaction();
      for (const a of approvals) {
        tx.add(
          createRevokeInstruction(
            new PublicKey(a.account),
            publicKey,
            [],
            new PublicKey(a.programId),
          ),
        );
      }
      const sig = await sendTransaction(tx, connection as Connection);
      toast.success(`Revoked ${approvals.length} approvals`, { description: sig.slice(0, 16) + "…" });

      if (user) {
        await supabase.from("audit_events").insert({
          user_id: user.id,
          wallet,
          kind: "panic_revoke",
          risk: "high",
          score: 100,
          detail: { count: approvals.length, signature: sig },
        });
      }
      setApprovals([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Revoke failed");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-40" />
      <main className="relative mx-auto max-w-3xl space-y-5 p-4 md:p-6">
        <header className="glass-strong sticky top-0 z-30 flex items-center justify-between gap-4 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <Link to="/app" className="grid h-9 w-9 place-items-center rounded-xl bg-secondary/60 text-muted-foreground hover:text-foreground" aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-threat/10 glow-threat">
              <ShieldAlert className="h-5 w-5 text-threat" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Panic Mode</h1>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Revoke all token approvals</p>
            </div>
          </div>
        </header>

        <section className="glass rounded-2xl p-6">
          <p className="text-sm text-muted-foreground">
            Drainers exploit SPL <span className="font-mono text-foreground">approve</span> permissions you've granted in the past. Panic Mode finds every active delegate and revokes them in one signed transaction.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={scan}
              disabled={loading || !wallet}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-4 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Re-scan
            </button>
            <button
              onClick={revokeAll}
              disabled={revoking || approvals.length === 0 || !publicKey}
              className="inline-flex items-center gap-2 rounded-xl bg-threat px-5 py-2 text-sm font-bold uppercase tracking-wider text-white glow-threat disabled:opacity-50"
            >
              {revoking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
              Revoke all ({approvals.length})
            </button>
          </div>
        </section>

        <section className="glass rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Active approvals</h2>
          {!wallet ? (
            <p className="text-sm text-muted-foreground">Connect a wallet to scan.</p>
          ) : loading ? (
            <p className="text-sm text-muted-foreground">Scanning…</p>
          ) : approvals.length === 0 ? (
            <p className="text-sm text-safe">✓ No active approvals. You're clean.</p>
          ) : (
            <ul className="space-y-2">
              {approvals.map((a) => (
                <li key={a.account} className="rounded-xl border border-border bg-secondary/40 p-3 font-mono text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Mint</span>
                    <span className="truncate">{a.mint}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Delegate</span>
                    <span className="truncate text-warn">{a.delegate}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Amount</span>
                    <span>{a.amount}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
