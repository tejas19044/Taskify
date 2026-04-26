'use client'

import type { User } from '@/types'

interface UserSelectorProps {
  users: User[]
  selectedUserId: string
  onSelect: (userId: string) => void
}

export function UserSelector({ users, selectedUserId, onSelect }: UserSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500">Viewing:</span>
      <select
        className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
        value={selectedUserId}
        onChange={(e) => onSelect(e.target.value)}
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.username}{user.role === 'admin' ? ' (admin)' : ''}
          </option>
        ))}
      </select>
    </div>
  )
}
