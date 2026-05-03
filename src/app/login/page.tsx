'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Rocket, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 300)) // brief loading feel
    const user = login(email.trim().toLowerCase(), password)
    setLoading(false)
    if (user) {
      router.replace('/board')
    } else {
      setError('Invalid email or password, or account is inactive.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg">
            <Rocket className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">Taskify</h1>
            <p className="text-sm text-slate-500">Personal task planning board</p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-slate-800">Sign in</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

        </div>

        {/* Privacy notice */}
        <div className="mt-5 flex gap-3 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 px-4 py-3.5 shadow-sm">
          <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-600 mb-1">Privacy Notice</p>
            <p className="text-[12px] leading-relaxed text-amber-800/70">
              This application does not employ server-side authentication. Please refrain from entering sensitive, confidential, or proprietary information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
