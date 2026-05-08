import { createFileRoute } from "@tanstack/react-router";
import { sendTelegramAlert } from "@/lib/telegram";
import type { SentinelEvent } from "@/lib/sentinel-types";

export const Route = createFileRoute("/api/telegram-test")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const botToken = process.env.TELEGRAM_BOT_TOKEN ?? "";
        const chatId = process.env.TELEGRAM_CHAT_ID ?? "";

        if (!botToken || !chatId) {
          return Response.json(
            { ok: false, error: "TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID secrets are not set." },
            { status: 400 }
          );
        }

        const body = await request.json() as { chatId?: string };
        const targetChatId = body.chatId || chatId;

        const testEvent: SentinelEvent = {
          id: "test-" + Date.now(),
          signature: "TestSignature1111111111111111111111111111111111111111",
          slot: 999999,
          timestamp: Date.now(),
          kind: "program_call",
          label: "Test alert",
          detail: "This is a test message from Sentinel Switch",
          risk: "high",
          programs: ["UnknownProgram1111111111111111111"],
        };

        const result = await sendTelegramAlert(testEvent, "CwqBrxDS…mTR4", botToken, targetChatId);
        return Response.json(result);
      },
    },
  },
});
