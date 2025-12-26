-- Fix security warning: Function Search Path Mutable
-- Update the update_updated_at_column function with search_path

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public;

-- Create extensions schema for better security
CREATE SCHEMA IF NOT EXISTS extensions;

COMMENT ON SCHEMA extensions IS 'Schema for PostgreSQL extensions to keep them separate from public schema';