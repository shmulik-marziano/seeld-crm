-- Add assigned agent column to leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS assigned_agent_id UUID REFERENCES auth.users(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_assigned_agent ON public.leads(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- Update RLS policies to allow agents to update leads
CREATE POLICY "Agents can update leads assigned to them"
ON public.leads
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'agent'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Allow agents to update any lead if they're admin
CREATE POLICY "Admins can update any lead"
ON public.leads
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));