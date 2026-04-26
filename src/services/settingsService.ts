// NOTE: Replace storageGet/storageSet with Supabase DB queries for production.

import { storageGet, storageSet, STORAGE_KEYS } from '@/lib/storage'
import type { UserSettings } from '@/types'

const DEFAULT_SETTINGS: Omit<UserSettings, 'userId'> = {
  workingMode: '5-day',
  boardMode: 'current-week',
  defaultDashboardRange: 'this-week',
  defaultDailyHours: 8,
  perDayOverrides: {},
}

function getAllSettings(): UserSettings[] {
  return storageGet<UserSettings[]>(STORAGE_KEYS.SETTINGS) ?? []
}

function saveAllSettings(settings: UserSettings[]): void {
  storageSet(STORAGE_KEYS.SETTINGS, settings)
}

export function getSettings(userId: string): UserSettings {
  const all = getAllSettings()
  return all.find((s) => s.userId === userId) ?? { ...DEFAULT_SETTINGS, userId }
}

export function updateSettings(userId: string, updates: Partial<UserSettings>): UserSettings {
  const all = getAllSettings()
  const idx = all.findIndex((s) => s.userId === userId)
  const current = idx >= 0 ? all[idx] : { ...DEFAULT_SETTINGS, userId }
  const updated: UserSettings = { ...current, ...updates, userId }
  if (idx >= 0) {
    all[idx] = updated
  } else {
    all.push(updated)
  }
  saveAllSettings(all)
  return updated
}

export function getDailyCapacity(settings: UserSettings, dayName: string): number {
  return settings.perDayOverrides[dayName] ?? settings.defaultDailyHours
}
