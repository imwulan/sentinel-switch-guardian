import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import type { SentinelEvent, RiskLevel } from "@/lib/sentinel-types";

const MAX_EVENTS = 20;

function getRisk(kind: SentinelEvent["kind"], amountSol: number | undefined): RiskLevel {
  if (kind === "program_call") return "high";
  if ((amountSol ?? 0) > 20) return "high";
  if ((amountSol ?? 0) > 5 || kind === "unknown") return "medium";
  return "low";
}

export async function fetchWalletEvents(
  connection: Connection,
  walletAddress: string
): Promise<SentinelEvent[]> {
  const wallet = new PublicKey(walletAddress);
  const signatures = await connection.getSignaturesForAddress(wallet, { limit: MAX_EVENTS });
  const txs = await Promise.all(
    signatures.map(async (entry) => {
      const tx = await connection.getParsedTransaction(entry.signature, {
        maxSupportedTransactionVersion: 0,
      });
      return { entry, tx };
    })
  );

  return txs
    .filter((x) => x.tx?.meta && x.tx.transaction)
    .map(({ entry, tx }) => {
      const programs = (tx?.transaction.message.instructions ?? [])
        .map((ix) => ("programId" in ix ? ix.programId.toBase58() : ""))
        .filter(Boolean);

      const pre = tx?.meta?.preBalances?.[0] ?? 0;
      const post = tx?.meta?.postBalances?.[0] ?? 0;
      const delta = Math.abs(post - pre);
      const amountSol = delta > 0 ? delta / LAMPORTS_PER_SOL : undefined;

      let kind: SentinelEvent["kind"] = "unknown";
      let label = "Program call";
      if (programs.some((p) => p.toLowerCase().includes("jup"))) {
        kind = "swap";
        label = "Swap";
      } else if (programs.length > 0) {
        kind = "program_call";
      }

      if ((tx?.meta?.preTokenBalances?.length ?? 0) !== (tx?.meta?.postTokenBalances?.length ?? 0)) {
        kind = "swap";
        label = "Swap";
      } else if ((amountSol ?? 0) > 0 && programs.length === 0) {
        kind = "transfer";
        label = "Transfer";
      }

      const risk = getRisk(kind, amountSol);
      return {
        id: entry.signature,
        signature: entry.signature,
        slot: entry.slot,
        timestamp: (entry.blockTime ?? Math.floor(Date.now() / 1000)) * 1000,
        kind,
        label,
        detail: `${amountSol?.toFixed(3) ?? "0.000"} SOL · ${programs[0] ? `${programs[0].slice(0, 6)}...` : "system"}`,
        risk,
        programs,
        amountSol,
      };
    });
}
