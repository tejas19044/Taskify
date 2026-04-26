// NOTE: All persistence goes through this module.
// To migrate to Supabase, replace storageGet/storageSet calls in service files
// with Supabase client queries — this file becomes unused.

const isBrowser = typeof window !== 'undefined'

export function storageGet<T>(key: string): T | null {
  if (!isBrowser) return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function storageSet<T>(key: string, value: T): void {
  if (!isBrowser) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage full or unavailable
  }
}

export function storageDelete(key: string): void {
  if (!isBrowser) return
  localStorage.removeItem(key)
}

export const STORAGE_KEYS = {
  USERS: 'moonshot:users',
  TASKS: 'moonshot:tasks',
  SETTINGS: 'moonshot:settings',
  PRIORITY_LABELS: 'moonshot:priorityLabels',
  PRIORITIES: 'moonshot:priorities',
  CURRENT_USER_ID: 'moonshot:currentUserId',
  SEEDED: 'moonshot:seeded',
} as const
