import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { BackpackWalletAdapter } from "@solana/wallet-adapter-backpack";
import { fetchWalletEvents } from "@/lib/activity";
import { loadActiveWallet, loadSettings, saveActiveWallet, saveSettings } from "@/lib/persistence";
import { supabase } from "@/integrations/supabase/client";
import { simulateTransaction } from "@/lib/simulation";
import {
  DEFAULT_SETTINGS,
  type SentinelEvent,
  type SentinelSettings,
  type SimulationResult,
} from "@/lib/sentinel-types";

type SentinelContextValue = {
  connectedWallet: string | null;
  selectedWallet: string | null;
  events: SentinelEvent[];
  settings: SentinelSettings;
  setSettings: (next: SentinelSettings) => void;
  updateSettings: <K extends keyof SentinelSettings>(key: K, value: SentinelSettings[K]) => void;
  setSelectedWallet: (wallet: string | null) => void;
  refreshEvents: () => Promise<void>;
  simulate: (base64Tx: string) => Promise<SimulationResult>;
};

const SentinelContext = createContext<SentinelContextValue | null>(null);

const RPC_ENDPOINT =
  import.meta.env.VITE_HELIUS_RPC_URL ??
  import.meta.env.VITE_TRITON_RPC_URL ??
  clusterApiUrl("mainnet-beta");

function SentinelStateProvider({ children }: { children: React.ReactNode }) {
  const { publicKey } = useWallet();
  const connectedWallet = publicKey?.toBase58() ?? null;
  const [selectedWallet, setSelectedWalletState] = useState<string | null>(() => loadActiveWallet());
  const [events, setEvents] = useState<SentinelEvent[]>([]);
  const [settings, setSettingsState] = useState<SentinelSettings>(() => loadSettings());
  const [userId, setUserId] = useState<string | null>(null);

  const connection = useMemo(() => new Connection(RPC_ENDPOINT, "confirmed"), []);

  const selected = connectedWallet ?? selectedWallet;

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUserId(s?.user?.id ?? null));
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user?.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase
        .from("user_settings")
        .select("settings")
        .eq("user_id", userId)
        .maybeSingle();
      if (data?.settings) {
        setSettingsState((prev) => ({ ...prev, ...(data.settings as Partial<SentinelSettings>) }));
      }
    })();
  }, [userId]);

  const persistRemote = (next: SentinelSettings) => {
    if (!userId) return;
    void supabase
      .from("user_settings")
      .upsert({ user_id: userId, settings: next as unknown as Record<string, unknown> });
  };

  const setSelectedWallet = (wallet: string | null) => {
    setSelectedWalletState(wallet);
    saveActiveWallet(wallet);
  };

  const setSettings = (next: SentinelSettings) => {
    setSettingsState(next);
    saveSettings(next);
    persistRemote(next);
  };

  const updateSettings = <K extends keyof SentinelSettings>(key: K, value: SentinelSettings[K]) => {
    setSettingsState((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      persistRemote(next);
      return next;
    });
  };


  const refreshEvents = async () => {
    if (!selected) {
      setEvents([]);
      return;
    }
    try {
      const response = await fetch(`/api/events?wallet=${encodeURIComponent(selected)}`);
      if (response.ok) {
        const payload = (await response.json()) as { events?: SentinelEvent[] };
        if (Array.isArray(payload.events) && payload.events.length > 0) {
          setEvents(payload.events);
          return;
        }
      }

      // Fallback to direct RPC polling when webhook store is empty.
      const list = await fetchWalletEvents(connection, selected);
      setEvents(list);
    } catch {
      // Keep previous feed if provider errors.
    }
  };

  useEffect(() => {
    if (connectedWallet) {
      setSelectedWallet(connectedWallet);
    }
  }, [connectedWallet]);

  useEffect(() => {
    void refreshEvents();
    if (!selected) return;
    const id = window.setInterval(() => {
      void refreshEvents();
    }, 15000);
    return () => window.clearInterval(id);
  }, [selected]);

  const simulate = async (base64Tx: string) => {
    if (!selected) {
      return { ok: false, logs: [], deltas: [], error: "Connect a wallet first." };
    }
    return simulateTransaction(RPC_ENDPOINT, base64Tx, selected);
  };

  return (
    <SentinelContext.Provider
      value={{
        connectedWallet,
        selectedWallet: selected,
        events,
        settings,
        setSettings,
        updateSettings,
        setSelectedWallet,
        refreshEvents,
        simulate,
      }}
    >
      {children}
    </SentinelContext.Provider>
  );
}

export function SentinelProvider({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter(), new BackpackWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SentinelStateProvider>{children}</SentinelStateProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export function useSentinel() {
  const ctx = useContext(SentinelContext);
  if (!ctx) {
    throw new Error("useSentinel must be used within SentinelProvider");
  }
  return ctx;
}

export function useSentinelSettings() {
  const { settings, setSettings, updateSettings } = useSentinel();
  return { settings, setSettings, updateSettings };
}

export function getDefaultSettings() {
  return DEFAULT_SETTINGS;
}
