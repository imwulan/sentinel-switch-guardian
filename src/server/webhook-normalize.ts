import type { SentinelEvent } from "@/lib/sentinel-types";

type HeliusWebhookTx = {
  signature?: string;
  timestamp?: number;
  slot?: number;
  feePayer?: string;
  type?: string;
  source?: string;
  description?: string;
  tokenTransfers?: Array<{
    fromUserAccount?: string;
    toUserAccount?: string;
    tokenAmount?: number;
  }>;
  nativeTransfers?: Array<{
    fromUserAccount?: string;
    toUserAccount?: string;
    amount?: number;
  }>;
  accountData?: Array<{
    account?: string;
    nativeBalanceChange?: number;
  }>;
  instructions?: Array<{
    programId?: string;
  }>;
};

function riskFor(tx: HeliusWebhookTx): SentinelEvent["risk"] {
  const amountLamports =
    tx.nativeTransfers?.reduce((sum, n) => sum + Math.abs(n.amount ?? 0), 0) ?? 0;
  const amountSol = amountLamports / 1_000_000_000;
  const hasUnknownProgram = (tx.instructions ?? []).some((i) => !i.programId);
  if (amountSol > 20 || hasUnknownProgram) return "high";
  if (amountSol > 5 || tx.type === "UNKNOWN") return "medium";
  return "low";
}

function kindFor(tx: HeliusWebhookTx): SentinelEvent["kind"] {
  if (tx.type?.toLowerCase().includes("swap")) return "swap";
  if ((tx.nativeTransfers?.length ?? 0) > 0) return "transfer";
  if ((tx.instructions?.length ?? 0) > 0) return "program_call";
  return "unknown";
}

export function normalizeHeliusEvent(tx: HeliusWebhookTx, wallet: string): SentinelEvent {
  const native =
    tx.nativeTransfers?.find(
      (n) => n.fromUserAccount === wallet || n.toUserAccount === wallet
    ) ?? tx.nativeTransfers?.[0];
  const amountSol = native?.amount ? Math.abs(native.amount) / 1_000_000_000 : undefined;
  const programs = (tx.instructions ?? [])
    .map((ix) => ix.programId)
    .filter((p): p is string => Boolean(p));

  const kind = kindFor(tx);
  const label =
    kind === "swap"
      ? "Swap"
      : kind === "transfer"
        ? "Transfer"
        : kind === "program_call"
          ? "Program call"
          : "Unknown";

  return {
    id: tx.signature ?? `${wallet}-${tx.slot ?? Date.now()}`,
    signature: tx.signature ?? "unknown",
    slot: tx.slot ?? 0,
    timestamp: (tx.timestamp ?? Math.floor(Date.now() / 1000)) * 1000,
    kind,
    label,
    detail:
      tx.description ??
      `${amountSol?.toFixed(3) ?? "0.000"} SOL · ${tx.source ?? programs[0] ?? "unknown"}`,
    risk: riskFor(tx),
    programs,
    from: native?.fromUserAccount,
    to: native?.toUserAccount,
    amountSol,
  };
}
