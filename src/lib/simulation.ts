import type { SimulationResult } from "@/lib/sentinel-types";

type HeliusAccount = {
  account: {
    data: string;
    executable: boolean;
    lamports: number;
    owner: string;
    rentEpoch: number;
  };
  pubkey: string;
};

type HeliusSimResponse = {
  result?: {
    err: unknown;
    logs: string[];
    accounts?: HeliusAccount[];
    unitsConsumed?: number;
  };
  error?: { message?: string };
};

export async function simulateTransaction(
  endpoint: string,
  transactionBase64: string,
  watchedWallet: string
): Promise<SimulationResult> {
  const payload = {
    jsonrpc: "2.0",
    id: 1,
    method: "simulateTransaction",
    params: [
      transactionBase64,
      {
        encoding: "base64",
        sigVerify: false,
        replaceRecentBlockhash: true,
        accounts: {
          encoding: "base64",
          addresses: [watchedWallet],
        },
      },
    ],
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await res.json()) as HeliusSimResponse;
  if (!res.ok || body.error?.message) {
    return {
      ok: false,
      logs: [],
      deltas: [],
      error: body.error?.message ?? `Simulation failed (${res.status})`,
    };
  }

  const account = body.result?.accounts?.[0];
  return {
    ok: !body.result?.err,
    logs: body.result?.logs ?? [],
    deltas: account
      ? [
          {
            account: account.pubkey,
            preLamports: 0,
            postLamports: account.account.lamports,
            deltaLamports: account.account.lamports,
          },
        ]
      : [],
    error: body.result?.err ? JSON.stringify(body.result.err) : undefined,
  };
}
