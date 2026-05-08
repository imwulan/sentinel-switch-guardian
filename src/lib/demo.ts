import type { SentinelEvent } from "@/lib/sentinel-types";

export const DEMO_WALLET_FULL = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";
export const DEMO_WALLET_SHORT = "7xKXt…P9aQ";
export const DEMO_BALANCE_SOL = 24.81;

const now = Date.now();

export const DEMO_EVENTS: SentinelEvent[] = [
  {
    id: "demo-1",
    signature: "5Yd2…aP1q",
    slot: 311_204_881,
    timestamp: now - 1000 * 60 * 4,
    kind: "transfer",
    label: "Sent 0.42 SOL → Jupiter Aggregator",
    detail: "JUP4F…wGz · known DEX router",
    risk: "low",
    programs: ["JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB"],
    to: "JUP4F…wGz",
    amountSol: 0.42,
  },
  {
    id: "demo-2",
    signature: "3Aq8…vKm9",
    slot: 311_204_502,
    timestamp: now - 1000 * 60 * 18,
    kind: "transfer",
    label: "Sent 1.10 SOL → Phantom hot wallet",
    detail: "Pham…h7x · allowlisted",
    risk: "low",
    programs: [],
    to: "Pham…h7x",
    amountSol: 1.1,
  },
  {
    id: "demo-3",
    signature: "9Lq3…tR4s",
    slot: 311_203_971,
    timestamp: now - 1000 * 60 * 47,
    kind: "swap",
    label: "Swapped 0.85 SOL for USDC",
    detail: "Orca whirlpool · within baseline",
    risk: "low",
    programs: ["whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc"],
    amountSol: 0.85,
  },
];
