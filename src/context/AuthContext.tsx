'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, UserRole } from '@/types'
import { supabase } from '@/lib/supabase'
import { storageGet, storageSet, storageDelete, STORAGE_KEYS } from '@/lib/storage'

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

interface AuthContextValue {
  currentUser: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<User | null>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session instantly from localStorage — no network call, no hang
  useEffect(() => {
    const session = storageGet<User>(STORAGE_KEYS.SESSION)
    setCurrentUser(session)
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('password', password)
      .eq('active', true)
      .single()

    if (error || !data) return null
    const user = rowToUser(data as AppUserRow)
    storageSet(STORAGE_KEYS.SESSION, user)
    setCurrentUser(user)
    return user
  }, [])

  const logout = useCallback(async () => {
    storageDelete(STORAGE_KEYS.SESSION)
    storageDelete(STORAGE_KEYS.USER_ROLE)
    setCurrentUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const session = storageGet<User>(STORAGE_KEYS.SESSION)
    if (!session) return
    const { data } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', session.id)
      .single()
    if (data) {
      const user = rowToUser(data as AppUserRow)
      storageSet(STORAGE_KEYS.SESSION, user)
      setCurrentUser(user)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
