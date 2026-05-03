# Taskify

A personal task planning app built for focus. Plan your week on a Kanban board, track time by label and priority, and see exactly where your hours go.

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Set up environment variables in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Default accounts

Accounts are managed in the **Admin** panel. After running the SQL setup, all migrated users get the temporary password `changeme123`. Log in and update passwords via Admin → Edit user.

---

## Features

**Board** — Kanban-style weekly planner. One column per day. Drag tasks across days, see per-day capacity bars, add tasks with one click. Supports 5-day and 7-day modes, plus a rolling view centered on today.

**Calendar** — Month, week, and day views. Click any date to create a task; click any task to edit it.

**Dashboard** — Analytics for any time range (Today, This Week, Last Week, This Month, Last 30 Days, Quarter, Custom). Shows tasks completed, total hours, daily workload bar chart, and hours broken down by label and priority in donut charts.

**Settings** — Working mode, board layout, daily capacity with per-day overrides, and full CRUD for labels and priority levels — each with a custom color.

**Admin** — Create users, set passwords, assign roles, activate/deactivate accounts, and delete users.

---

## How tasks work

**Completion** — A task is done when its scheduled date is today or earlier. No checkbox, no manual status. Move a task to a future date if it isn't finished yet.

**Labels vs Priority** — Labels categorize the type of work (e.g. Deep Work, Client, Learning). Priority captures urgency (e.g. High, Medium, Low). Both are fully user-defined with custom colors.

**Capacity** — Set your daily hours in Settings (with per-day overrides). The board shows a capacity bar per column so overloaded days are obvious at a glance.

---

## Project structure

```
src/
  app/                   # Next.js App Router pages
  components/
    board/               # Kanban board, task cards, add/edit dialogs
    calendar/            # Month / week / day views
    dashboard/           # KPI cards, bar chart, donut charts, range picker
    settings/            # Labels, priorities, working hours
    admin/               # User management table and dialogs
    layout/              # Sidebar (collapsible), bottom nav
    shared/              # RichTextEditor (TipTap), ConfirmDialog, TagChip
  hooks/                 # useTasks, useSettings, usePriorityLabels, usePriorities
  services/              # All persistence — taskService, userService, settingsService, etc.
  lib/
    analytics.ts         # Pure functions — no side effects, no storage access
    dateUtils.ts         # date-fns helpers, range → date string conversion
    storage.ts           # SSR-safe localStorage wrapper (session only)
    supabase.ts          # Supabase client
  types/                 # Shared TypeScript interfaces
  context/               # AuthContext (localStorage session, no Supabase Auth)
```

---

## Auth

Taskify uses a **custom auth system** — no Supabase Auth. Login checks the `app_users` table directly. The session is stored in `localStorage` as `taskify:session` (a serialised User object). Page reloads restore the session instantly with no network call.

| localStorage key | Contents |
|-----------------|----------|
| `taskify:session` | Logged-in user object (id, name, email, role, etc.) |
| `taskify:userRole` | Cached role for fast sidebar rendering |
| `taskify:sidebarCollapsed` | Sidebar collapsed state |

---

## Database (Supabase)

All tables have **RLS disabled**. The anon key is used for all queries directly from the client.

### Setup SQL

Run these in the Supabase SQL Editor in order. Each block is a single statement — paste and run one at a time.

#### 1. `app_users`

```sql
CREATE TABLE IF NOT EXISTS app_users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'user', active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW());
```
```sql
ALTER TABLE app_users DISABLE ROW LEVEL SECURITY;
```

#### 2. `labels`

```sql
CREATE TABLE IF NOT EXISTS labels (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE, name TEXT NOT NULL, color TEXT NOT NULL DEFAULT '#6366f1', created_at TIMESTAMPTZ DEFAULT NOW());
```
```sql
ALTER TABLE labels DISABLE ROW LEVEL SECURITY;
```

#### 3. `priorities`

```sql
CREATE TABLE IF NOT EXISTS priorities (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE, name TEXT NOT NULL, color TEXT NOT NULL DEFAULT '#6366f1', created_at TIMESTAMPTZ DEFAULT NOW());
```
```sql
ALTER TABLE priorities DISABLE ROW LEVEL SECURITY;
```

#### 4. `tasks`

```sql
CREATE TABLE IF NOT EXISTS tasks (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', scheduled_date DATE, estimated_hours NUMERIC(5,2) NOT NULL DEFAULT 1, label_id UUID REFERENCES labels(id) ON DELETE SET NULL, priority_id UUID REFERENCES priorities(id) ON DELETE SET NULL, tags TEXT[] NOT NULL DEFAULT '{}', reference_url TEXT, recurring_group_id UUID, half_day TEXT CHECK (half_day IN ('am', 'pm')), completed BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
```
```sql
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
```

#### 5. `settings`

```sql
CREATE TABLE IF NOT EXISTS settings (user_id UUID PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE, working_mode TEXT NOT NULL DEFAULT '5-day', board_mode TEXT NOT NULL DEFAULT 'current-week', default_dashboard_range TEXT NOT NULL DEFAULT 'this-week', default_daily_hours NUMERIC(4,2) NOT NULL DEFAULT 8, per_day_overrides JSONB NOT NULL DEFAULT '{}');
```
```sql
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
```

