-- Reference schema aligned with SQLAlchemy models (PostgreSQL).
-- Application uses migrations via metadata.create_all in development.

CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY,
  udise_code VARCHAR(32) UNIQUE NOT NULL,
  name VARCHAR(512) NOT NULL,
  district VARCHAR(256) NOT NULL,
  state VARCHAR(128) NOT NULL,
  enrollment_total INTEGER,
  teacher_count INTEGER,
  grant_inr DOUBLE PRECISION,
  infra_status TEXT
);

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES schools(id),
  name VARCHAR(256) NOT NULL,
  grade INTEGER NOT NULL,
  parent_phone VARCHAR(32),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS attendance_events (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id),
  event_date DATE NOT NULL,
  status VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_bot_tasks (
  id UUID PRIMARY KEY,
  school_id UUID REFERENCES schools(id),
  title VARCHAR(512) NOT NULL,
  status VARCHAR(64) NOT NULL,
  form_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parent_call_events (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id),
  language VARCHAR(16) NOT NULL,
  call_status VARCHAR(64) NOT NULL,
  sentiment_score DOUBLE PRECISION,
  transcript_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS risk_snapshots (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id),
  score DOUBLE PRECISION NOT NULL,
  band VARCHAR(16) NOT NULL,
  factors JSONB NOT NULL,
  risk_engine VARCHAR(32),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS career_opportunities (
  id UUID PRIMARY KEY,
  title VARCHAR(256) NOT NULL,
  category VARCHAR(128) NOT NULL,
  region_hint VARCHAR(128) NOT NULL,
  description TEXT NOT NULL,
  min_grade INTEGER NOT NULL,
  max_grade INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS beo_tasks (
  id UUID PRIMARY KEY,
  title VARCHAR(512) NOT NULL,
  description TEXT NOT NULL,
  assigned_role VARCHAR(64) NOT NULL,
  assignee_name VARCHAR(256) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(64) NOT NULL,
  escalated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS udise_import_batches (
  id UUID PRIMARY KEY,
  filename VARCHAR(512) NOT NULL,
  rows_imported INTEGER NOT NULL,
  status VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS state_metrics (
  id UUID PRIMARY KEY,
  state_code VARCHAR(8) NOT NULL,
  state_name VARCHAR(128) NOT NULL,
  metric_key VARCHAR(64) NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_budget_lines (
  id UUID PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES schools(id),
  fiscal_year VARCHAR(16) NOT NULL,
  vendor_name VARCHAR(256) NOT NULL,
  allocated_inr DOUBLE PRECISION NOT NULL,
  utilized_inr DOUBLE PRECISION NOT NULL DEFAULT 0
);
