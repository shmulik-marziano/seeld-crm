-- Migration: Add products/policies and processes tables
-- Based on SMS CRM system mapping

-- =============================================
-- 1. Create customer_products table (תיק לקוח)
-- =============================================

CREATE TYPE product_type AS ENUM (
  'pension_fund',      -- קרן פנסיה
  'provident_fund',    -- קופת גמל
  'education_fund',    -- קרן השתלמות
  'life_insurance',    -- ביטוח חיים
  'health_insurance',  -- ביטוח בריאות
  'disability',        -- אובדן כושר עבודה
  'critical_illness',  -- מחלות קשות
  'nursing',           -- סיעודי
  'property',          -- אלמנטר
  'group',             -- קבוצתי
  'other'
);

CREATE TYPE product_source AS ENUM (
  'mislaka',          -- מסלקה
  'har_habituach',    -- הר הביטוח
  'manual'            -- ידני
);

CREATE TYPE product_status AS ENUM (
  'active',           -- פעיל
  'inactive',         -- לא פעיל
  'frozen',           -- מוקפא
  'cancelled'         -- מסולק
);

CREATE TYPE employment_type AS ENUM (
  'employee',         -- שכיר
  'self_employed',    -- עצמאי
  'both'              -- גם וגם
);

CREATE TABLE IF NOT EXISTS public.customer_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL,

  -- Product Details
  product_type product_type NOT NULL,
  company VARCHAR(100) NOT NULL,
  policy_number VARCHAR(50),
  main_track VARCHAR(100),
  sub_track VARCHAR(100),

  -- Source & Status
  source product_source DEFAULT 'manual',
  status product_status DEFAULT 'active',
  employment_type employment_type,

  -- Financial Data
  accumulated_amount DECIMAL(14,2) DEFAULT 0,
  monthly_deposit DECIMAL(12,2) DEFAULT 0,
  employer_deposit DECIMAL(12,2) DEFAULT 0,
  employee_deposit DECIMAL(12,2) DEFAULT 0,

  -- Management Fees
  management_fee_deposits DECIMAL(5,3),
  management_fee_accumulated DECIMAL(5,3),

  -- Dates
  start_date DATE,
  end_date DATE,
  last_update DATE,
  seniority_years INTEGER,

  -- Recommendations
  recommendation VARCHAR(50), -- keep, replace, cancel
  recommendation_notes TEXT,

  -- Coverage Details (for insurance products)
  coverage_amount DECIMAL(14,2),
  premium DECIMAL(12,2),

  -- Metadata
  notes TEXT,
  external_data JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_products_client_id ON public.customer_products(client_id);
CREATE INDEX IF NOT EXISTS idx_customer_products_agent_id ON public.customer_products(agent_id);
CREATE INDEX IF NOT EXISTS idx_customer_products_type ON public.customer_products(product_type);
CREATE INDEX IF NOT EXISTS idx_customer_products_status ON public.customer_products(status);

-- =============================================
-- 2. Create processes table (ניהול תהליכים)
-- =============================================

CREATE TYPE process_type AS ENUM (
  'fishing_policy',      -- פישינג פוליסה
  'fishing_mislaka',     -- פישינג מסלקה
  'power_of_attorney',   -- יפוי כח
  'enrollment',          -- הצטרפות
  'material_action',     -- פעולה בחומר
  'update_details',      -- עדכון פרטי לקוח
  'transfer',            -- ניוד
  'consolidation',       -- איחוד קופות
  'other'
);

CREATE TYPE process_status AS ENUM (
  'pending',            -- ממתין
  'in_progress',        -- בתהליך
  'sent',               -- נשלח
  'received_ok',        -- התקבל תקין
  'manual_process',     -- הועבר לתהליך ידני
  'needs_fix',          -- נדרש תיקון
  'completed',          -- הושלם
  'cancelled'           -- בוטל
);

CREATE TYPE send_method AS ENUM (
  'quick_generate',     -- הפקה מהירה
  'email',              -- מייל
  'whatsapp',           -- וואטסאפ
  'fax',                -- פקס
  'manual'              -- ידני
);

CREATE TABLE IF NOT EXISTS public.processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL,
  product_id UUID REFERENCES public.customer_products(id) ON DELETE SET NULL,

  -- Process Details
  process_type process_type NOT NULL,
  company VARCHAR(100),
  product_name VARCHAR(200),

  -- Documents
  document_file_url TEXT,
  documents_sent TEXT[],

  -- Sending
  send_method send_method,
  sent_at TIMESTAMPTZ,

  -- Status
  status process_status DEFAULT 'pending',
  status_info TEXT,

  -- Control
  control_status VARCHAR(50),
  control_notes TEXT,

  -- Metadata
  notes TEXT,
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_processes_client_id ON public.processes(client_id);
CREATE INDEX IF NOT EXISTS idx_processes_agent_id ON public.processes(agent_id);
CREATE INDEX IF NOT EXISTS idx_processes_type ON public.processes(process_type);
CREATE INDEX IF NOT EXISTS idx_processes_status ON public.processes(status);

-- =============================================
-- 3. Create form_kits table (טפסי לקוח)
-- =============================================

CREATE TYPE form_kit_status AS ENUM (
  'draft',              -- טיוטא
  'pending_remote',     -- ממתין לחתימה מרחוק
  'pending_frontal',    -- ממתין לחתימה פרונטלית
  'signed',             -- נחתם
  'sent',               -- נשלח
  'completed'           -- הושלם
);

CREATE TYPE signature_type AS ENUM (
  'remote',             -- מרחוק
  'frontal',            -- פרונטלית
  'frontal_image'       -- פרונטלית עם תמונה
);

