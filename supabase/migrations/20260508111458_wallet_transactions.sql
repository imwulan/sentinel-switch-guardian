CREATE TABLE public.wallet_transactions (
  id TEXT PRIMARY KEY,
  wallet TEXT NOT NULL,
  signature TEXT NOT NULL,
  slot BIGINT DEFAULT 0,
  ts BIGINT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'unknown',
  label TEXT NOT NULL DEFAULT '',
  detail TEXT NOT NULL DEFAULT '',
  risk TEXT NOT NULL DEFAULT 'low',
  programs TEXT[] DEFAULT '{}',
  from_account TEXT,
  to_account TEXT,
  amount_sol NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX wallet_transactions_wallet_ts_idx ON public.wallet_transactions(wallet, ts DESC);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallet_tx_select" ON public.wallet_transactions
  FOR SELECT USING (true);

CREATE POLICY "wallet_tx_insert" ON public.wallet_transactions
  FOR INSERT WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_transactions;
