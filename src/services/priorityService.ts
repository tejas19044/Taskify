import { storageGet, storageSet, STORAGE_KEYS } from '@/lib/storage'
import type { Priority } from '@/types'

function getPriorities(): Priority[] {
  return storageGet<Priority[]>(STORAGE_KEYS.PRIORITIES) ?? []
}

function savePriorities(priorities: Priority[]): void {
  storageSet(STORAGE_KEYS.PRIORITIES, priorities)
}

export function getPrioritiesByUser(userId: string): Priority[] {
  return getPriorities().filter((p) => p.userId === userId)
}

export function createPriority(data: Omit<Priority, 'id' | 'createdAt'>): Priority {
  const priorities = getPriorities()
  const priority: Priority = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
  savePriorities([...priorities, priority])
  return priority
}

export function updatePriority(id: string, updates: Partial<Omit<Priority, 'id' | 'userId' | 'createdAt'>>): Priority {
  const priorities = getPriorities()
  const idx = priorities.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error(`Priority ${id} not found`)
  const updated = { ...priorities[idx], ...updates }
  priorities[idx] = updated
  savePriorities(priorities)
  return updated
}

export function deletePriority(id: string): void {
  savePriorities(getPriorities().filter((p) => p.id !== id))
}

export function bulkSeedPriorities(priorities: Priority[]): void {
  const existing = getPriorities()
  savePriorities([...existing, ...priorities])
}
