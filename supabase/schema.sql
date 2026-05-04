-- RKZ AI - Supabase Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, name_ar TEXT, logo_url TEXT,
  subscription_plan TEXT DEFAULT 'basic',
  max_cameras INT DEFAULT 10, max_users INT DEFAULT 5,
  is_active BOOLEAN DEFAULT true, settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL, full_name TEXT, full_name_ar TEXT, avatar_url TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin','manager','engineer','viewer')),
  is_active BOOLEAN DEFAULT true, last_login TIMESTAMPTZ,
  preferences JSONB DEFAULT '{"language":"ar","theme":"dark","notifications":true}',
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL, name_ar TEXT, description TEXT, location TEXT, location_ar TEXT,
  latitude DECIMAL(10,8), longitude DECIMAL(11,8),
  status TEXT DEFAULT 'active' CHECK (status IN ('planning','active','paused','completed','cancelled')),
  start_date DATE, end_date DATE, progress INT DEFAULT 0,
  manager_id UUID REFERENCES users(id), thumbnail_url TEXT, settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cameras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL, name_ar TEXT, stream_url TEXT, rtsp_url TEXT,
  location TEXT, location_ar TEXT,
  camera_type TEXT DEFAULT 'fixed' CHECK (camera_type IN ('fixed','ptz','thermal','drone')),
  status TEXT DEFAULT 'online' CHECK (status IN ('online','offline','maintenance','error')),
  resolution TEXT DEFAULT '1080p', fps INT DEFAULT 30,
  is_recording BOOLEAN DEFAULT true, ai_enabled BOOLEAN DEFAULT true,
  detection_config JSONB DEFAULT '{"helmet":true,"vest":true,"intrusion":true,"fire":true,"fall":true}',
  last_seen TIMESTAMPTZ DEFAULT NOW(), ip_address TEXT, mac_address TEXT, firmware_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL, name_ar TEXT, employee_id TEXT, national_id TEXT,
  phone TEXT, role TEXT, role_ar TEXT, department TEXT, avatar_url TEXT,
  face_embedding JSONB, is_active BOOLEAN DEFAULT true,
  safety_score INT DEFAULT 100, total_violations INT DEFAULT 0,
  total_hours DECIMAL(10,2) DEFAULT 0, check_in_time TIMESTAMPTZ, check_out_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  camera_id UUID REFERENCES cameras(id) ON DELETE SET NULL,
  worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('no_helmet','no_vest','intrusion','fire','fall','unauthorized_access','crowd','equipment_misuse','other')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open','acknowledged','resolved','false_positive')),
  title TEXT, title_ar TEXT, description TEXT, description_ar TEXT,
  snapshot_url TEXT, video_clip_url TEXT, confidence DECIMAL(5,2), location TEXT,
  acknowledged_by UUID REFERENCES users(id), acknowledged_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id), resolved_at TIMESTAMPTZ,
  resolution_notes TEXT, metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id),
  title TEXT NOT NULL, title_ar TEXT,
  report_type TEXT DEFAULT 'safety' CHECK (report_type IN ('safety','attendance','incident','weekly','monthly','custom')),
  period_start DATE, period_end DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','generated','sent')),
  file_url TEXT, summary JSONB DEFAULT '{}', data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  camera_id UUID REFERENCES cameras(id) ON DELETE SET NULL,
  check_in TIMESTAMPTZ, check_out TIMESTAMPTZ,
  total_hours DECIMAL(10,2), date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_alerts_company ON alerts(company_id);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_cameras_project ON cameras(project_id);
CREATE INDEX idx_workers_project ON workers(project_id);
