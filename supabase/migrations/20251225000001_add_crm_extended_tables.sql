-- Migration: Add extended CRM tables for SEELD CRM
-- Based on SMS CRM system mapping

-- =============================================
-- 1. Add new columns to clients table
-- =============================================

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS id_type VARCHAR(20) DEFAULT 'id_card'; -- id_card, passport
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS gender VARCHAR(10); -- male, female
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS marital_status VARCHAR(20); -- single, married, divorced, widowed
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS is_smoker BOOLEAN DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS employment_status VARCHAR(20); -- employee, self_employed
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS monthly_income DECIMAL(12,2);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS meeting_date DATE;

-- Address fields
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS street VARCHAR(200);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS house_number VARCHAR(20);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS apartment VARCHAR(20);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS po_box VARCHAR(20);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS fax VARCHAR(20);

-- Medical info
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS health_fund VARCHAR(50);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS supplementary_insurance VARCHAR(100);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS height INTEGER; -- cm
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS weight INTEGER; -- kg
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS cigarettes_per_day INTEGER DEFAULT 0;

-- US citizenship
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS is_us_citizen BOOLEAN DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS is_us_resident BOOLEAN DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS born_in_us BOOLEAN DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS birth_country VARCHAR(100);

-- Document
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS id_issue_date DATE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS id_document_url TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS pdf_accessibility BOOLEAN DEFAULT false;

-- Occupation
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS occupation VARCHAR(200);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS dangerous_hobbies BOOLEAN DEFAULT false;

-- =============================================
-- 2. Create family_members table
-- =============================================

CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  relationship VARCHAR(50) NOT NULL, -- spouse, child, parent
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  id_type VARCHAR(20) DEFAULT 'id_card',
  id_number VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10),
  marital_status VARCHAR(20),
  is_smoker BOOLEAN DEFAULT false,
  employment_status VARCHAR(20),
  monthly_income DECIMAL(12,2),
  -- Spouse-specific fields
  is_spouse BOOLEAN DEFAULT false,
  linked_client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  -- Contact info
  phone VARCHAR(20),
  email VARCHAR(100),
  -- Address (for spouse)
  city VARCHAR(100),
  street VARCHAR(200),
  house_number VARCHAR(20),
  postal_code VARCHAR(20),
  -- Medical (for spouse)
  health_fund VARCHAR(50),
  height INTEGER,
  weight INTEGER,
  cigarettes_per_day INTEGER DEFAULT 0,
  -- US info (for spouse)
  is_us_citizen BOOLEAN DEFAULT false,
  is_us_resident BOOLEAN DEFAULT false,
  birth_country VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_family_members_client_id ON public.family_members(client_id);
CREATE INDEX IF NOT EXISTS idx_family_members_is_spouse ON public.family_members(is_spouse);

-- =============================================
-- 3. Create employers table
-- =============================================

CREATE TABLE IF NOT EXISTS public.employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  company_name VARCHAR(200) NOT NULL,
  company_number VARCHAR(20), -- ח.פ
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT true,
  -- Address
  city VARCHAR(100),
  street VARCHAR(200),
  house_number VARCHAR(20),
  postal_code VARCHAR(20),
  -- Contact
  phone VARCHAR(20),
  email VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employers_client_id ON public.employers(client_id);
CREATE INDEX IF NOT EXISTS idx_employers_is_current ON public.employers(is_current);

-- =============================================
-- 4. Create beneficiaries table
-- =============================================

CREATE TABLE IF NOT EXISTS public.beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  linked_client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  id_number VARCHAR(20),
  relationship VARCHAR(50),
  percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  -- Contact
  phone VARCHAR(20),
  email VARCHAR(100),
  -- Address
  city VARCHAR(100),
  street VARCHAR(200),
  house_number VARCHAR(20),
  postal_code VARCHAR(20),
  -- Demographics
  date_of_birth DATE,
  gender VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beneficiaries_client_id ON public.beneficiaries(client_id);

