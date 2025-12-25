-- SEELD CRM Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'agent');

CREATE TYPE product_type AS ENUM (
  'pension',
  'provident',
  'study_fund',
  'managers',
  'life',
  'health',
  'critical_illness',
  'personal_accident',
  'mortgage',
  'travel',
  'car',
  'home',
  'business'
);

CREATE TYPE product_status AS ENUM ('active', 'inactive', 'pending', 'cancelled');

CREATE TYPE document_type AS ENUM (
  'clearing_report',
  'appendix_a',
  'appendix_b',
  'appendix_e',
  'policy',
  'poa',
  'remote_signature',
  'other'
);

CREATE TYPE activity_type AS ENUM (
  'call',
  'email',
  'sms',
  'whatsapp',
  'meeting',
  'document',
  'status_change',
  'note'
);

CREATE TYPE workflow_status AS ENUM ('open', 'in_progress', 'waiting', 'completed', 'cancelled');

CREATE TYPE workflow_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TYPE meeting_type AS ENUM ('phone', 'in_person', 'video');

CREATE TYPE meeting_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');

-- =====================================================
-- TABLES
-- =====================================================

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'agent',
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  id_number TEXT UNIQUE NOT NULL, -- תעודת זהות - משמש גם כסיסמה למסמכים
  birth_date DATE,
  gender TEXT,
  marital_status TEXT,
  phone TEXT,
  mobile TEXT,
  email TEXT,
  address_city TEXT,
  address_street TEXT,
  address_number TEXT,
  is_confidential BOOLEAN DEFAULT false,
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type product_type NOT NULL,
  company TEXT,
  policy_number TEXT,
  status product_status DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  premium_monthly DECIMAL(12, 2),
  balance DECIMAL(14, 2),
  management_fee DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type document_type NOT NULL,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  password_protected BOOLEAN DEFAULT true,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type activity_type NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflows table
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  status workflow_status DEFAULT 'open',
  priority workflow_priority DEFAULT 'medium',
  assigned_to UUID REFERENCES users(id),
  due_date DATE,
  steps JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meetings table
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type meeting_type NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  location TEXT,
  summary TEXT,
  next_steps TEXT,
  status meeting_status DEFAULT 'scheduled',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family relations table
CREATE TABLE family_relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  related_customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL, -- 'spouse', 'child', 'parent', 'sibling', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, related_customer_id)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT NOT NULL, -- 'document', 'schedule', 'poa', 'report', 'clearing'
  is_read BOOLEAN DEFAULT false,
  related_id UUID, -- Can reference any related entity
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_customers_id_number ON customers(id_number);
CREATE INDEX idx_customers_full_name ON customers(first_name, last_name);
CREATE INDEX idx_customers_assigned_to ON customers(assigned_to);
CREATE INDEX idx_products_customer_id ON products(customer_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_documents_customer_id ON documents(customer_id);
CREATE INDEX idx_activities_customer_id ON activities(customer_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);
CREATE INDEX idx_workflows_customer_id ON workflows(customer_id);
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflows_assigned_to ON workflows(assigned_to);
CREATE INDEX idx_meetings_customer_id ON meetings(customer_id);
CREATE INDEX idx_meetings_scheduled_at ON meetings(scheduled_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Basic policies (allow all for authenticated users - adjust as needed)
CREATE POLICY "Allow all for authenticated users" ON users
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON customers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON documents
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON activities
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON workflows
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON meetings
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON family_relations
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON notifications
  FOR ALL USING (auth.role() = 'authenticated');
