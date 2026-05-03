'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid,
  Calendar,
  BarChart2,
  Settings,
  ShieldCheck,
  LogOut,
  FileDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User } from '@/types'
import { DownloadReportDialog } from '@/components/shared/DownloadReportDialog'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

const NAV_ITEMS: NavItem[] = [
  { href: '/board',     label: 'Board',     icon: LayoutGrid },
  { href: '/calendar',  label: 'Calendar',  icon: Calendar   },
  { href: '/dashboard', label: 'Dashboard', icon: BarChart2  },
  { href: '/settings',  label: 'Settings',  icon: Settings   },
]

interface SidebarProps {
  user: User
  onLogout: () => void
  collapsed: boolean
}

function TaskifyLogo() {
  return (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md">
      <svg viewBox="0 0 20 20" className="h-[17px] w-[17px]" fill="none">
        {/* Bold checkmark */}
        <path
          d="M4 10.5L8 14.5L16 6"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

export function Sidebar({ user, onLogout, collapsed }: SidebarProps) {
  const pathname = usePathname()
  const [reportOpen, setReportOpen] = useState(false)

  const navItems =
    user.role === 'admin'
      ? [...NAV_ITEMS, { href: '/admin', label: 'Admin', icon: ShieldCheck }]
      : NAV_ITEMS

  return (
    <>
    <aside
      className={cn(
        'flex h-full flex-col border-r border-slate-100 bg-white py-4 transition-[width] duration-200 ease-in-out overflow-hidden',
        collapsed ? 'w-[52px] px-1.5' : 'w-56 px-2.5'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'mb-5 flex items-center gap-2.5',
          collapsed ? 'justify-center' : 'px-2'
        )}
      >
        <TaskifyLogo />
        {!collapsed && (
          <span className="whitespace-nowrap text-sm font-bold text-slate-900 tracking-tight">
            Taskify
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-px">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center rounded-lg py-2 text-sm font-medium transition-colors',
                collapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              )}
            >
              <item.icon
                className={cn(
                  'h-4 w-4 flex-shrink-0',
                  isActive ? 'text-indigo-500' : 'text-slate-400'
                )}
              />
              {!collapsed && item.label}
            </Link>
          )
        })}
      </nav>

      {/* Download Report */}
      <div className="mb-1">
        <button
          onClick={() => setReportOpen(true)}
          title={collapsed ? 'Download report' : undefined}
          className={cn(
            'flex w-full items-center rounded-lg py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800',
            collapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5'
          )}
        >
          <FileDown className="h-4 w-4 flex-shrink-0 text-slate-400" />
          {!collapsed && 'Download report'}
        </button>
      </div>

      {/* User + Logout */}
      <div className="border-t border-slate-100 pt-3 space-y-0.5">
        <div
          className={cn(
            'flex items-center rounded-lg py-2',
            collapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5'
          )}
          title={collapsed ? user.name : undefined}
        >
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600">
            {user.name[0].toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-700">{user.name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={onLogout}
          title={collapsed ? 'Sign out' : undefined}
          className={cn(
            'flex w-full items-center rounded-lg py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700',
            collapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5'
          )}
        >
          <LogOut className="h-3.5 w-3.5 flex-shrink-0" />
          {!collapsed && 'Sign out'}
        </button>
      </div>
    </aside>

    <DownloadReportDialog
      open={reportOpen}
      onOpenChange={setReportOpen}
      userId={user.id}
    />
    </>
  )
}
