-- Create table for tracking performance scores over time
CREATE TABLE IF NOT EXISTS public.performance_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  performance_score INTEGER NOT NULL,
  performance_rating TEXT NOT NULL,
  premium_score INTEGER NOT NULL,
  coverage_score INTEGER NOT NULL,
  policy_score INTEGER NOT NULL,
  total_premium NUMERIC NOT NULL,
  total_coverage NUMERIC NOT NULL,
  total_policies INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.performance_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own performance history"
  ON public.performance_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert performance history"
  ON public.performance_history
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_performance_history_user_created 
  ON public.performance_history(user_id, created_at DESC);