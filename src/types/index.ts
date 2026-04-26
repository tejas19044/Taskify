export type WorkingMode = '5-day' | '7-day'
export type BoardMode = 'current-week' | 'rolling'
export type DashboardRange = 'today' | 'this-week' | 'last-week' | 'this-month' | 'last-30' | 'this-quarter' | 'custom'
export type UserRole = 'admin' | 'user'

export interface Task {
  id: string
  userId: string
  title: string
  description: string
  scheduledDate: string // YYYY-MM-DD
  estimatedHours: number
  labelId: string
  priorityId: string
  tags: string[]
  referenceUrl?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  username: string
  // NOTE: Plaintext password — mock prototype only. Replace with Supabase Auth in production.
  password: string
  role: UserRole
  active: boolean
  createdAt: string
}

export interface Label {
  id: string
  userId: string
  name: string
  color: string // hex e.g. '#6366f1'
  createdAt: string
}

export interface Priority {
  id: string
  userId: string
  name: string
  color: string
  createdAt: string
}

// Keep PriorityLabel as alias for Label for backward compatibility
export type PriorityLabel = Label

export interface UserSettings {
  userId: string
  workingMode: WorkingMode
  boardMode: BoardMode
  defaultDashboardRange: DashboardRange
  defaultDailyHours: number
  perDayOverrides: Record<string, number> // e.g. { 'Wednesday': 6 }
}

export interface DailyWorkload {
  date: string
  hours: number
  count: number
  capacity: number
}

export interface WeeklyTrend {
  week: string
  totalHours: number
  completedHours: number
  taskCount: number
}

export interface TagBreakdown {
  tag: string
  hours: number
  count: number
}

export interface PriorityBreakdown {
  priorityLabelId: string
  labelName: string
  labelColor: string
  hours: number
  count: number
}

export interface AnalyticsSummary {
  rangeCompletedTasks: number
  rangeCompletedHours: number
  completionRate: number      // 0-100
  currentStreak: number       // consecutive past days with tasks
  avgHoursPerDay: number
  totalRangeTasks: number
}
