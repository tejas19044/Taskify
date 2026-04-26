// NOTE: Replace storageGet/storageSet with Supabase DB queries for production.

import { storageGet, storageSet, STORAGE_KEYS } from '@/lib/storage'
import type { Label, PriorityLabel } from '@/types'

function getLabels(): Label[] {
  return storageGet<Label[]>(STORAGE_KEYS.PRIORITY_LABELS) ?? []
}

function saveLabels(labels: Label[]): void {
  storageSet(STORAGE_KEYS.PRIORITY_LABELS, labels)
}

export function getLabelsByUser(userId: string): Label[] {
  return getLabels().filter((l) => l.userId === userId)
}

export function getLabelById(id: string): Label | null {
  return getLabels().find((l) => l.id === id) ?? null
}

export function createLabel(data: Omit<Label, 'id' | 'createdAt'>): Label {
  const labels = getLabels()
  const label: Label = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  saveLabels([...labels, label])
  return label
}

export function updateLabel(id: string, updates: Partial<Omit<Label, 'id' | 'userId' | 'createdAt'>>): Label {
  const labels = getLabels()
  const idx = labels.findIndex((l) => l.id === id)
  if (idx === -1) throw new Error(`Label ${id} not found`)
  const updated = { ...labels[idx], ...updates }
  labels[idx] = updated
  saveLabels(labels)
  return updated
}

export function deleteLabel(id: string): void {
  saveLabels(getLabels().filter((l) => l.id !== id))
}

export function bulkSeedLabels(labels: PriorityLabel[]): void {
  const existing = getLabels()
  saveLabels([...existing, ...labels])
}
