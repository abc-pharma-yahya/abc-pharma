import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user || user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  let query = supabase
    .from('claims')
    .select(`
      id,
      user_id,
      bundle_id,
      amount,
      status,
      proof_image,
      admin_note,
      created_at,
      users!inner ( full_name, email ),
      bundles!inner ( title )
    `)
    .order('created_at', { ascending: false })

  if (status && status !== 'ALL') {
    query = query.eq('status', status)
  }

  const { data: claims, error } = await query

  if (error) {
    console.error('claims error', error)
    return NextResponse.json({ error: 'فشل تحميل الطلبات' }, { status: 500 })
  }

  const formatted = (claims || []).map((c: any) => ({
    id: c.id,
    user_id: c.user_id,
    user_name: c.users?.full_name || '',
    user_email: c.users?.email || '',
    bundle_id: c.bundle_id,
    bundle_title: c.bundles?.title || '',
    amount: c.amount,
    status: c.status,
    proof_image: c.proof_image,
    admin_note: c.admin_note,
    created_at: c.created_at,
  }))

  return NextResponse.json({ claims: formatted })
}
