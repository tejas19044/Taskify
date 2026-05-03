import { supabase } from '@/lib/supabase'
import type { Label, PriorityLabel } from '@/types'

type LabelRow = { id: string; user_id: string; name: string; color: string; created_at: string }

function rowToLabel(r: LabelRow): Label {
  return { id: r.id, userId: r.user_id, name: r.name, color: r.color, createdAt: r.created_at }
}

export async function getLabelsByUser(userId: string): Promise<Label[]> {
  const { data, error } = await supabase.from('labels').select('*')
    .eq('user_id', userId).order('created_at')
  if (error) throw error
  return (data as LabelRow[]).map(rowToLabel)
}

export async function getLabelById(id: string): Promise<Label | null> {
  const { data, error } = await supabase.from('labels').select('*').eq('id', id).single()
  if (error || !data) return null
  return rowToLabel(data as LabelRow)
}

export async function createLabel(data: Omit<Label, 'id' | 'createdAt'>): Promise<Label> {
  const { data: row, error } = await supabase.from('labels')
    .insert({ user_id: data.userId, name: data.name, color: data.color }).select().single()
  if (error) throw error
  return rowToLabel(row as LabelRow)
}

export async function updateLabel(
  id: string,
  updates: Partial<Omit<Label, 'id' | 'userId' | 'createdAt'>>
): Promise<Label> {
  const { data: row, error } = await supabase.from('labels')
    .update(updates).eq('id', id).select().single()
  if (error) throw error
  return rowToLabel(row as LabelRow)
}

export async function deleteLabel(id: string): Promise<void> {
  const { error } = await supabase.from('labels').delete().eq('id', id)
  if (error) throw error
}

// Keep for type compatibility
export type { PriorityLabel }
