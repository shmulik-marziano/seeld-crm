-- Fix RLS policies for system tables to prevent unauthenticated access

-- 1. Drop overly permissive policies on ai_analyses
DROP POLICY IF EXISTS "System can insert analyses" ON public.ai_analyses;

-- 2. Drop overly permissive policies on bank_transactions
DROP POLICY IF EXISTS "System can insert transactions" ON public.bank_transactions;
DROP POLICY IF EXISTS "System can update transactions" ON public.bank_transactions;

-- 3. Drop overly permissive policies on commissions
DROP POLICY IF EXISTS "System can insert commissions" ON public.commissions;

-- 4. Drop overly permissive policies on performance_history
DROP POLICY IF EXISTS "System can insert performance history" ON public.performance_history;

-- 5. Drop overly permissive notification policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- 6. Add RLS policy to prevent users from modifying their own roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Recreate user_roles policies with proper restrictions
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 7. Add specific UPDATE policy for bank_transactions (agent ownership only)
CREATE POLICY "Agents can update their own transactions"
ON public.bank_transactions
FOR UPDATE
TO authenticated
USING (auth.uid() = agent_id)
WITH CHECK (auth.uid() = agent_id);

-- Note: System operations (inserts) should now only happen via edge functions using service role key
-- Edge functions with service role bypass RLS entirely, so no insert policies needed for system tables