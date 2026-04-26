'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Calendar, BarChart2, Settings, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User } from '@/types'

const NAV_ITEMS = [
  { href: '/board', label: 'Board', icon: LayoutGrid },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/dashboard', label: 'Dashboard', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function BottomNav({ user }: { user: User }) {
  const pathname = usePathname()
  const items =
    user.role === 'admin'
      ? [...NAV_ITEMS, { href: '/admin', label: 'Admin', icon: ShieldCheck }]
      : NAV_ITEMS

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-slate-200 bg-white">
      {items.map((item) => {
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors',
              isActive ? 'text-indigo-600' : 'text-slate-500'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
