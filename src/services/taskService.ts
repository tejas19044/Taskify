// NOTE: Replace storageGet/storageSet with Supabase DB queries for production.
// Each function maps 1:1 to a Supabase query pattern.

import { storageGet, storageSet, STORAGE_KEYS } from '@/lib/storage'
import type { Task } from '@/types'

function getTasks(): Task[] {
  return storageGet<Task[]>(STORAGE_KEYS.TASKS) ?? []
}

function saveTasks(tasks: Task[]): void {
  storageSet(STORAGE_KEYS.TASKS, tasks)
}

export function getAllTasks(): Task[] {
  return getTasks()
}

export function getTasksByUser(userId: string): Task[] {
  return getTasks().filter((t) => t.userId === userId)
}

export function getTasksByDate(userId: string, date: string): Task[] {
  return getTasks().filter((t) => t.userId === userId && t.scheduledDate === date)
}

export function getTasksByDateRange(userId: string, start: string, end: string): Task[] {
  return getTasks().filter(
    (t) => t.userId === userId && t.scheduledDate !== null && t.scheduledDate >= start && t.scheduledDate <= end
  )
}

export function getTaskById(id: string): Task | null {
  return getTasks().find((t) => t.id === id) ?? null
}

export function createTask(
  data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
): Task {
  const tasks = getTasks()
  const now = new Date().toISOString()
  const task: Task = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
  saveTasks([...tasks, task])
  return task
}

export function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>): Task {
  const tasks = getTasks()
  const idx = tasks.findIndex((t) => t.id === id)
  if (idx === -1) throw new Error(`Task ${id} not found`)
  const updated: Task = { ...tasks[idx], ...updates, updatedAt: new Date().toISOString() }
  tasks[idx] = updated
  saveTasks(tasks)
  return updated
}

export function deleteTask(id: string): void {
  const tasks = getTasks().filter((t) => t.id !== id)
  saveTasks(tasks)
}

export function moveTask(id: string, newDate: string | null): Task {
  return updateTask(id, { scheduledDate: newDate })
}

export function bulkSeedTasks(tasks: Task[]): void {
  const existing = getTasks()
  saveTasks([...existing, ...tasks])
}
