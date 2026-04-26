'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, ShieldCheck, User as UserIcon, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CreateUserDialog } from './CreateUserDialog'
import { EditUserDialog } from './EditUserDialog'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useAuth } from '@/context/AuthContext'
import { getAllUsers, createUser, updateUser, deleteUser } from '@/services/userService'
import type { User } from '@/types'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { useEffect } from 'react'

function PasswordCell({ password }: { password: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-xs text-slate-600">{show ? password : '••••••••'}</span>
      <button
        type="button"
        className="text-slate-300 hover:text-slate-600 transition-colors"
        onClick={() => setShow((v) => !v)}
      >
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}

export function AdminPage() {
  const { currentUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.replace('/board')
    }
  }, [currentUser, router])

  const [users, setUsers] = useState<User[]>(() => getAllUsers())
  const [createOpen, setCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  const refresh = () => setUsers(getAllUsers())

  const existingUsernames = useMemo(
    () => users.map((u) => u.username.toLowerCase()),
    [users]
  )

  if (currentUser?.role !== 'admin') return null

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Admin</h1>
          <p className="text-sm text-slate-500">Manage users and access</p>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          size="sm"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New user
        </Button>
      </div>

      <div className="p-4">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold text-slate-600">User</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600">Role</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600">Password</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600">Created</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                        {user.username[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-slate-800">{user.username}</span>
                      {user.id === currentUser.id && (
                        <span className="text-xs text-slate-400">(you)</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {user.role === 'admin' ? (
                        <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                      ) : (
                        <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                      )}
                      <span className="text-sm capitalize text-slate-600">{user.role}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <PasswordCell password={user.password} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.active}
                        disabled={user.id === currentUser.id}
                        onCheckedChange={(checked) => {
                          updateUser(user.id, { active: checked })
                          refresh()
                          toast.success(checked ? 'User activated' : 'User deactivated')
                        }}
                      />
                      <Badge
                        variant="outline"
                        className={`text-xs ${user.active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}
                      >
                        {user.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {format(parseISO(user.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-slate-700"
                        onClick={() => setEditingUser(user)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={user.id === currentUser.id}
                        className="h-7 w-7 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                        onClick={() => setDeletingUser(user)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        existingUsernames={existingUsernames}
        onCreate={(data) => {
          createUser(data)
          refresh()
          toast.success(`User ${data.username} created`)
        }}
      />
      <EditUserDialog
        user={editingUser}
        open={editingUser !== null}
        onOpenChange={(open) => !open && setEditingUser(null)}
        existingUsernames={existingUsernames}
        onSave={(id, updates) => {
          updateUser(id, updates)
          refresh()
          toast.success('User updated')
        }}
      />
      <ConfirmDialog
        open={deletingUser !== null}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        title={`Delete ${deletingUser?.username ?? 'user'}?`}
        description="This will permanently delete the user and all their tasks, labels, and settings. This cannot be undone."
        confirmLabel="Delete user"
        onConfirm={() => {
          if (!deletingUser) return
          deleteUser(deletingUser.id)
          refresh()
          toast.success(`${deletingUser.username} deleted`)
          setDeletingUser(null)
        }}
      />
    </div>
  )
}