---

### Table reference

#### `app_users`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key, auto-generated |
| `name` | TEXT | Display name |
| `email` | TEXT | Unique, stored lowercase |
| `password` | TEXT | Plaintext — visible and editable by admin |
| `role` | TEXT | `'admin'` or `'user'` |
| `active` | BOOLEAN | Inactive users cannot log in |
| `created_at` | TIMESTAMPTZ | Auto-set on insert |

#### `tasks`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → `app_users.id`, cascade delete |
| `title` | TEXT | |
| `description` | TEXT | Stored as HTML (TipTap rich text) |
| `scheduled_date` | DATE | `NULL` = unscheduled (Pending column on board) |
| `estimated_hours` | NUMERIC(5,2) | |
| `label_id` | UUID | FK → `labels.id`, set null on delete |
| `priority_id` | UUID | FK → `priorities.id`, set null on delete |
| `tags` | TEXT[] | Array of free-form tag strings |
| `reference_url` | TEXT | Optional link |
| `recurring_group_id` | UUID | Groups all instances of a recurring series together |
| `half_day` | TEXT | `'am'` or `'pm'` — morning/afternoon slot within a day |
| `completed` | BOOLEAN | True when `scheduled_date` ≤ today |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Updated on every write |

#### `settings`

| Column | Type | Notes |
|--------|------|-------|
| `user_id` | UUID | PK + FK → `app_users.id` — one row per user |
| `working_mode` | TEXT | `'5-day'` or `'7-day'` |
| `board_mode` | TEXT | `'current-week'` or `'rolling'` |
| `default_dashboard_range` | TEXT | `'today'` `'this-week'` `'last-week'` `'this-month'` `'last-30'` `'this-quarter'` `'custom'` |
| `default_daily_hours` | NUMERIC(4,2) | Default capacity in hours per day |
| `per_day_overrides` | JSONB | `{"Monday": 4, "Friday": 6}` — hour overrides per weekday name |

#### `labels`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → `app_users.id`, cascade delete |
| `name` | TEXT | e.g. `'Deep Work'`, `'Client'` |
| `color` | TEXT | Hex string e.g. `'#6366f1'` |
| `created_at` | TIMESTAMPTZ | |

#### `priorities`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → `app_users.id`, cascade delete |
| `name` | TEXT | e.g. `'High'`, `'Medium'`, `'Low'` |
| `color` | TEXT | Hex string e.g. `'#ef4444'` |
| `created_at` | TIMESTAMPTZ | |

---

### Useful queries

```sql
-- All tasks for a user in a date range
SELECT * FROM tasks
WHERE user_id = '<uuid>'
  AND scheduled_date BETWEEN '2025-01-01' AND '2025-01-31'
ORDER BY scheduled_date, created_at;

-- Unscheduled (Pending) tasks
SELECT * FROM tasks
WHERE user_id = '<uuid>' AND scheduled_date IS NULL;

-- All tasks in a recurring series
SELECT * FROM tasks
WHERE recurring_group_id = '<group-uuid>'
ORDER BY scheduled_date;

-- Hours per label for a user this month
SELECT l.name, l.color, SUM(t.estimated_hours) AS total_hours
FROM tasks t
JOIN labels l ON t.label_id = l.id
WHERE t.user_id = '<uuid>'
  AND t.scheduled_date >= date_trunc('month', NOW())
GROUP BY l.name, l.color
ORDER BY total_hours DESC;

-- Hours per priority for a user this month
SELECT p.name, p.color, SUM(t.estimated_hours) AS total_hours
FROM tasks t
JOIN priorities p ON t.priority_id = p.id
WHERE t.user_id = '<uuid>'
  AND t.scheduled_date >= date_trunc('month', NOW())
GROUP BY p.name, p.color
ORDER BY total_hours DESC;

-- All users with task counts
SELECT u.name, u.email, u.role, u.active, COUNT(t.id) AS task_count
FROM app_users u
LEFT JOIN tasks t ON t.user_id = u.id
GROUP BY u.id, u.name, u.email, u.role, u.active
ORDER BY u.created_at;

-- Reset a user's password
UPDATE app_users SET password = 'newpassword' WHERE email = 'user@example.com';

-- Per-day task load for a user in a given week
SELECT scheduled_date, COUNT(*) AS task_count, SUM(estimated_hours) AS total_hours
FROM tasks
WHERE user_id = '<uuid>'
  AND scheduled_date BETWEEN '2025-01-06' AND '2025-01-12'
GROUP BY scheduled_date
ORDER BY scheduled_date;
```

---

## Tech stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Custom — `app_users` table + localStorage session |
| Rich text | TipTap |
| Drag & drop | @dnd-kit |
| Charts | Recharts |
| Dates | date-fns |
| Toasts | Sonner |

---

## Development

```bash
npm run dev          # Start dev server
npx tsc --noEmit     # Type-check without building
npm run lint         # Lint
```

> Do not run `npm run build` during development. Use `npx tsc --noEmit` to type-check instead.
