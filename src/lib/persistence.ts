import { DEFAULT_SETTINGS, type SentinelSettings } from "@/lib/sentinel-types";

const SETTINGS_KEY = "sentinel.settings.v1";
const ACTIVE_WALLET_KEY = "sentinel.activeWallet.v1";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadSettings(): SentinelSettings {
  if (!isBrowser()) return DEFAULT_SETTINGS;
  const raw = window.localStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<SentinelSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      allowlistedAddresses: parsed.allowlistedAddresses ?? [],
      blockedAddresses: parsed.blockedAddresses ?? [],
      allowlistedPrograms: parsed.allowlistedPrograms ?? [],
      blockedPrograms: parsed.blockedPrograms ?? [],
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: SentinelSettings) {
  if (!isBrowser()) return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadActiveWallet() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACTIVE_WALLET_KEY);
}

export function saveActiveWallet(wallet: string | null) {
  if (!isBrowser()) return;
  if (!wallet) {
    window.localStorage.removeItem(ACTIVE_WALLET_KEY);
    return;
  }
  window.localStorage.setItem(ACTIVE_WALLET_KEY, wallet);
}