-- =============================================
-- 5. Create needs_assessment table
-- =============================================

CREATE TABLE IF NOT EXISTS public.needs_assessment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,

  -- מטרות הלקוח (Customer Goals)
  goal_monthly_pension BOOLEAN DEFAULT false,
  goal_lump_sum BOOLEAN DEFAULT false,
  goal_check_surplus BOOLEAN DEFAULT false,
  goal_sick_pay BOOLEAN DEFAULT false,
  goal_adjust_risk BOOLEAN DEFAULT false,
  goal_consolidate_portfolio BOOLEAN DEFAULT false,
  goal_tax_issues BOOLEAN DEFAULT false,
  goal_treasury_check BOOLEAN DEFAULT false,
  goal_mortgage_check BOOLEAN DEFAULT false,
  goal_adjust_savings BOOLEAN DEFAULT false,
  goal_retirement_prep BOOLEAN DEFAULT false,
  goal_ongoing_support BOOLEAN DEFAULT false,
  goals_notes TEXT,

  -- מאפיינים - מטרות חיסכון (Savings Goals)
  savings_care_for_future BOOLEAN DEFAULT false,
  savings_tax_benefits BOOLEAN DEFAULT false,
  savings_lump_sum_at_retirement BOOLEAN DEFAULT false,
  savings_early_retirement BOOLEAN DEFAULT false,
  savings_monthly_pension_at_retirement BOOLEAN DEFAULT false,
  savings_combined_pension_lump_sum BOOLEAN DEFAULT false,
  savings_custom_definition TEXT,

  -- מאפיינים - מטרות ביטוח פרט (Personal Insurance Goals)
  insurance_critical_illness BOOLEAN DEFAULT false,
  insurance_nursing BOOLEAN DEFAULT false,
  insurance_health BOOLEAN DEFAULT false,
  insurance_widow_pension BOOLEAN DEFAULT false,
  insurance_disability_accident BOOLEAN DEFAULT false,
  insurance_orphan_pension BOOLEAN DEFAULT false,
  insurance_personal_accident BOOLEAN DEFAULT false,

  -- מאפיינים - מטרות ביטוח פרט + פנסיוני (Combined Insurance Goals)
  insurance_life BOOLEAN DEFAULT false,
  insurance_survivors_pension BOOLEAN DEFAULT false,
  insurance_disability BOOLEAN DEFAULT false,
  insurance_death_accident BOOLEAN DEFAULT false,

  -- חסכון קיים (Existing Savings)
  existing_savings_type VARCHAR(50), -- not_disclosed, none, attached_docs, detailed
  existing_savings_details TEXT,

  -- מצב כספי (Financial Status)
  financial_status_type VARCHAR(50), -- not_disclosed, no_savings, has_income_sources
  income_sources_details TEXT,
  obligations_details TEXT,
  dependents_details TEXT,
  financial_notes TEXT,
  client_not_disclosing BOOLEAN DEFAULT false,

  -- רמת סיכון (Risk Level) - 1 to 5
  risk_high_risk_belief INTEGER CHECK (risk_high_risk_belief BETWEEN 1 AND 5),
  risk_volatility_tolerance INTEGER CHECK (risk_volatility_tolerance BETWEEN 1 AND 5),
  risk_investment_risk INTEGER CHECK (risk_investment_risk BETWEEN 1 AND 5),
  risk_persistence INTEGER CHECK (risk_persistence BETWEEN 1 AND 5),
  risk_monitoring INTEGER CHECK (risk_monitoring BETWEEN 1 AND 5),
  risk_high_return_pursuit INTEGER CHECK (risk_high_return_pursuit BETWEEN 1 AND 5),
  risk_level_result VARCHAR(20), -- low, medium, high

  -- סכומי ביטוח מבוקשים (Requested Insurance Amounts)
  requested_life_insurance DECIMAL(12,2),
  requested_mortgage_insurance DECIMAL(12,2),
  requested_survivors_pension DECIMAL(12,2),
  requested_disability DECIMAL(12,2),
  requested_critical_illness DECIMAL(12,2),
  requested_nursing DECIMAL(12,2),
  requested_health DECIMAL(12,2),
  requested_personal_accident DECIMAL(12,2),
  requested_monthly_savings DECIMAL(12,2),
  requested_private_savings DECIMAL(12,2),
  requested_accumulated_sum DECIMAL(12,2),

  -- סכומי ביטוח מצויים (Existing Insurance Amounts)
  existing_life_insurance DECIMAL(12,2),
  existing_mortgage_insurance DECIMAL(12,2),
  existing_survivors_pension DECIMAL(12,2),
  existing_disability DECIMAL(12,2),
  existing_critical_illness DECIMAL(12,2),
  existing_nursing DECIMAL(12,2),
  existing_health DECIMAL(12,2),
  existing_personal_accident DECIMAL(12,2),
  existing_monthly_savings DECIMAL(12,2),
  existing_private_savings DECIMAL(12,2),
  existing_accumulated_sum DECIMAL(12,2),

  -- Additional preferences
  additional_preferences TEXT,

  -- מידע נוסף (Additional Info)
  additional_info TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one assessment per client
  CONSTRAINT unique_client_assessment UNIQUE (client_id)
);

