import type { SentinelEvent } from "@/lib/sentinel-types";

const RISK_SCORE: Record<SentinelEvent["risk"], number> = {
  low: 14,
  medium: 52,
  high: 88,
};

export function shouldAlertTelegram(event: SentinelEvent, threshold = 70): boolean {
  return RISK_SCORE[event.risk] >= threshold;
}

export async function sendTelegramAlert(
  event: SentinelEvent,
  wallet: string,
  botToken: string,
  chatId: string
): Promise<{ ok: boolean; error?: string }> {
  const score = RISK_SCORE[event.risk];
  const emoji = event.risk === "high" ? "🚨" : event.risk === "medium" ? "⚠️" : "✅";
  const solscanUrl = `https://solscan.io/tx/${event.signature}`;
  const shortWallet = `${wallet.slice(0, 6)}…${wallet.slice(-4)}`;

  const text = [
    `${emoji} *Sentinel Switch Alert*`,
    ``,
    `*Risk score:* \`${score}/100\``,
    `*Level:* ${event.risk.toUpperCase()}`,
    `*Type:* ${event.label}`,
    `*Wallet:* \`${shortWallet}\``,
    `*Detail:* ${event.detail}`,
    ``,
    `[View on Solscan](${solscanUrl})`,
  ].join("\n");

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: false,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Telegram API error ${res.status}: ${body}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
