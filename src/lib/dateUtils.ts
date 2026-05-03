import {
  startOfWeek,
  endOfWeek,
  addDays,
  subDays,
  addMonths,
  format,
  parseISO,
  isToday,
  isBefore,
  isAfter,
  startOfMonth,
  endOfMonth,
  startOfDay,
  differenceInDays,
  addWeeks,
  subWeeks,
  getISOWeek,
  getYear,
} from 'date-fns'
import type { WorkingMode, RecurrenceRule } from '@/types'

export function toYMD(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function fromYMD(ymd: string): Date {
  // Use parseISO to avoid timezone off-by-one when parsing YYYY-MM-DD
  return parseISO(ymd)
}

export function todayYMD(): string {
  return toYMD(new Date())
}

export function isDateInPast(ymd: string): boolean {
  return isBefore(fromYMD(ymd), startOfDay(new Date()))
}

export function isDateDone(ymd: string): boolean {
  // A task is "done" if its date is today or earlier
  return !isAfter(fromYMD(ymd), startOfDay(new Date()))
}

export function isDateToday(ymd: string): boolean {
  return isToday(fromYMD(ymd))
}

export function isDateFuture(ymd: string): boolean {
  return isAfter(fromYMD(ymd), startOfDay(new Date()))
}

export function getWeekDays(date: Date, mode: WorkingMode): Date[] {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // Monday
  const days = Array.from({ length: mode === '7-day' ? 7 : 5 }, (_, i) =>
    addDays(weekStart, i)
  )
  return days
}

export function getRollingDays(centerDate: Date, mode: WorkingMode): Date[] {
  const total = mode === '7-day' ? 7 : 5
  const before = Math.floor((total - 1) / 2)
  return Array.from({ length: total }, (_, i) => addDays(centerDate, i - before))
}

export function getPrevWeekStart(date: Date): Date {
  return subWeeks(startOfWeek(date, { weekStartsOn: 1 }), 1)
}

export function getNextWeekStart(date: Date): Date {
  return addWeeks(startOfWeek(date, { weekStartsOn: 1 }), 1)
}

export function getDaysInRange(start: string, end: string): string[] {
  const startDate = fromYMD(start)
  const endDate = fromYMD(end)
  const diff = differenceInDays(endDate, startDate)
  return Array.from({ length: diff + 1 }, (_, i) => toYMD(addDays(startDate, i)))
}

export function getMonthGrid(date: Date): Date[] {
  const monthStart = startOfMonth(date)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  return Array.from({ length: 42 }, (_, i) => addDays(calStart, i))
}

export function getWeekLabel(date: Date): string {
  const week = getISOWeek(date)
  const year = getYear(date)
  return `W${week} ${year}`
}

export function formatDateDisplay(ymd: string): string {
  return format(fromYMD(ymd), 'MMM d')
}

export function formatDayName(date: Date): string {
  return format(date, 'EEE')
}

export function formatFullDate(date: Date): string {
  return format(date, 'MMMM d, yyyy')
}

export function formatShortDate(date: Date): string {
  return format(date, 'MMM d')
}

export function getDayName(date: Date): string {
  return format(date, 'EEEE') // e.g. "Monday"
}

export function getWeekStartEnd(date: Date, mode: WorkingMode): { start: string; end: string } {
  const days = getWeekDays(date, mode)
  return {
    start: toYMD(days[0]),
    end: toYMD(days[days.length - 1]),
  }
}

export function generateRecurringDates(startDate: string, rule: RecurrenceRule): string[] {
  const dates: string[] = []
  let current = fromYMD(startDate)
  const end = fromYMD(rule.endDate)

  while (!isAfter(current, end)) {
    if (rule.frequency === 'daily') {
      dates.push(toYMD(current))
      current = addDays(current, 1)
    } else if (rule.frequency === 'weekly') {
      if (rule.days.includes(current.getDay())) {
        dates.push(toYMD(current))
      }
      current = addDays(current, 1)
    } else {
      // monthly
      dates.push(toYMD(current))
      current = addMonths(current, 1)
    }
  }
  return dates
}

export function rangeToDateStrings(
  range: string,
  customStart?: string,
  customEnd?: string
): { start: string; end: string } {
  const today = new Date()
  switch (range) {
    case 'today':
      return { start: toYMD(today), end: toYMD(today) }
    case 'this-week': {
      return {
        start: toYMD(startOfWeek(today, { weekStartsOn: 1 })),
        end: toYMD(endOfWeek(today, { weekStartsOn: 1 })),
      }
    }
    case 'last-week': {
      const lastWeekStart = startOfWeek(subDays(today, 7), { weekStartsOn: 1 })
      const lastWeekEnd = endOfWeek(subDays(today, 7), { weekStartsOn: 1 })
      return { start: toYMD(lastWeekStart), end: toYMD(lastWeekEnd) }
    }
    case 'this-month':
      return { start: toYMD(startOfMonth(today)), end: toYMD(endOfMonth(today)) }
    case 'last-7':
      return { start: toYMD(subDays(today, 6)), end: toYMD(today) }
    case 'last-30':
      return { start: toYMD(subDays(today, 29)), end: toYMD(today) }
    case 'this-quarter': {
      const qMonth = Math.floor(today.getMonth() / 3) * 3
      const qStart = new Date(today.getFullYear(), qMonth, 1)
      const qEnd = new Date(today.getFullYear(), qMonth + 3, 0)
      return { start: toYMD(qStart), end: toYMD(qEnd) }
    }
    case 'custom':
      return {
        start: customStart ?? toYMD(subDays(today, 29)),
        end: customEnd ?? toYMD(today),
      }
    default:
      return { start: toYMD(subDays(today, 6)), end: toYMD(today) }
  }
}