CREATE TABLE IF NOT EXISTS public.form_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL,

  -- Kit Details
  kit_name VARCHAR(200) NOT NULL,
  products_count INTEGER DEFAULT 0,

  -- Signature
  signature_type signature_type,
  status form_kit_status DEFAULT 'draft',

  -- VSign Integration
  vsign_envelope_id VARCHAR(100),
  vsign_status VARCHAR(50),

  -- Documents
  document_urls TEXT[],
  signed_document_url TEXT,

  -- Dates
  signed_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,

  -- Metadata
  form_data JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form_kits_client_id ON public.form_kits(client_id);
CREATE INDEX IF NOT EXISTS idx_form_kits_agent_id ON public.form_kits(agent_id);
CREATE INDEX IF NOT EXISTS idx_form_kits_status ON public.form_kits(status);

-- =============================================
-- 4. Create agent_settings table (הגדרות סוכן)
-- =============================================

CREATE TABLE IF NOT EXISTS public.agent_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL UNIQUE,

  -- Agent Info
  company_name VARCHAR(200),
  company_logo_url TEXT,
  license_type VARCHAR(100),
  license_number VARCHAR(50),
  license_holder_id VARCHAR(20),
  license_image_url TEXT,

  -- Contact
  office_phone VARCHAR(20),
  mobile_phone VARCHAR(20),
  fax VARCHAR(20),
  website_url TEXT,
  operations_email VARCHAR(100),

  -- Address
  address_city VARCHAR(100),
  address_street VARCHAR(200),
  address_number VARCHAR(20),
  address_postal_code VARCHAR(20),

  -- Database Info
  database_number VARCHAR(50),
  info_phone VARCHAR(20),

  -- Default Settings
  default_discounts_coverage JSONB, -- הנחות כיסויים
  default_discounts_fees JSONB,     -- הנחות דמי ניהול
  response_bank JSONB,               -- בנק תשובות
  reasoning_settings JSONB,          -- הגדרות הנמקה

  -- Privacy
  privacy_settings JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_settings_agent_id ON public.agent_settings(agent_id);

-- =============================================
-- 5. Create insurance_companies lookup table
-- =============================================

CREATE TABLE IF NOT EXISTS public.insurance_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  name_en VARCHAR(100),
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  products_offered TEXT[],
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert common Israeli insurance companies
INSERT INTO public.insurance_companies (name, name_en, products_offered) VALUES
  ('כלל', 'Clal', ARRAY['pension', 'provident', 'education', 'life', 'health', 'disability']),
  ('מגדל', 'Migdal', ARRAY['pension', 'provident', 'education', 'life', 'health', 'disability']),
  ('הפניקס', 'Phoenix', ARRAY['pension', 'provident', 'education', 'life', 'health', 'disability']),
  ('הראל', 'Harel', ARRAY['pension', 'provident', 'education', 'life', 'health', 'disability']),
  ('מנורה מבטחים', 'Menora Mivtachim', ARRAY['pension', 'provident', 'education', 'life', 'health', 'disability']),
  ('איילון', 'Ayalon', ARRAY['pension', 'provident', 'education', 'life', 'health']),
  ('הכשרה', 'Hachshara', ARRAY['pension', 'provident', 'education', 'life']),
  ('פסגות', 'Psagot', ARRAY['pension', 'provident', 'education']),
  ('מיטב דש', 'Meitav Dash', ARRAY['pension', 'provident', 'education']),
  ('אלטשולר שחם', 'Altshuler Shaham', ARRAY['pension', 'provident', 'education'])
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 6. Enable RLS and create policies
-- =============================================

-- Customer Products RLS
ALTER TABLE public.customer_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view their clients products"
ON public.customer_products
FOR SELECT
TO authenticated
USING (agent_id = auth.uid());

CREATE POLICY "Agents can manage their clients products"
ON public.customer_products
FOR ALL
TO authenticated
USING (agent_id = auth.uid())
WITH CHECK (agent_id = auth.uid());

-- Processes RLS
ALTER TABLE public.processes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view their processes"
ON public.processes
FOR SELECT
TO authenticated
USING (agent_id = auth.uid());

CREATE POLICY "Agents can manage their processes"
ON public.processes
FOR ALL
TO authenticated
USING (agent_id = auth.uid())
WITH CHECK (agent_id = auth.uid());

-- Form Kits RLS
ALTER TABLE public.form_kits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view their form kits"
ON public.form_kits
FOR SELECT
TO authenticated
USING (agent_id = auth.uid());

CREATE POLICY "Agents can manage their form kits"
ON public.form_kits
FOR ALL
TO authenticated
USING (agent_id = auth.uid())
WITH CHECK (agent_id = auth.uid());

-- Agent Settings RLS
ALTER TABLE public.agent_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view their settings"
ON public.agent_settings
FOR SELECT
TO authenticated
USING (agent_id = auth.uid());

CREATE POLICY "Agents can manage their settings"
ON public.agent_settings
FOR ALL
TO authenticated
USING (agent_id = auth.uid())
WITH CHECK (agent_id = auth.uid());

-- Insurance Companies - Public read
ALTER TABLE public.insurance_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view insurance companies"
ON public.insurance_companies
FOR SELECT
TO authenticated
USING (true);

-- =============================================
-- 7. Create triggers for updated_at
-- =============================================

CREATE TRIGGER update_customer_products_updated_at
  BEFORE UPDATE ON public.customer_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processes_updated_at
  BEFORE UPDATE ON public.processes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_kits_updated_at
  BEFORE UPDATE ON public.form_kits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_settings_updated_at
  BEFORE UPDATE ON public.agent_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
