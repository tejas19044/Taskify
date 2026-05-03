import { supabase } from '@/lib/supabase'
import type { User, UserRole } from '@/types'

type ProfileRow = {
  id: string
  name: string
  email: string
  role: string
  active: boolean
  created_at: string
}

function rowToUser(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as UserRole,
    active: row.active,
    createdAt: row.created_at,
  }
}

async function authToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at')
  if (error) throw error
  return (data as ProfileRow[]).map(rowToUser)
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (error || !data) return null
  return rowToUser(data as ProfileRow)
}

export async function login(email: string, password: string): Promise<User | null> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) return null
  return await getUserById(data.user.id)
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut()
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null
  return await getUserById(session.user.id)
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  role: UserRole
  active: boolean
}): Promise<User> {
  const token = await authToken()
  const res = await fetch('/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateUser(
  id: string,
  updates: Partial<User & { password: string }>
): Promise<User> {
  const token = await authToken()
  const res = await fetch(`/api/admin/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(updates),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deleteUser(id: string): Promise<void> {
  const token = await authToken()
  const res = await fetch(`/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(await res.text())
}
