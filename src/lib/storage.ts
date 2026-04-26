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
  USERS: 'taskify:users',
  TASKS: 'taskify:tasks',
  SETTINGS: 'taskify:settings',
  PRIORITY_LABELS: 'taskify:priorityLabels',
  PRIORITIES: 'taskify:priorities',
  CURRENT_USER_ID: 'taskify:currentUserId',
  SEEDED: 'taskify:seeded',
} as const
