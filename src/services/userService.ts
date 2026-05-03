// NOTE: Replace storageGet/storageSet with Supabase Auth + DB queries for production.
// The function signatures stay the same; only the implementation changes.

import { storageGet, storageSet, storageDelete, STORAGE_KEYS } from '@/lib/storage'
import type { User, UserRole, Task, UserSettings, Label, Priority } from '@/types'

function getUsers(): User[] {
  return storageGet<User[]>(STORAGE_KEYS.USERS) ?? []
}

function saveUsers(users: User[]): void {
  storageSet(STORAGE_KEYS.USERS, users)
}

export function getAllUsers(): User[] {
  return getUsers()
}

export function getUserById(id: string): User | null {
  return getUsers().find((u) => u.id === id) ?? null
}

export function getUserByUsername(name: string): User | null {
  return getUsers().find((u) => u.name.toLowerCase() === name.toLowerCase()) ?? null
}

export function getUserByEmail(email: string): User | null {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
}

export function createUser(data: {
  name: string
  email: string
  password: string
  role: UserRole
  active: boolean
}): User {
  const users = getUsers()
  const user: User = {
    id: crypto.randomUUID(),
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role,
    active: data.active,
    createdAt: new Date().toISOString(),
  }
  saveUsers([...users, user])
  return user
}

export function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User {
  const users = getUsers()
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) throw new Error(`User ${id} not found`)
  const updated = { ...users[idx], ...updates }
  users[idx] = updated
  saveUsers(users)
  return updated
}

export function deleteUser(id: string): void {
  // Remove user record
  const users = getUsers().filter((u) => u.id !== id)
  saveUsers(users)

  // Cascade: remove all tasks for this user
  const tasks = storageGet<Task[]>(STORAGE_KEYS.TASKS) ?? []
  storageSet(STORAGE_KEYS.TASKS, tasks.filter((t) => t.userId !== id))

  // Cascade: remove settings
  const settings = storageGet<UserSettings[]>(STORAGE_KEYS.SETTINGS) ?? []
  storageSet(STORAGE_KEYS.SETTINGS, settings.filter((s) => s.userId !== id))

  // Cascade: remove priority labels
  const labels = storageGet<Label[]>(STORAGE_KEYS.PRIORITY_LABELS) ?? []
  storageSet(STORAGE_KEYS.PRIORITY_LABELS, labels.filter((l) => l.userId !== id))

  // Cascade: remove priorities
  const priorities = storageGet<Priority[]>(STORAGE_KEYS.PRIORITIES) ?? []
  storageSet(STORAGE_KEYS.PRIORITIES, priorities.filter((p) => p.userId !== id))
}

export function login(email: string, password: string): User | null {
  const user = getUserByEmail(email)
  if (!user || !user.active || user.password !== password) return null
  storageSet(STORAGE_KEYS.CURRENT_USER_ID, user.id)
  return user
}

export function logout(): void {
  storageDelete(STORAGE_KEYS.CURRENT_USER_ID)
}

export function getCurrentUserId(): string | null {
  return storageGet<string>(STORAGE_KEYS.CURRENT_USER_ID)
}

export function getCurrentUser(): User | null {
  const id = getCurrentUserId()
  if (!id) return null
  return getUserById(id)
}
