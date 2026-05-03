import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

async function verifyAdmin(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  const { data: { user }, error } = await getSupabaseAdmin().auth.getUser(token)
  if (error || !user) return null
  const { data: profile } = await getSupabaseAdmin().from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const caller = await verifyAdmin(req)
  if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const updates = await req.json()

  // Update Supabase Auth if email or password changed
  if (updates.email || updates.password) {
    const authUpdates: { email?: string; password?: string } = {}
    if (updates.email) authUpdates.email = updates.email
    if (updates.password) authUpdates.password = updates.password
    const { error } = await getSupabaseAdmin().auth.admin.updateUserById(params.id, authUpdates)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Update profile
  const profileUpdates: Record<string, unknown> = {}
  if (updates.name !== undefined) profileUpdates.name = updates.name
  if (updates.email !== undefined) profileUpdates.email = updates.email
  if (updates.role !== undefined) profileUpdates.role = updates.role
  if (updates.active !== undefined) profileUpdates.active = updates.active

  const { data: profile, error: profileError } = await getSupabaseAdmin().from('profiles')
    .update(profileUpdates).eq('id', params.id).select().single()
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  return NextResponse.json({
    id: profile.id, name: profile.name, email: profile.email,
    role: profile.role, active: profile.active, createdAt: profile.created_at,
  })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const caller = await verifyAdmin(req)
  if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await getSupabaseAdmin().auth.admin.deleteUser(params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ success: true })
}
