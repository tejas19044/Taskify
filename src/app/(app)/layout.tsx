'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { PageLoader } from '@/components/shared/LoadingSpinner'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace('/login')
    }
  }, [currentUser, isLoading, router])

  if (isLoading) return <PageLoader />
  if (!currentUser) return <PageLoader />

  return <AppShell>{children}</AppShell>
}
