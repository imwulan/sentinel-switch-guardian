import { Shield, Copy } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { toast } from "sonner";
import { StatusBadge, type WalletStatus } from "./StatusBadge";

export function Header({ status, wallet }: { status: WalletStatus; wallet: string }) {
  const hasWallet = wallet.length > 10 && !wallet.includes(" ");
  const short = hasWallet ? `${wallet.slice(0, 4)}…${wallet.slice(-4)}` : wallet;
  const copyWallet = async () => {
    if (!hasWallet) return;
    await navigator.clipboard.writeText(wallet);
    toast.success("Wallet copied");
  };
  return (
    <header className="glass-strong sticky top-0 z-30 flex items-center justify-between gap-4 rounded-2xl px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-secondary glow-safe">
          <Shield className="h-5 w-5 text-safe" strokeWidth={2.4} />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Sentinel Switch</h1>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Behavioral AI Firewall
          </p>
        </div>
      </div>

      <div className="hidden items-center gap-3 md:flex">
        <WalletMultiButton className="!h-8 !rounded-full !border !border-border !bg-secondary/80 !px-3 !font-medium !text-xs !text-foreground hover:!bg-secondary" />
        <StatusBadge status={status} />
        <div className="glass flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-safe" />
          Solana
          <span className="mx-1 opacity-40">·</span>
          <span className="text-foreground">{short}</span>
          <Copy
            className="h-3 w-3 cursor-pointer opacity-60 hover:opacity-100"
            onClick={copyWallet}
          />
        </div>
      </div>

      <div className="md:hidden">
        <StatusBadge status={status} />
      </div>
    </header>
  );
}
