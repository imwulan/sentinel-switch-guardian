import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
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
  balanceSol: number | null;
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
  const [balanceSol, setBalanceSol] = useState<number | null>(null);
  const [events, setEvents] = useState<SentinelEvent[]>([]);
  const [settings, setSettingsState] = useState<SentinelSettings>(() => loadSettings());
  const [userId, setUserId] = useState<string | null>(null);
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

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
      .upsert({ user_id: userId, settings: next as never });
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
    if (!selected) {
      setBalanceSol(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const pk = new PublicKey(selected);
        const lamports = await connection.getBalance(pk);
        if (!cancelled) setBalanceSol(lamports / LAMPORTS_PER_SOL);
      } catch {
        if (!cancelled) setBalanceSol(null);
      }
    })();
    return () => { cancelled = true; };
  }, [selected, connection]);

  useEffect(() => {
    void refreshEvents();
    if (!selected) return;
    const id = window.setInterval(() => void refreshEvents(), 15_000);
    return () => window.clearInterval(id);
  }, [selected]);

  useEffect(() => {
    if (realtimeChannelRef.current) {
      void supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }

    if (!selected) return;

    const channel = supabase
      .channel(`wallet_tx_${selected}`)
      .on(
        "postgres_changes" as Parameters<ReturnType<typeof supabase.channel>["on"]>[0],
        {
          event: "INSERT",
          schema: "public",
          table: "wallet_transactions",
          filter: `wallet=eq.${selected}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const row = payload.new;
          const event: SentinelEvent = {
            id: row.id as string,
            signature: row.signature as string,
            slot: (row.slot as number) ?? 0,
            timestamp: row.ts as number,
            kind: row.kind as SentinelEvent["kind"],
            label: row.label as string,
            detail: row.detail as string,
            risk: row.risk as SentinelEvent["risk"],
            programs: (row.programs as string[]) ?? [],
            from: (row.from_account as string) ?? undefined,
            to: (row.to_account as string) ?? undefined,
            amountSol: (row.amount_sol as number) ?? undefined,
          };
          setEvents((prev) => {
            if (prev.some((e) => e.id === event.id)) return prev;
            return [event, ...prev].slice(0, 250);
          });
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;
    return () => {
      if (realtimeChannelRef.current) {
        void supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
    };
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
        balanceSol,
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
