export type RiskLevel = "low" | "medium" | "high";

export type ActivityKind = "swap" | "transfer" | "program_call" | "unknown";

export type SentinelEvent = {
  id: string;
  signature: string;
  slot: number;
  timestamp: number;
  kind: ActivityKind;
  label: string;
  detail: string;
  risk: RiskLevel;
  programs: string[];
  from?: string;
  to?: string;
  amountSol?: number;
};

export type SentinelSettings = {
  lowMed: number;
  medHigh: number;
  autoKill: number;
  countdown: number;
  learning: boolean;
  strict: boolean;
  notifyPush: boolean;
  notifyEmail: boolean;
  killUnknownContracts: boolean;
  allowlistedAddresses: string[];
  blockedAddresses: string[];
  allowlistedPrograms: string[];
  blockedPrograms: string[];
};

export type SimulationDelta = {
  account: string;
  preLamports: number;
  postLamports: number;
  deltaLamports: number;
};

export type SimulationResult = {
  ok: boolean;
  logs: string[];
  deltas: SimulationDelta[];
  error?: string;
};

export const DEFAULT_SETTINGS: SentinelSettings = {
  lowMed: 35,
  medHigh: 70,
  autoKill: 85,
  countdown: 10,
  learning: true,
  strict: false,
  notifyPush: true,
  notifyEmail: false,
  killUnknownContracts: true,
  allowlistedAddresses: [],
  blockedAddresses: [],
  allowlistedPrograms: [],
  blockedPrograms: [],
};
