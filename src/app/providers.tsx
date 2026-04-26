'use client'

import { useEffect } from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { seedIfEmpty } from '@/lib/seeds'
import { Toaster } from '@/components/ui/sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    seedIfEmpty()
  }, [])

  return (
    <AuthProvider>
      {children}
      <Toaster richColors position="top-right" />
    </AuthProvider>
  )
}
