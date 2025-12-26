-- Bank Transactions table for Open Banking integration
CREATE TABLE IF NOT EXISTS public.bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transaction details
  transaction_id TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL,
  description TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Matching
  matched BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view their transactions"
  ON public.bank_transactions FOR SELECT
  USING (auth.uid() = agent_id);

CREATE POLICY "System can insert transactions"
  ON public.bank_transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update transactions"
  ON public.bank_transactions FOR UPDATE
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bank_transactions_agent_id ON public.bank_transactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_matched ON public.bank_transactions(matched);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON public.bank_transactions(transaction_date);