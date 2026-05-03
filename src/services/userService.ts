import { supabase } from '@/lib/supabase'
import type { User, UserRole } from '@/types'

type AppUserRow = {
  id: string
  name: string
  email: string
  password: string
  role: string
  active: boolean
  created_at: string
}

function rowToUser(row: AppUserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role as UserRole,
    active: row.active,
    createdAt: row.created_at,
  }
}

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .order('created_at')
  if (error) throw error
  return (data as AppUserRow[]).map(rowToUser)
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return rowToUser(data as AppUserRow)
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  role: UserRole
  active: boolean
}): Promise<User> {
  const { data: row, error } = await supabase
    .from('app_users')
    .insert({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      role: data.role,
      active: data.active,
    })
    .select()
    .single()
  if (error) throw error
  return rowToUser(row as AppUserRow)
}

export async function updateUser(
  id: string,
  updates: Partial<User & { password: string }>
): Promise<User> {
  const dbUpdates: Record<string, unknown> = {}
  if (updates.name !== undefined) dbUpdates.name = updates.name.trim()
  if (updates.email !== undefined) dbUpdates.email = updates.email.trim().toLowerCase()
  if (updates.password !== undefined) dbUpdates.password = updates.password
  if (updates.role !== undefined) dbUpdates.role = updates.role
  if (updates.active !== undefined) dbUpdates.active = updates.active

  const { data: row, error } = await supabase
    .from('app_users')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return rowToUser(row as AppUserRow)
}

export async function deleteUser(id: string): Promise<void> {
  const { error } = await supabase
    .from('app_users')
    .delete()
    .eq('id', id)
  if (error) throw error
}
