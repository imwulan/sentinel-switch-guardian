import type { SentinelEvent } from "@/lib/sentinel-types";

type WalletEventStore = Record<string, SentinelEvent[]>;

type GlobalWithStore = typeof globalThis & {
  __sentinelEventStore?: WalletEventStore;
};

function getStore() {
  const g = globalThis as GlobalWithStore;
  if (!g.__sentinelEventStore) {
    g.__sentinelEventStore = {};
  }
  return g.__sentinelEventStore;
}

export function upsertWalletEvents(wallet: string, incoming: SentinelEvent[]) {
  const store = getStore();
  const prev = store[wallet] ?? [];
  const seen = new Set(prev.map((e) => e.id));
  const merged = [...incoming.filter((e) => !seen.has(e.id)), ...prev]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 250);
  store[wallet] = merged;
  return merged;
}

export function listWalletEvents(wallet: string) {
  const store = getStore();
  return store[wallet] ?? [];
}
