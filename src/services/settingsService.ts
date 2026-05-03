import { supabase } from '@/lib/supabase'
import type { UserSettings } from '@/types'

type SettingsRow = {
  user_id: string; working_mode: string; board_mode: string
  default_dashboard_range: string; default_daily_hours: number
  per_day_overrides: Record<string, number>
}

const DEFAULTS: Omit<UserSettings, 'userId'> = {
  workingMode: '5-day', boardMode: 'current-week',
  defaultDashboardRange: 'this-week', defaultDailyHours: 8, perDayOverrides: {},
}

function rowToSettings(r: SettingsRow): UserSettings {
  return {
    userId: r.user_id,
    workingMode: (r.working_mode as UserSettings['workingMode']) ?? DEFAULTS.workingMode,
    boardMode: (r.board_mode as UserSettings['boardMode']) ?? DEFAULTS.boardMode,
    defaultDashboardRange: (r.default_dashboard_range as UserSettings['defaultDashboardRange']) ?? DEFAULTS.defaultDashboardRange,
    defaultDailyHours: Number(r.default_daily_hours) ?? DEFAULTS.defaultDailyHours,
    perDayOverrides: (r.per_day_overrides as Record<string, number>) ?? {},
  }
}

export async function getSettings(userId: string): Promise<UserSettings> {
  const { data, error } = await supabase.from('settings').select('*').eq('user_id', userId).single()
  if (error || !data) return { ...DEFAULTS, userId }
  return rowToSettings(data as SettingsRow)
}

export async function updateSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings> {
  const current = await getSettings(userId)
  const merged: UserSettings = { ...current, ...updates, userId }

  const row = {
    user_id: userId,
    working_mode: merged.workingMode,
    board_mode: merged.boardMode,
    default_dashboard_range: merged.defaultDashboardRange,
    default_daily_hours: merged.defaultDailyHours,
    per_day_overrides: merged.perDayOverrides,
  }

  const { data, error } = await supabase.from('settings')
    .upsert(row, { onConflict: 'user_id' }).select().single()
  if (error) throw error
  return rowToSettings(data as SettingsRow)
}

export function getDailyCapacity(settings: UserSettings, dayName: string): number {
  return settings.perDayOverrides[dayName] ?? settings.defaultDailyHours
}
