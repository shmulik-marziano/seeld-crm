-- SeelD AI Complete Database Schema
-- =====================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums for type safety
DO $$ BEGIN
  CREATE TYPE client_status AS ENUM ('new', 'active', 'inactive', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE meeting_status AS ENUM ('scheduled', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE form_status AS ENUM ('draft', 'pending_signature', 'signed', 'submitted', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE commission_status AS ENUM ('pending', 'received', 'disputed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE alert_type AS ENUM ('commission', 'policy_expiring', 'new_lead', 'client_activity');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Clients table (extended)
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  id_number TEXT,
  date_of_birth DATE,
  address TEXT,
  status client_status DEFAULT 'new',
  
  -- Financial data (encrypted in production)
  har_bituach_data JSONB DEFAULT '{}',
  mislaka_data JSONB DEFAULT '{}',
  bank_data JSONB DEFAULT '{}',
  
  -- Analysis
  last_analysis_date TIMESTAMP WITH TIME ZONE,
  analysis_score NUMERIC,
  
  -- Metadata
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI Analyses table
CREATE TABLE IF NOT EXISTS public.ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Analysis data
  analysis_data JSONB NOT NULL DEFAULT '{}',
  opportunities JSONB DEFAULT '[]',
  gaps JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  
  -- Scoring
  overall_score NUMERIC,
  coverage_score NUMERIC,
  cost_efficiency_score NUMERIC,
  
  -- Report generation
  report_url TEXT,
  report_sent_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  
  status meeting_status DEFAULT 'scheduled',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Voice summary
  voice_recording_url TEXT,
  voice_transcription TEXT,
  
  -- Auto-generated summary
  ai_summary TEXT,
  action_items JSONB DEFAULT '[]',
  
  -- Next steps
  next_meeting_at TIMESTAMP WITH TIME ZONE,
  follow_up_tasks JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Forms table
CREATE TABLE IF NOT EXISTS public.forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  form_type TEXT NOT NULL,
  status form_status DEFAULT 'draft',
  
  -- Form data
  form_data JSONB NOT NULL DEFAULT '{}',
  
  -- Signatures
  docusign_envelope_id TEXT,
  signed_at TIMESTAMP WITH TIME ZONE,
  
  -- Insurance company submission
  submitted_to_company_at TIMESTAMP WITH TIME ZONE,
  company_reference_number TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Commissions table
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  policy_id UUID REFERENCES public.policies(id) ON DELETE SET NULL,
  
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'ILS',
  status commission_status DEFAULT 'pending',
  
  -- Tracking
  expected_date DATE,
  received_date DATE,
  
  -- Bank integration
  bank_transaction_id TEXT,
  matched_automatically BOOLEAN DEFAULT false,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  type alert_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Related entities
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES public.policies(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  
  -- Status
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Clients policies
CREATE POLICY "Agents can manage their clients"
  ON public.clients FOR ALL
  USING (auth.uid() = agent_id);

CREATE POLICY "Admins can manage all clients"
  ON public.clients FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- AI Analyses policies
CREATE POLICY "Agents can view their analyses"
  ON public.ai_analyses FOR SELECT
  USING (auth.uid() = agent_id);

CREATE POLICY "System can insert analyses"
  ON public.ai_analyses FOR INSERT
  WITH CHECK (true);

-- Meetings policies
CREATE POLICY "Agents can manage their meetings"
  ON public.meetings FOR ALL
  USING (auth.uid() = agent_id);

-- Forms policies
CREATE POLICY "Agents can manage their forms"
  ON public.forms FOR ALL
  USING (auth.uid() = agent_id);

-- Commissions policies
CREATE POLICY "Agents can view their commissions"
  ON public.commissions FOR SELECT
  USING (auth.uid() = agent_id);

CREATE POLICY "System can insert commissions"
  ON public.commissions FOR INSERT
  WITH CHECK (true);

-- Alerts policies
CREATE POLICY "Agents can view their alerts"
  ON public.alerts FOR SELECT
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents can update their alerts"
  ON public.alerts FOR UPDATE
  USING (auth.uid() = agent_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON public.forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON public.commissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_agent_id ON public.clients(agent_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_client_id ON public.ai_analyses(client_id);
CREATE INDEX IF NOT EXISTS idx_meetings_agent_id ON public.meetings(agent_id);
CREATE INDEX IF NOT EXISTS idx_meetings_client_id ON public.meetings(client_id);
CREATE INDEX IF NOT EXISTS idx_forms_agent_id ON public.forms(agent_id);
CREATE INDEX IF NOT EXISTS idx_commissions_agent_id ON public.commissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_alerts_agent_id ON public.alerts(agent_id);
CREATE INDEX IF NOT EXISTS idx_alerts_read_at ON public.alerts(read_at);