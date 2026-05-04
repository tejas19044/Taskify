-- ── App Users (custom auth, no Supabase Auth) ────────────────────────────────
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE app_users DISABLE ROW LEVEL SECURITY;

-- ── Labels ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE labels DISABLE ROW LEVEL SECURITY;

-- ── Priorities ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE priorities DISABLE ROW LEVEL SECURITY;

-- ── Tasks ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  scheduled_date DATE,
  estimated_hours NUMERIC(5,2) NOT NULL DEFAULT 1,
  label_id UUID REFERENCES labels(id) ON DELETE SET NULL,
  priority_id UUID REFERENCES priorities(id) ON DELETE SET NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  reference_url TEXT,
  recurring_group_id UUID,
  half_day TEXT CHECK (half_day IN ('am', 'pm')),
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- ── Settings ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  user_id UUID PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  working_mode TEXT NOT NULL DEFAULT '5-day',
  board_mode TEXT NOT NULL DEFAULT 'current-week',
  default_dashboard_range TEXT NOT NULL DEFAULT 'this-week',
  default_daily_hours NUMERIC(4,2) NOT NULL DEFAULT 8,
  per_day_overrides JSONB NOT NULL DEFAULT '{}'
);
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
