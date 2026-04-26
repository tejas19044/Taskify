// Pure computation functions — no side effects, no localStorage access.
// Takes tasks array and options, returns computed metrics.
// A task is "completed" if scheduledDate < today (no status field).

import type {
  Task,
  Label,
  Priority,
  DailyWorkload,
  WeeklyTrend,
  TagBreakdown,
  PriorityBreakdown,
  AnalyticsSummary,
} from '@/types'
import {
  getDaysInRange,
  isDateDone,
  toYMD,
  getWeekLabel,
} from './dateUtils'
import { startOfWeek, addDays, subDays, subWeeks } from 'date-fns'

export function computeDailyWorkload(
  tasks: Task[],
  start: string,
  end: string,
  dailyCapacity: number = 8
): DailyWorkload[] {
  const days = getDaysInRange(start, end)
  return days.map((date) => {
    const dayTasks = tasks.filter((t) => t.scheduledDate === date)
    return {
      date,
      hours: dayTasks.reduce((sum, t) => sum + t.estimatedHours, 0),
      count: dayTasks.length,
      capacity: dailyCapacity,
    }
  })
}

export function computeWeeklyTrend(tasks: Task[], weeks: number = 8): WeeklyTrend[] {
  const result: WeeklyTrend[] = []
  const today = new Date()
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 })
    const weekDays = Array.from({ length: 7 }, (_, j) => toYMD(addDays(weekStart, j)))
    const weekTasks = tasks.filter((t) => weekDays.includes(t.scheduledDate))
    const completedTasks = weekTasks.filter((t) => isDateDone(t.scheduledDate))
    result.push({
      week: getWeekLabel(weekStart),
      totalHours: weekTasks.reduce((sum, t) => sum + t.estimatedHours, 0),
      completedHours: completedTasks.reduce((sum, t) => sum + t.estimatedHours, 0),
      taskCount: weekTasks.length,
    })
  }
  return result
}

export function computeTagBreakdown(tasks: Task[], start: string, end: string): TagBreakdown[] {
  const days = getDaysInRange(start, end)
  const rangedTasks = tasks.filter((t) => days.includes(t.scheduledDate))
  const map = new Map<string, { hours: number; count: number }>()
  for (const task of rangedTasks) {
    for (const tag of task.tags) {
      const existing = map.get(tag) ?? { hours: 0, count: 0 }
      map.set(tag, { hours: existing.hours + task.estimatedHours, count: existing.count + 1 })
    }
  }
  return Array.from(map.entries())
    .map(([tag, { hours, count }]) => ({ tag, hours, count }))
    .sort((a, b) => b.hours - a.hours)
}

// Label breakdown (uses labelId, falls back to priorityLabelId for old data)
export function computeLabelBreakdown(
  tasks: Task[],
  labels: Label[],
  start: string,
  end: string
): PriorityBreakdown[] {
  const days = getDaysInRange(start, end)
  const rangedTasks = tasks.filter((t) => days.includes(t.scheduledDate) && isDateDone(t.scheduledDate))
  const map = new Map<string, { hours: number; count: number }>()
  for (const task of rangedTasks) {
    const id = task.labelId || ''
    if (!id) continue
    const existing = map.get(id) ?? { hours: 0, count: 0 }
    map.set(id, { hours: existing.hours + task.estimatedHours, count: existing.count + 1 })
  }
  return Array.from(map.entries())
    .map(([id, { hours, count }]) => {
      const label = labels.find((l) => l.id === id)
      return {
        priorityLabelId: id,
        labelName: label?.name ?? 'Unknown',
        labelColor: label?.color ?? '#94a3b8',
        hours,
        count,
      }
    })
    .sort((a, b) => b.hours - a.hours)
}

// Keep old name as alias for backward compat
export const computePriorityBreakdown = computeLabelBreakdown

// Priority level breakdown (High/Medium/Low)
export function computePriorityLevelBreakdown(
  tasks: Task[],
  priorities: Priority[],
  start: string,
  end: string
): PriorityBreakdown[] {
  const days = getDaysInRange(start, end)
  const rangedTasks = tasks.filter((t) => days.includes(t.scheduledDate) && isDateDone(t.scheduledDate))
  const map = new Map<string, { hours: number; count: number }>()
  for (const task of rangedTasks) {
    if (!task.priorityId) continue
    const existing = map.get(task.priorityId) ?? { hours: 0, count: 0 }
    map.set(task.priorityId, { hours: existing.hours + task.estimatedHours, count: existing.count + 1 })
  }
  return Array.from(map.entries())
    .map(([id, { hours, count }]) => {
      const p = priorities.find((p) => p.id === id)
      return {
        priorityLabelId: id,
        labelName: p?.name ?? 'Unknown',
        labelColor: p?.color ?? '#94a3b8',
        hours,
        count,
      }
    })
    .sort((a, b) => b.hours - a.hours)
}

export function computeSummary(
  tasks: Task[],
  start: string,
  end: string,
  dailyCapacity: number = 8
): AnalyticsSummary {
  const daily = computeDailyWorkload(tasks, start, end, dailyCapacity)
  const days = getDaysInRange(start, end)
  const rangeTasks = tasks.filter((t) => days.includes(t.scheduledDate))
  const rangeCompletedTasks = rangeTasks.filter((t) => isDateDone(t.scheduledDate))

  // Streak: consecutive past days ending yesterday where at least 1 task was scheduled
  const completedDateSet = new Set(
    tasks.filter((t) => isDateDone(t.scheduledDate)).map((t) => t.scheduledDate)
  )
  let streak = 0
  let cursor = subDays(new Date(), 1)
  while (completedDateSet.has(toYMD(cursor))) {
    streak++
    cursor = subDays(cursor, 1)
  }

  const activeDays = daily.filter((d) => d.count > 0)
  const totalHours = activeDays.reduce((sum, d) => sum + d.hours, 0)

  return {
    rangeCompletedTasks: rangeCompletedTasks.length,
    rangeCompletedHours: Math.round(rangeCompletedTasks.reduce((s, t) => s + t.estimatedHours, 0) * 10) / 10,
    completionRate: rangeTasks.length > 0
      ? Math.round((rangeCompletedTasks.length / rangeTasks.length) * 100)
      : 0,
    currentStreak: streak,
    avgHoursPerDay: activeDays.length > 0 ? Math.round((totalHours / activeDays.length) * 10) / 10 : 0,
    totalRangeTasks: rangeTasks.length,
  }
}
