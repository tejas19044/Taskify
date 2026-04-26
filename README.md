# Taskify

A personal task planning app built for focus. Plan your week on a Kanban board, track time by label and priority, and see exactly where your hours go.

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Default accounts

| Username | Password | Role  |
|----------|----------|-------|
| admin    | admin123 | Admin |
| tejas    | tejas123 | User  |

---

## Features

**Board** — Kanban-style weekly planner. One column per day. Drag tasks across days, see per-day capacity bars, add tasks with one click. Supports 5-day and 7-day modes, plus a rolling view centered on today.

**Calendar** — Month, week, and day views. Click any date to create a task; click any task to edit it.

**Dashboard** — Analytics for any time range (Today, This Week, Last Week, This Month, Last 30 Days, Quarter, Custom). Shows tasks completed, total hours, daily workload bar chart, and hours broken down by label and priority in donut charts. All numbers are consistent — the sum of label hours always equals the sum of priority hours which always equals the Hours KPI.

**Settings** — Working mode, board layout, daily capacity with per-day overrides, and full CRUD for labels and priority levels — each with a custom color.

**Admin** — Create users, set passwords, assign roles, activate/deactivate accounts, and delete users (cascades all their tasks, labels, and settings).

---

## How tasks work

**Completion** — A task is done when its scheduled date is today or earlier. No checkbox, no manual status. Move a task to a future date if it isn't finished yet.

**Labels vs Priority** — Labels categorize the type of work (e.g. Deep Work, Client, Learning). Priority captures urgency (e.g. High, Medium, Low). Both are fully user-defined with custom colors. They appear color-coded on every task card and as separate donut charts in the dashboard.

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
    storage.ts           # SSR-safe localStorage wrapper
    seeds.ts             # One-time seed data on first load
  types/                 # Shared TypeScript interfaces
  context/               # AuthContext
```

---

## Data

All data lives in `localStorage`:

| Key | Contents |
|-----|----------|
| `taskify:users` | Users |
| `taskify:tasks` | Tasks |
| `taskify:settings` | Per-user settings |
| `taskify:priorityLabels` | Labels |
| `taskify:priorities` | Priority levels |
| `taskify:currentUserId` | Active session |
| `taskify:seeded` | One-time seed flag |

To reset everything: DevTools → Application → Local Storage → delete all `taskify:*` keys and reload.

---

## Tech stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Rich text | TipTap |
| Drag & drop | @dnd-kit |
| Charts | Recharts |
| Dates | date-fns |
| Toasts | Sonner |
| Persistence | localStorage (service layer only) |

---

## Development

```bash
npm run dev          # Start dev server — hot reloads on every save
npx tsc --noEmit     # Type-check without touching the dev server
npm run lint         # Lint
```

> Do not run `npm run build` during development. It writes production chunks that break hot reload. Use `npx tsc --noEmit` to type-check instead.

---

## Migrating to a real database

The service layer (`src/services/`) is the only thing that needs to change. Every function maps 1:1 to a database query. UI components never touch storage directly.

```ts
// Before (localStorage)
export function getTasksByUser(userId: string): Task[] {
  return (storageGet<Task[]>(TASKS_KEY) ?? []).filter(t => t.userId === userId)
}

// After (Supabase)
export async function getTasksByUser(userId: string): Promise<Task[]> {
  const { data } = await supabase.from('tasks').select('*').eq('user_id', userId)
  return data ?? []
}
```
