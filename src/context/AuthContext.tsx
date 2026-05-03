'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User } from '@/types'
import { getCurrentUser, login as serviceLogin, logout as serviceLogout } from '@/services/userService'

interface AuthContextValue {
  currentUser: User | null
  isLoading: boolean
  login: (email: string, password: string) => User | null
  logout: () => void
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(() => {
    setCurrentUser(getCurrentUser())
  }, [])

  useEffect(() => {
    setCurrentUser(getCurrentUser())
    setIsLoading(false)
  }, [])

  const login = useCallback((email: string, password: string): User | null => {
    const user = serviceLogin(email, password)
    if (user) setCurrentUser(user)
    return user
  }, [])

  const logout = useCallback(() => {
    serviceLogout()
    setCurrentUser(null)
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
