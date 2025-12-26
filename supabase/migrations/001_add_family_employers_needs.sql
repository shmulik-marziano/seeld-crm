-- Migration: Add family members, employers, beneficiaries, and needs assessment tables
-- Run this in Supabase SQL Editor to add new tables to existing database

-- =====================================================
-- ADD NEW COLUMNS TO CUSTOMERS TABLE
-- =====================================================

ALTER TABLE customers ADD COLUMN IF NOT EXISTS id_type TEXT DEFAULT 'id_card';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS employment_status TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS monthly_income DECIMAL(12, 2);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_apartment TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS health_fund TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS height INTEGER;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS weight INTEGER;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_smoker BOOLEAN DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS cigarettes_per_day INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_us_citizen BOOLEAN DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_us_resident BOOLEAN DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_us_born BOOLEAN DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS birth_country TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS id_issue_date DATE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS meeting_date DATE;

-- =====================================================
-- CREATE NEW TABLES
-- =====================================================

-- Family members table (בני משפחה שאינם לקוחות עצמאיים)
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  id_type TEXT DEFAULT 'id_card',
  id_number TEXT,
  birth_date DATE,
  gender TEXT,
  is_smoker BOOLEAN DEFAULT false,
  employment_status TEXT,
  monthly_income DECIMAL(12, 2),
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employers table (מעסיקים)
CREATE TABLE IF NOT EXISTS employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_number TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT true,
  position TEXT,
  address_city TEXT,
  address_street TEXT,
  address_number TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Beneficiaries table (מוטבים)
CREATE TABLE IF NOT EXISTS beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  id_number TEXT,
  relationship TEXT,
  percentage DECIMAL(5, 2) CHECK (percentage >= 0 AND percentage <= 100),
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Needs assessment table (בירור צרכים)
CREATE TABLE IF NOT EXISTS needs_assessment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  assessment_date DATE DEFAULT CURRENT_DATE,
  goal_organize_life BOOLEAN DEFAULT false,
  goal_understand_rights BOOLEAN DEFAULT false,
  goal_check_surplus BOOLEAN DEFAULT false,
  goal_central_report BOOLEAN DEFAULT false,
  goal_risk_level BOOLEAN DEFAULT false,
  goal_tax_issues BOOLEAN DEFAULT false,
  goal_treasury_check BOOLEAN DEFAULT false,
  goal_mortgage_refinance BOOLEAN DEFAULT false,
  goal_adjust_amounts BOOLEAN DEFAULT false,
  goal_retirement_prep BOOLEAN DEFAULT false,
  goal_ongoing_support BOOLEAN DEFAULT false,
  goals_notes TEXT,
  savings_tax_benefits BOOLEAN DEFAULT false,
  savings_future_care BOOLEAN DEFAULT false,
  savings_retirement_age INTEGER,
  savings_lump_sum BOOLEAN DEFAULT false,
  savings_monthly_pension BOOLEAN DEFAULT false,
  savings_combined BOOLEAN DEFAULT false,
  insurance_life BOOLEAN DEFAULT false,
  insurance_disability BOOLEAN DEFAULT false,
  insurance_critical_illness BOOLEAN DEFAULT false,
  insurance_accident_death BOOLEAN DEFAULT false,
  insurance_nursing BOOLEAN DEFAULT false,
  insurance_health BOOLEAN DEFAULT false,
  requested_life_amount DECIMAL(14, 2),
  requested_disability_amount DECIMAL(14, 2),
  requested_critical_illness_amount DECIMAL(14, 2),
  requested_nursing_amount DECIMAL(14, 2),
  risk_level INTEGER CHECK (risk_level >= 1 AND risk_level <= 5),
  risk_notes TEXT,
  additional_notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id)
);

-- =====================================================
-- CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_family_members_customer_id ON family_members(customer_id);
CREATE INDEX IF NOT EXISTS idx_employers_customer_id ON employers(customer_id);
CREATE INDEX IF NOT EXISTS idx_employers_is_current ON employers(is_current);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_customer_id ON beneficiaries(customer_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_product_id ON beneficiaries(product_id);
CREATE INDEX IF NOT EXISTS idx_needs_assessment_customer_id ON needs_assessment(customer_id);

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_family_members_updated_at ON family_members;
CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON family_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_employers_updated_at ON employers;
CREATE TRIGGER update_employers_updated_at
  BEFORE UPDATE ON employers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_beneficiaries_updated_at ON beneficiaries;
CREATE TRIGGER update_beneficiaries_updated_at
  BEFORE UPDATE ON beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_needs_assessment_updated_at ON needs_assessment;
CREATE TRIGGER update_needs_assessment_updated_at
  BEFORE UPDATE ON needs_assessment
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE needs_assessment ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Allow all for authenticated users" ON family_members;
CREATE POLICY "Allow all for authenticated users" ON family_members
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all for authenticated users" ON employers;
CREATE POLICY "Allow all for authenticated users" ON employers
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all for authenticated users" ON beneficiaries;
CREATE POLICY "Allow all for authenticated users" ON beneficiaries
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all for authenticated users" ON needs_assessment;
CREATE POLICY "Allow all for authenticated users" ON needs_assessment
  FOR ALL USING (auth.role() = 'authenticated');
