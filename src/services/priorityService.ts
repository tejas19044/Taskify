import { supabase } from '@/lib/supabase'
import type { Priority } from '@/types'

type PriorityRow = { id: string; user_id: string; name: string; color: string; created_at: string }

function rowToPriority(r: PriorityRow): Priority {
  return { id: r.id, userId: r.user_id, name: r.name, color: r.color, createdAt: r.created_at }
}

export async function getPrioritiesByUser(userId: string): Promise<Priority[]> {
  const { data, error } = await supabase.from('priorities').select('*')
    .eq('user_id', userId).order('created_at')
  if (error) throw error
  return (data as PriorityRow[]).map(rowToPriority)
}

export async function createPriority(data: Omit<Priority, 'id' | 'createdAt'>): Promise<Priority> {
  const { data: row, error } = await supabase.from('priorities')
    .insert({ user_id: data.userId, name: data.name, color: data.color }).select().single()
  if (error) throw error
  return rowToPriority(row as PriorityRow)
}

export async function updatePriority(
  id: string,
  updates: Partial<Omit<Priority, 'id' | 'userId' | 'createdAt'>>
): Promise<Priority> {
  const { data: row, error } = await supabase.from('priorities')
    .update(updates).eq('id', id).select().single()
  if (error) throw error
  return rowToPriority(row as PriorityRow)
}

export async function deletePriority(id: string): Promise<void> {
  const { error } = await supabase.from('priorities').delete().eq('id', id)
  if (error) throw error
}