CREATE INDEX IF NOT EXISTS idx_needs_assessment_client_id ON public.needs_assessment(client_id);

-- =============================================
-- 6. Create enums for new fields
-- =============================================

DO $$ BEGIN
  CREATE TYPE id_type AS ENUM ('id_card', 'passport');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE gender_type AS ENUM ('male', 'female');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE marital_status_type AS ENUM ('single', 'married', 'divorced', 'widowed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE employment_status_type AS ENUM ('employee', 'self_employed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE relationship_type AS ENUM ('spouse', 'child', 'parent', 'sibling', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- 7. Enable RLS and create policies
-- =============================================

-- Family Members RLS
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view their clients family members"
ON public.family_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = family_members.client_id
    AND c.agent_id = auth.uid()
  )
);

CREATE POLICY "Agents can manage their clients family members"
ON public.family_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = family_members.client_id
    AND c.agent_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = family_members.client_id
    AND c.agent_id = auth.uid()
  )
);

-- Employers RLS
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view their clients employers"
ON public.employers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = employers.client_id
    AND c.agent_id = auth.uid()
  )
);

CREATE POLICY "Agents can manage their clients employers"
ON public.employers
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = employers.client_id
    AND c.agent_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = employers.client_id
    AND c.agent_id = auth.uid()
  )
);

-- Beneficiaries RLS
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view their clients beneficiaries"
ON public.beneficiaries
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = beneficiaries.client_id
    AND c.agent_id = auth.uid()
  )
);

CREATE POLICY "Agents can manage their clients beneficiaries"
ON public.beneficiaries
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = beneficiaries.client_id
    AND c.agent_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = beneficiaries.client_id
    AND c.agent_id = auth.uid()
  )
);

-- Needs Assessment RLS
ALTER TABLE public.needs_assessment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view their clients needs assessment"
ON public.needs_assessment
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = needs_assessment.client_id
    AND c.agent_id = auth.uid()
  )
);

CREATE POLICY "Agents can manage their clients needs assessment"
ON public.needs_assessment
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = needs_assessment.client_id
    AND c.agent_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = needs_assessment.client_id
    AND c.agent_id = auth.uid()
  )
);

-- =============================================
-- 8. Create updated_at triggers
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON public.family_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employers_updated_at
  BEFORE UPDATE ON public.employers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beneficiaries_updated_at
  BEFORE UPDATE ON public.beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_needs_assessment_updated_at
  BEFORE UPDATE ON public.needs_assessment
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
