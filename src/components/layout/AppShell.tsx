'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { useAuth } from '@/context/AuthContext'
import { storageGet, storageSet } from '@/lib/storage'
import { cn } from '@/lib/utils'

const COLLAPSED_KEY = 'taskify:sidebarCollapsed'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useAuth()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState<boolean>(
    () => storageGet<boolean>(COLLAPSED_KEY) ?? true
  )

  if (!currentUser) return null

  const handleLogout = () => {
    logout()
    router.replace('/login')
  }

  const toggle = () =>
    setCollapsed((c) => {
      storageSet(COLLAPSED_KEY, !c)
      return !c
    })

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="relative hidden md:flex md:flex-shrink-0">
        <Sidebar user={currentUser} onLogout={handleLogout} collapsed={collapsed} />

        {/* Toggle button — outside the aside so it's never clipped */}
        <button
          onClick={toggle}
          className="absolute right-0 top-[22px] z-50 flex h-6 w-6 translate-x-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-all"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <ChevronRight
            className={cn(
              'h-3 w-3 transition-transform duration-200',
              !collapsed && 'rotate-180'
            )}
          />
        </button>
      </div>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <div className="md:hidden">
        <BottomNav user={currentUser} />
      </div>
    </div>
  )
}
