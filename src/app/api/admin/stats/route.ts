import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'

export async function GET() {
  const user = await getSessionUser()
  if (!user || user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const [studentsRes, bundlesRes, purchasesRes, pendingClaimsRes, lecturesRes] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'STUDENT'),
    supabase.from('bundles').select('id', { count: 'exact', head: true }),
    supabase.from('purchases').select('id, amount', { count: 'exact' }).eq('status', 'COMPLETED'),
    supabase.from('claims').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
    supabase.from('lectures').select('id', { count: 'exact', head: true }),
  ])

  const revenue = (purchasesRes.data || []).reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0)

  const { data: recentUsers } = await supabase
    .from('users')
    .select('id, full_name, email, created_at')
    .eq('role', 'STUDENT')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentClaims } = await supabase
    .from('claims')
    .select(`
      id,
      amount,
      status,
      created_at,
      users!inner ( full_name ),
      bundles!inner ( title )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  const recentClaimsFormatted = (recentClaims || []).map((c: any) => ({
    id: c.id,
    user_name: c.users?.full_name || '',
    bundle_title: c.bundles?.title || '',
    amount: c.amount,
    status: c.status,
    created_at: c.created_at,
  }))

  return NextResponse.json({
    stats: {
      students: studentsRes.count || 0,
      bundles: bundlesRes.count || 0,
      purchases: purchasesRes.count || 0,
      revenue,
      pending_claims: pendingClaimsRes.count || 0,
      lectures: lecturesRes.count || 0,
    },
    recent_users: recentUsers || [],
    recent_claims: recentClaimsFormatted,
  })
}
