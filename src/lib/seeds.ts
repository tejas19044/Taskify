import { storageGet, storageSet, STORAGE_KEYS } from './storage'
import { createUser } from '@/services/userService'
import { bulkSeedTasks } from '@/services/taskService'
import { bulkSeedLabels } from '@/services/priorityLabelService'
import { bulkSeedPriorities } from '@/services/priorityService'
import { updateSettings } from '@/services/settingsService'
import { addDays, startOfWeek } from 'date-fns'
import { toYMD } from './dateUtils'
import type { Task, Label } from '@/types'

function getMonday(offset: number = 0): Date {
  const today = new Date()
  const monday = startOfWeek(today, { weekStartsOn: 1 })
  return addDays(monday, offset * 7)
}

export function seedIfEmpty(): void {
  if (storageGet<string>(STORAGE_KEYS.SEEDED) === 'v5') return

  storageSet(STORAGE_KEYS.USERS, [])
  storageSet(STORAGE_KEYS.TASKS, [])
  storageSet(STORAGE_KEYS.SETTINGS, [])
  storageSet(STORAGE_KEYS.PRIORITY_LABELS, [])
  storageSet(STORAGE_KEYS.PRIORITIES, [])

  const admin = createUser({ username: 'admin', password: 'admin123', role: 'admin', active: true })
  const tejas = createUser({ username: 'tejas', password: 'tejas123', role: 'user', active: true })

  updateSettings(tejas.id, { workingMode: '5-day', boardMode: 'current-week', defaultDailyHours: 8 })
  updateSettings(admin.id, { workingMode: '5-day', boardMode: 'current-week', defaultDailyHours: 8 })

  // ── Tejas labels ──────────────────────────────────────────────────────────
  const tL = {
    deepWork: crypto.randomUUID(),
    urgent:   crypto.randomUUID(),
    client:   crypto.randomUUID(),
    learning: crypto.randomUUID(),
    taskify: crypto.randomUUID(),
  }
  bulkSeedLabels([
    { id: tL.deepWork, userId: tejas.id, name: 'Deep Work', color: '#6366f1', createdAt: new Date().toISOString() },
    { id: tL.urgent,   userId: tejas.id, name: 'Urgent',    color: '#ef4444', createdAt: new Date().toISOString() },
    { id: tL.client,   userId: tejas.id, name: 'Client',    color: '#f59e0b', createdAt: new Date().toISOString() },
    { id: tL.learning, userId: tejas.id, name: 'Learning',  color: '#10b981', createdAt: new Date().toISOString() },
    { id: tL.taskify, userId: tejas.id, name: 'Taskify',  color: '#8b5cf6', createdAt: new Date().toISOString() },
  ] as Label[])

  // ── Admin labels ──────────────────────────────────────────────────────────
  const aL = {
    strategy: crypto.randomUUID(),
    infra:    crypto.randomUUID(),
    ops:      crypto.randomUUID(),
    urgent:   crypto.randomUUID(),
    team:     crypto.randomUUID(),
  }
  bulkSeedLabels([
    { id: aL.strategy, userId: admin.id, name: 'Strategy',       color: '#6366f1', createdAt: new Date().toISOString() },
    { id: aL.infra,    userId: admin.id, name: 'Infrastructure',  color: '#f59e0b', createdAt: new Date().toISOString() },
    { id: aL.ops,      userId: admin.id, name: 'Operations',      color: '#10b981', createdAt: new Date().toISOString() },
    { id: aL.urgent,   userId: admin.id, name: 'Urgent',          color: '#ef4444', createdAt: new Date().toISOString() },
    { id: aL.team,     userId: admin.id, name: 'Team',            color: '#8b5cf6', createdAt: new Date().toISOString() },
  ] as Label[])

  // ── Tejas priorities ──────────────────────────────────────────────────────
  const tP = {
    high:   crypto.randomUUID(),
    medium: crypto.randomUUID(),
    low:    crypto.randomUUID(),
  }
  bulkSeedPriorities([
    { id: tP.high,   userId: tejas.id, name: 'High',   color: '#ef4444', createdAt: new Date().toISOString() },
    { id: tP.medium, userId: tejas.id, name: 'Medium', color: '#f59e0b', createdAt: new Date().toISOString() },
    { id: tP.low,    userId: tejas.id, name: 'Low',    color: '#10b981', createdAt: new Date().toISOString() },
  ])

  // ── Admin priorities ──────────────────────────────────────────────────────
  const aP = {
    high:   crypto.randomUUID(),
    medium: crypto.randomUUID(),
    low:    crypto.randomUUID(),
  }
  bulkSeedPriorities([
    { id: aP.high,   userId: admin.id, name: 'High',   color: '#ef4444', createdAt: new Date().toISOString() },
    { id: aP.medium, userId: admin.id, name: 'Medium', color: '#f59e0b', createdAt: new Date().toISOString() },
    { id: aP.low,    userId: admin.id, name: 'Low',    color: '#10b981', createdAt: new Date().toISOString() },
  ])

  const now = new Date().toISOString()
  const w3  = getMonday(-3)   // 3 weeks ago
  const w2  = getMonday(-2)   // 2 weeks ago
  const w1  = getMonday(-1)   // last week
  const w0  = getMonday(0)    // this week
  const w1f = getMonday(1)    // next week

  // ── Tejas tasks ───────────────────────────────────────────────────────────
  const tejasTasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
    // 3 weeks ago
    { userId: tejas.id, title: 'Set up project scaffolding', description: '', scheduledDate: toYMD(w3), estimatedHours: 3, labelId: tL.taskify, priorityId: tP.high, tags: ['Taskify'] },
    { userId: tejas.id, title: 'Cold outreach — first batch', description: '', scheduledDate: toYMD(w3), estimatedHours: 2, labelId: tL.urgent, priorityId: tP.high, tags: ['Job Search'] },
    { userId: tejas.id, title: 'Read Shape Up by Basecamp', description: '', scheduledDate: toYMD(addDays(w3, 1)), estimatedHours: 2, labelId: tL.learning, priorityId: tP.low, tags: ['Learning'] },
    { userId: tejas.id, title: 'DBH kickoff call prep', description: '', scheduledDate: toYMD(addDays(w3, 1)), estimatedHours: 1.5, labelId: tL.client, priorityId: tP.medium, tags: ['DBH'] },
    { userId: tejas.id, title: 'Competitive landscape research', description: '', scheduledDate: toYMD(addDays(w3, 2)), estimatedHours: 3, labelId: tL.deepWork, priorityId: tP.medium, tags: ['Product', 'Taskify'] },
    { userId: tejas.id, title: 'Resume review with mentor', description: '', scheduledDate: toYMD(addDays(w3, 2)), estimatedHours: 1, labelId: tL.urgent, priorityId: tP.high, tags: ['Job Search'] },
    { userId: tejas.id, title: 'DBH stakeholder interviews', description: '', scheduledDate: toYMD(addDays(w3, 3)), estimatedHours: 4, labelId: tL.client, priorityId: tP.high, tags: ['DBH', 'Product'] },
    { userId: tejas.id, title: 'System design practice — URL shortener', description: '', scheduledDate: toYMD(addDays(w3, 3)), estimatedHours: 2, labelId: tL.learning, priorityId: tP.medium, tags: ['Learning'] },
    { userId: tejas.id, title: 'Weekly retro + OKR check-in', description: '', scheduledDate: toYMD(addDays(w3, 4)), estimatedHours: 1.5, labelId: tL.deepWork, priorityId: tP.low, tags: ['Personal'] },
    // 2 weeks ago
    { userId: tejas.id, title: 'Draft outreach messages for PM roles', description: '', scheduledDate: toYMD(w2), estimatedHours: 2, labelId: tL.urgent, priorityId: tP.high, tags: ['Job Search'] },
    { userId: tejas.id, title: 'Review DBH database schema', description: '', scheduledDate: toYMD(w2), estimatedHours: 3, labelId: tL.deepWork, priorityId: tP.medium, tags: ['DBH'] },
    { userId: tejas.id, title: 'Study AI PM interview notes', description: '', scheduledDate: toYMD(addDays(w2, 1)), estimatedHours: 2.5, labelId: tL.learning, priorityId: tP.medium, tags: ['Learning', 'Job Search'] },
    { userId: tejas.id, title: 'Update resume bullet points', description: '', scheduledDate: toYMD(addDays(w2, 1)), estimatedHours: 1.5, labelId: tL.urgent, priorityId: tP.high, tags: ['Job Search'] },
    { userId: tejas.id, title: 'Read DDIA Chapter 3 — Storage & Retrieval', description: '', scheduledDate: toYMD(addDays(w2, 2)), estimatedHours: 2, labelId: tL.learning, priorityId: tP.low, tags: ['Learning'] },
    { userId: tejas.id, title: 'DBH feature sprint planning', description: '', scheduledDate: toYMD(addDays(w2, 2)), estimatedHours: 3, labelId: tL.client, priorityId: tP.high, tags: ['DBH', 'Product'] },
    { userId: tejas.id, title: 'Analyze product metrics — Q1 retention cohorts', description: '', scheduledDate: toYMD(addDays(w2, 3)), estimatedHours: 4, labelId: tL.deepWork, priorityId: tP.medium, tags: ['Product', 'DBH'] },
    { userId: tejas.id, title: 'Competitive analysis — task management apps', description: '', scheduledDate: toYMD(addDays(w2, 3)), estimatedHours: 2, labelId: tL.taskify, priorityId: tP.medium, tags: ['Taskify', 'Product'] },
    { userId: tejas.id, title: 'LinkedIn profile overhaul', description: '', scheduledDate: toYMD(addDays(w2, 4)), estimatedHours: 1.5, labelId: tL.urgent, priorityId: tP.medium, tags: ['Job Search'] },
    { userId: tejas.id, title: 'Write Taskify PRD v1', description: '', scheduledDate: toYMD(addDays(w2, 4)), estimatedHours: 3, labelId: tL.taskify, priorityId: tP.high, tags: ['Taskify', 'Product'] },
    // last week
    { userId: tejas.id, title: 'Build Taskify core board', description: '', scheduledDate: toYMD(w1), estimatedHours: 5, labelId: tL.taskify, priorityId: tP.high, tags: ['Taskify'] },
    { userId: tejas.id, title: 'Apply to 3 PM roles', description: '', scheduledDate: toYMD(w1), estimatedHours: 2, labelId: tL.urgent, priorityId: tP.high, tags: ['Job Search'] },
    { userId: tejas.id, title: 'DBH patient dashboard wireframes', description: '', scheduledDate: toYMD(addDays(w1, 1)), estimatedHours: 3, labelId: tL.client, priorityId: tP.medium, tags: ['DBH', 'Product'] },
    { userId: tejas.id, title: 'Build analytics dashboard', description: '', scheduledDate: toYMD(addDays(w1, 1)), estimatedHours: 4, labelId: tL.taskify, priorityId: tP.high, tags: ['Taskify'] },
    { userId: tejas.id, title: 'Prep Q2 stakeholder deck', description: '', scheduledDate: toYMD(addDays(w1, 2)), estimatedHours: 3.5, labelId: tL.deepWork, priorityId: tP.medium, tags: ['Product', 'DBH'] },
    { userId: tejas.id, title: 'Mock interview — product sense', description: '', scheduledDate: toYMD(addDays(w1, 2)), estimatedHours: 2, labelId: tL.learning, priorityId: tP.medium, tags: ['Learning', 'Job Search'] },
    { userId: tejas.id, title: 'Finalize DBH onboarding spec', description: '', scheduledDate: toYMD(addDays(w1, 3)), estimatedHours: 2.5, labelId: tL.client, priorityId: tP.medium, tags: ['DBH'] },
    { userId: tejas.id, title: 'Taskify settings + auth pages', description: '', scheduledDate: toYMD(addDays(w1, 3)), estimatedHours: 3, labelId: tL.taskify, priorityId: tP.high, tags: ['Taskify'] },
    { userId: tejas.id, title: 'Weekly review + next week planning', description: '', scheduledDate: toYMD(addDays(w1, 4)), estimatedHours: 1.5, labelId: tL.deepWork, priorityId: tP.low, tags: ['Personal'] },
    // this week
    { userId: tejas.id, title: 'Taskify — drag and drop polish', description: '', scheduledDate: toYMD(w0), estimatedHours: 4, labelId: tL.taskify, priorityId: tP.high, tags: ['Taskify'] },
    { userId: tejas.id, title: 'Apply to Rippling and Ramp', description: '', scheduledDate: toYMD(w0), estimatedHours: 2, labelId: tL.urgent, priorityId: tP.high, tags: ['Job Search'] },
    { userId: tejas.id, title: 'DBH Q2 sprint kickoff', description: '', scheduledDate: toYMD(addDays(w0, 1)), estimatedHours: 2, labelId: tL.client, priorityId: tP.medium, tags: ['DBH'] },
    { userId: tejas.id, title: 'Taskify calendar view', description: '', scheduledDate: toYMD(addDays(w0, 1)), estimatedHours: 5, labelId: tL.taskify, priorityId: tP.high, tags: ['Taskify'] },
    { userId: tejas.id, title: 'Read Inspired by Marty Cagan — Ch 1–4', description: '', scheduledDate: toYMD(addDays(w0, 2)), estimatedHours: 2, labelId: tL.learning, priorityId: tP.low, tags: ['Learning'] },
    { userId: tejas.id, title: 'DBH metrics review', description: '', scheduledDate: toYMD(addDays(w0, 2)), estimatedHours: 3, labelId: tL.client, priorityId: tP.medium, tags: ['DBH', 'Product'] },
    { userId: tejas.id, title: 'Taskify admin panel', description: '', scheduledDate: toYMD(addDays(w0, 3)), estimatedHours: 3, labelId: tL.taskify, priorityId: tP.high, tags: ['Taskify'] },
    { userId: tejas.id, title: 'Prep for Linear PM screen', description: '', scheduledDate: toYMD(addDays(w0, 4)), estimatedHours: 3, labelId: tL.urgent, priorityId: tP.high, tags: ['Job Search', 'Learning'] },
    // next week
    { userId: tejas.id, title: 'Q2 planning — Taskify roadmap', description: '', scheduledDate: toYMD(w1f), estimatedHours: 3, labelId: tL.taskify, priorityId: tP.medium, tags: ['Taskify', 'Product'] },
    { userId: tejas.id, title: 'Taskify v2 wireframes', description: '', scheduledDate: toYMD(w1f), estimatedHours: 4, labelId: tL.taskify, priorityId: tP.medium, tags: ['Taskify'] },
    { userId: tejas.id, title: 'Portfolio website update', description: '', scheduledDate: toYMD(addDays(w1f, 1)), estimatedHours: 3, labelId: tL.urgent, priorityId: tP.medium, tags: ['Job Search', 'Personal'] },
    { userId: tejas.id, title: 'Stripe PM interview prep', description: '', scheduledDate: toYMD(addDays(w1f, 2)), estimatedHours: 2, labelId: tL.learning, priorityId: tP.medium, tags: ['Job Search', 'Learning'] },
    { userId: tejas.id, title: 'Write Taskify engineering spec', description: '', scheduledDate: toYMD(addDays(w1f, 3)), estimatedHours: 4, labelId: tL.deepWork, priorityId: tP.medium, tags: ['Taskify'] },
    { userId: tejas.id, title: 'Apply to 5 more PM roles', description: '', scheduledDate: toYMD(addDays(w1f, 4)), estimatedHours: 2.5, labelId: tL.urgent, priorityId: tP.medium, tags: ['Job Search'] },
    // pending (unscheduled)
    { userId: tejas.id, title: 'Migrate Taskify to Supabase', description: '', scheduledDate: null, estimatedHours: 6, labelId: tL.taskify, priorityId: tP.high, tags: ['Taskify'] },
    { userId: tejas.id, title: 'Record product demo video', description: '', scheduledDate: null, estimatedHours: 2, labelId: tL.taskify, priorityId: tP.medium, tags: ['Taskify', 'Product'] },
    { userId: tejas.id, title: 'Research YC application requirements', description: '', scheduledDate: null, estimatedHours: 1.5, labelId: tL.learning, priorityId: tP.medium, tags: ['Personal'] },
    { userId: tejas.id, title: 'Create case study — DBH project', description: '', scheduledDate: null, estimatedHours: 3, labelId: tL.client, priorityId: tP.medium, tags: ['DBH', 'Product'] },
    { userId: tejas.id, title: 'Refactor Taskify task service for Supabase', description: '', scheduledDate: null, estimatedHours: 4, labelId: tL.deepWork, priorityId: tP.low, tags: ['Taskify'] },
  ]

  // ── Admin tasks ───────────────────────────────────────────────────────────
  const adminTasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
    // 3 weeks ago
    { userId: admin.id, title: 'Audit user permissions across all services', description: '', scheduledDate: toYMD(w3), estimatedHours: 3, labelId: aL.ops, priorityId: aP.high, tags: ['Security', 'Ops'] },
    { userId: admin.id, title: 'Define Q2 platform OKRs', description: '', scheduledDate: toYMD(w3), estimatedHours: 2.5, labelId: aL.strategy, priorityId: aP.medium, tags: ['Strategy'] },
    { userId: admin.id, title: 'Migrate staging DB to Postgres 16', description: '', scheduledDate: toYMD(addDays(w3, 1)), estimatedHours: 4, labelId: aL.infra, priorityId: aP.high, tags: ['Infrastructure'] },
    { userId: admin.id, title: 'Onboarding docs for new engineers', description: '', scheduledDate: toYMD(addDays(w3, 1)), estimatedHours: 2, labelId: aL.team, priorityId: aP.low, tags: ['Team'] },
    { userId: admin.id, title: 'GDPR compliance review — data retention', description: '', scheduledDate: toYMD(addDays(w3, 2)), estimatedHours: 3, labelId: aL.urgent, priorityId: aP.high, tags: ['Security', 'Compliance'] },
    { userId: admin.id, title: 'CI/CD pipeline optimisation', description: '', scheduledDate: toYMD(addDays(w3, 2)), estimatedHours: 3.5, labelId: aL.infra, priorityId: aP.medium, tags: ['Infrastructure'] },
    { userId: admin.id, title: '1:1s with engineering leads', description: '', scheduledDate: toYMD(addDays(w3, 3)), estimatedHours: 2, labelId: aL.team, priorityId: aP.low, tags: ['Team'] },
    { userId: admin.id, title: 'Draft SLA for API uptime', description: '', scheduledDate: toYMD(addDays(w3, 3)), estimatedHours: 2, labelId: aL.strategy, priorityId: aP.medium, tags: ['Strategy', 'Ops'] },
    { userId: admin.id, title: 'Cost review — cloud spend Q1', description: '', scheduledDate: toYMD(addDays(w3, 4)), estimatedHours: 2, labelId: aL.ops, priorityId: aP.low, tags: ['Ops'] },
    // 2 weeks ago
    { userId: admin.id, title: 'Set up Grafana alerting for API errors', description: '', scheduledDate: toYMD(w2), estimatedHours: 3, labelId: aL.infra, priorityId: aP.high, tags: ['Infrastructure'] },
    { userId: admin.id, title: 'Product strategy doc — H2 priorities', description: '', scheduledDate: toYMD(w2), estimatedHours: 4, labelId: aL.strategy, priorityId: aP.medium, tags: ['Strategy'] },
    { userId: admin.id, title: 'Incident post-mortem — auth outage', description: '', scheduledDate: toYMD(addDays(w2, 1)), estimatedHours: 2.5, labelId: aL.urgent, priorityId: aP.high, tags: ['Security', 'Ops'] },
    { userId: admin.id, title: 'Hire senior backend engineer — interview loop', description: '', scheduledDate: toYMD(addDays(w2, 1)), estimatedHours: 3, labelId: aL.team, priorityId: aP.medium, tags: ['Team', 'Hiring'] },
    { userId: admin.id, title: 'Kubernetes cluster upgrade to 1.30', description: '', scheduledDate: toYMD(addDays(w2, 2)), estimatedHours: 5, labelId: aL.infra, priorityId: aP.high, tags: ['Infrastructure'] },
    { userId: admin.id, title: 'Run quarterly all-hands', description: '', scheduledDate: toYMD(addDays(w2, 2)), estimatedHours: 2, labelId: aL.team, priorityId: aP.medium, tags: ['Team'] },
    { userId: admin.id, title: 'Review and merge Q1 security patches', description: '', scheduledDate: toYMD(addDays(w2, 3)), estimatedHours: 3, labelId: aL.urgent, priorityId: aP.high, tags: ['Security'] },
    { userId: admin.id, title: 'API versioning strategy write-up', description: '', scheduledDate: toYMD(addDays(w2, 3)), estimatedHours: 2, labelId: aL.strategy, priorityId: aP.medium, tags: ['Strategy'] },
    { userId: admin.id, title: 'Vendor review — Datadog vs New Relic', description: '', scheduledDate: toYMD(addDays(w2, 4)), estimatedHours: 2.5, labelId: aL.ops, priorityId: aP.low, tags: ['Ops', 'Infrastructure'] },
    // last week
    { userId: admin.id, title: 'Supabase migration planning', description: '', scheduledDate: toYMD(w1), estimatedHours: 4, labelId: aL.infra, priorityId: aP.high, tags: ['Infrastructure'] },
    { userId: admin.id, title: 'Define engineering career ladder', description: '', scheduledDate: toYMD(w1), estimatedHours: 3, labelId: aL.team, priorityId: aP.medium, tags: ['Team'] },
    { userId: admin.id, title: 'Security penetration test — scope & schedule', description: '', scheduledDate: toYMD(addDays(w1, 1)), estimatedHours: 2, labelId: aL.urgent, priorityId: aP.high, tags: ['Security'] },
    { userId: admin.id, title: 'Q2 roadmap presentation to board', description: '', scheduledDate: toYMD(addDays(w1, 1)), estimatedHours: 3, labelId: aL.strategy, priorityId: aP.high, tags: ['Strategy'] },
    { userId: admin.id, title: 'Deploy feature flags system', description: '', scheduledDate: toYMD(addDays(w1, 2)), estimatedHours: 4, labelId: aL.infra, priorityId: aP.medium, tags: ['Infrastructure'] },
    { userId: admin.id, title: 'Performance review cycle kick-off', description: '', scheduledDate: toYMD(addDays(w1, 2)), estimatedHours: 2, labelId: aL.team, priorityId: aP.low, tags: ['Team'] },
    { userId: admin.id, title: 'Fix production memory leak in worker', description: '', scheduledDate: toYMD(addDays(w1, 3)), estimatedHours: 5, labelId: aL.urgent, priorityId: aP.high, tags: ['Infrastructure', 'Ops'] },
    { userId: admin.id, title: 'Ops runbook update', description: '', scheduledDate: toYMD(addDays(w1, 4)), estimatedHours: 2, labelId: aL.ops, priorityId: aP.low, tags: ['Ops'] },
    // this week
    { userId: admin.id, title: 'Database index audit — slow query report', description: '', scheduledDate: toYMD(w0), estimatedHours: 3, labelId: aL.infra, priorityId: aP.medium, tags: ['Infrastructure'] },
    { userId: admin.id, title: 'Finalise H2 hiring plan', description: '', scheduledDate: toYMD(w0), estimatedHours: 2, labelId: aL.team, priorityId: aP.medium, tags: ['Team', 'Hiring'] },
    { userId: admin.id, title: 'SOC 2 evidence collection sprint', description: '', scheduledDate: toYMD(addDays(w0, 1)), estimatedHours: 4, labelId: aL.urgent, priorityId: aP.high, tags: ['Security', 'Compliance'] },
    { userId: admin.id, title: 'Roadmap sync with product team', description: '', scheduledDate: toYMD(addDays(w0, 1)), estimatedHours: 1.5, labelId: aL.strategy, priorityId: aP.medium, tags: ['Strategy'] },
    { userId: admin.id, title: 'CDN configuration review', description: '', scheduledDate: toYMD(addDays(w0, 2)), estimatedHours: 2.5, labelId: aL.infra, priorityId: aP.medium, tags: ['Infrastructure'] },
    { userId: admin.id, title: 'Team retro — sprint 22', description: '', scheduledDate: toYMD(addDays(w0, 2)), estimatedHours: 1.5, labelId: aL.team, priorityId: aP.low, tags: ['Team'] },
    { userId: admin.id, title: 'On-call rotation schedule — Q2', description: '', scheduledDate: toYMD(addDays(w0, 3)), estimatedHours: 1, labelId: aL.ops, priorityId: aP.low, tags: ['Ops'] },
    { userId: admin.id, title: 'Architecture decision record — event streaming', description: '', scheduledDate: toYMD(addDays(w0, 3)), estimatedHours: 3, labelId: aL.strategy, priorityId: aP.medium, tags: ['Strategy', 'Infrastructure'] },
    { userId: admin.id, title: 'Budget forecast — cloud & tooling Q3', description: '', scheduledDate: toYMD(addDays(w0, 4)), estimatedHours: 2, labelId: aL.ops, priorityId: aP.low, tags: ['Ops'] },
    // next week
    { userId: admin.id, title: 'Zero-downtime deployment strategy', description: '', scheduledDate: toYMD(w1f), estimatedHours: 4, labelId: aL.infra, priorityId: aP.high, tags: ['Infrastructure'] },
    { userId: admin.id, title: 'Q3 platform strategy doc', description: '', scheduledDate: toYMD(w1f), estimatedHours: 3, labelId: aL.strategy, priorityId: aP.medium, tags: ['Strategy'] },
    { userId: admin.id, title: 'Onboard two new engineers', description: '', scheduledDate: toYMD(addDays(w1f, 1)), estimatedHours: 3, labelId: aL.team, priorityId: aP.medium, tags: ['Team', 'Hiring'] },
    { userId: admin.id, title: 'Implement rate limiting on public API', description: '', scheduledDate: toYMD(addDays(w1f, 2)), estimatedHours: 4, labelId: aL.urgent, priorityId: aP.high, tags: ['Security', 'Infrastructure'] },
    { userId: admin.id, title: 'Log aggregation pipeline upgrade', description: '', scheduledDate: toYMD(addDays(w1f, 3)), estimatedHours: 3, labelId: aL.infra, priorityId: aP.medium, tags: ['Infrastructure'] },
    // pending (unscheduled)
    { userId: admin.id, title: 'Evaluate Neon DB for serverless Postgres', description: '', scheduledDate: null, estimatedHours: 2, labelId: aL.infra, priorityId: aP.medium, tags: ['Infrastructure'] },
    { userId: admin.id, title: 'Draft engineering blog post — lessons from SOC 2', description: '', scheduledDate: null, estimatedHours: 3, labelId: aL.strategy, priorityId: aP.low, tags: ['Strategy'] },
    { userId: admin.id, title: 'Set up internal dev docs site', description: '', scheduledDate: null, estimatedHours: 4, labelId: aL.team, priorityId: aP.low, tags: ['Team'] },
    { userId: admin.id, title: 'Define data deletion policy', description: '', scheduledDate: null, estimatedHours: 2, labelId: aL.urgent, priorityId: aP.medium, tags: ['Security', 'Compliance'] },
  ]

  const allTasks: Task[] = [...tejasTasks, ...adminTasks].map((t) => ({
    ...t,
    id: crypto.randomUUID(),
    description: t.description ?? '',
    createdAt: now,
    updatedAt: now,
  }))

  bulkSeedTasks(allTasks)
  storageSet(STORAGE_KEYS.SEEDED, 'v5')
}
