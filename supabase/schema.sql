-- ── Profiles (linked to Supabase Auth) ─────────────────────────────────────
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null,
  role text not null default 'user',
  active boolean not null default true,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Admins can read all profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- ── Labels ───────────────────────────────────────────────────────────────────
create table labels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null,
  created_at timestamptz default now()
);

alter table labels enable row level security;
create policy "Own labels" on labels for all using (auth.uid() = user_id);

-- ── Priorities ───────────────────────────────────────────────────────────────
create table priorities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null,
  created_at timestamptz default now()
);

alter table priorities enable row level security;
create policy "Own priorities" on priorities for all using (auth.uid() = user_id);

-- ── Tasks ────────────────────────────────────────────────────────────────────
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text default '',
  scheduled_date date,
  estimated_hours numeric(4,2) default 0,
  label_id uuid references labels(id) on delete set null,
  priority_id uuid references priorities(id) on delete set null,
  tags text[] default '{}',
  reference_url text,
  recurring_group_id uuid,
  half_day text,
  completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table tasks enable row level security;
create policy "Own tasks" on tasks for all using (auth.uid() = user_id);

-- ── Settings ─────────────────────────────────────────────────────────────────
create table settings (
  user_id uuid references auth.users(id) on delete cascade primary key,
  working_mode text default '5-day',
  board_mode text default 'current-week',
  default_dashboard_range text default 'this-week',
  default_daily_hours numeric(4,2) default 8,
  per_day_overrides jsonb default '{}'
);

alter table settings enable row level security;
create policy "Own settings" on settings for all using (auth.uid() = user_id);
