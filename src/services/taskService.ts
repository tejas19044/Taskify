import { supabase } from '@/lib/supabase'
import { generateRecurringDates } from '@/lib/dateUtils'
import type { Task, RecurrenceRule } from '@/types'

type TaskRow = {
  id: string; user_id: string; title: string; description: string
  scheduled_date: string | null; estimated_hours: number
  label_id: string | null; priority_id: string | null
  tags: string[]; reference_url: string | null
  recurring_group_id: string | null; half_day: string | null
  completed: boolean; created_at: string; updated_at: string
}

function rowToTask(r: TaskRow): Task {
  return {
    id: r.id, userId: r.user_id, title: r.title,
    description: r.description ?? '',
    scheduledDate: r.scheduled_date,
    estimatedHours: Number(r.estimated_hours),
    labelId: r.label_id ?? '', priorityId: r.priority_id ?? '',
    tags: r.tags ?? [],
    referenceUrl: r.reference_url ?? undefined,
    recurringGroupId: r.recurring_group_id ?? undefined,
    halfDay: (r.half_day as 'am' | 'pm') ?? undefined,
    completed: r.completed ?? false,
    createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

function taskToRow(t: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
  return {
    user_id: t.userId, title: t.title, description: t.description,
    scheduled_date: t.scheduledDate, estimated_hours: t.estimatedHours,
    label_id: t.labelId || null, priority_id: t.priorityId || null,
    tags: t.tags, reference_url: t.referenceUrl ?? null,
    recurring_group_id: t.recurringGroupId ?? null,
    half_day: t.halfDay ?? null, completed: t.completed ?? false,
  }
}

export async function getTasksByUser(userId: string): Promise<Task[]> {
  const { data, error } = await supabase.from('tasks').select('*')
    .eq('user_id', userId).order('created_at', { ascending: true })
  if (error) throw error
  return (data as TaskRow[]).map(rowToTask)
}

export async function getTasksByDate(userId: string, date: string): Promise<Task[]> {
  const { data, error } = await supabase.from('tasks').select('*')
    .eq('user_id', userId).eq('scheduled_date', date)
  if (error) throw error
  return (data as TaskRow[]).map(rowToTask)
}

export async function getTasksByDateRange(userId: string, start: string, end: string): Promise<Task[]> {
  const { data, error } = await supabase.from('tasks').select('*')
    .eq('user_id', userId).gte('scheduled_date', start).lte('scheduled_date', end)
  if (error) throw error
  return (data as TaskRow[]).map(rowToTask)
}

export async function getTaskById(id: string): Promise<Task | null> {
  const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single()
  if (error || !data) return null
  return rowToTask(data as TaskRow)
}

export async function createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const { data: row, error } = await supabase.from('tasks')
    .insert(taskToRow(data)).select().single()
  if (error) throw error
  return rowToTask(row as TaskRow)
}

export async function updateTask(
  id: string,
  updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>
): Promise<Task> {
  const dbUpdates: Record<string, unknown> = {}
  if (updates.title !== undefined) dbUpdates.title = updates.title
  if (updates.description !== undefined) dbUpdates.description = updates.description
  if (updates.scheduledDate !== undefined) dbUpdates.scheduled_date = updates.scheduledDate
  if (updates.estimatedHours !== undefined) dbUpdates.estimated_hours = updates.estimatedHours
  if (updates.labelId !== undefined) dbUpdates.label_id = updates.labelId || null
  if (updates.priorityId !== undefined) dbUpdates.priority_id = updates.priorityId || null
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags
  if (updates.referenceUrl !== undefined) dbUpdates.reference_url = updates.referenceUrl ?? null
  if (updates.recurringGroupId !== undefined) dbUpdates.recurring_group_id = updates.recurringGroupId ?? null
  if (updates.halfDay !== undefined) dbUpdates.half_day = updates.halfDay ?? null
  if (updates.completed !== undefined) dbUpdates.completed = updates.completed
  dbUpdates.updated_at = new Date().toISOString()

  const { data: row, error } = await supabase.from('tasks')
    .update(dbUpdates).eq('id', id).select().single()
  if (error) throw error
  return rowToTask(row as TaskRow)
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function moveTask(id: string, newDate: string | null, halfDay?: 'am' | 'pm'): Promise<Task> {
  return updateTask(id, { scheduledDate: newDate, halfDay })
}

export async function createRecurringTasks(
  base: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
  rule: RecurrenceRule
): Promise<Task[]> {
  if (!base.scheduledDate) return []
  const groupId = crypto.randomUUID()
  const dates = generateRecurringDates(base.scheduledDate, rule)
  const rows = dates.map((date) => taskToRow({ ...base, scheduledDate: date, recurringGroupId: groupId }))
  const { data, error } = await supabase.from('tasks').insert(rows).select()
  if (error) throw error
  return (data as TaskRow[]).map(rowToTask)
}

export async function updateTaskSeries(
  recurringGroupId: string,
  updates: Partial<Omit<Task, 'id' | 'userId' | 'scheduledDate' | 'recurringGroupId' | 'createdAt'>>
): Promise<void> {
  const dbUpdates: Record<string, unknown> = {}
  if (updates.title !== undefined) dbUpdates.title = updates.title
  if (updates.description !== undefined) dbUpdates.description = updates.description
  if (updates.estimatedHours !== undefined) dbUpdates.estimated_hours = updates.estimatedHours
  if (updates.labelId !== undefined) dbUpdates.label_id = updates.labelId || null
  if (updates.priorityId !== undefined) dbUpdates.priority_id = updates.priorityId || null
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags
  if (updates.referenceUrl !== undefined) dbUpdates.reference_url = updates.referenceUrl ?? null
  if (updates.halfDay !== undefined) dbUpdates.half_day = updates.halfDay ?? null
  if (updates.completed !== undefined) dbUpdates.completed = updates.completed
  dbUpdates.updated_at = new Date().toISOString()

  const { error } = await supabase.from('tasks')
    .update(dbUpdates).eq('recurring_group_id', recurringGroupId)
  if (error) throw error
}

export async function deleteTaskSeries(recurringGroupId: string): Promise<void> {
  const { error } = await supabase.from('tasks')
    .delete().eq('recurring_group_id', recurringGroupId)
  if (error) throw error
}
