import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user || user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const filter = searchParams.get('filter') || 'ALL'

  let query = supabase
    .from('audit_log')
    .select(`
      id,
      user_id,
      action,
      resource,
      ip,
      details,
      created_at,
      users ( full_name )
    `)
    .order('created_at', { ascending: false })
    .limit(200)

  if (filter === 'SUSPICIOUS') {
    query = query.like('action', 'SUSPICIOUS_%')
  } else if (filter === 'AUTH') {
    query = query.like('action', 'AUTH_%')
  } else if (filter === 'ADMIN') {
    query = query.like('action', 'ADMIN_%')
  }

  const { data: entries, error } = await query

  if (error) {
    return NextResponse.json({ error: 'فشل تحميل السجل' }, { status: 500 })
  }

  const formatted = (entries || []).map((e: any) => ({
    id: e.id,
    user_id: e.user_id,
    user_name: e.users?.full_name || null,
    action: e.action,
    resource: e.resource,
    ip: e.ip,
    details: e.details,
    created_at: e.created_at,
  }))

  return NextResponse.json({ entries: formatted })
}
