import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'

export async function GET() {
  const user = await getSessionUser()
  if (!user || user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const { data: students, error } = await supabase
    .from('users')
    .select('id, full_name, email, phone, is_active, is_locked, created_at')
    .eq('role', 'STUDENT')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'فشل تحميل الطلاب' }, { status: 500 })
  }

  return NextResponse.json({ students: students || [] })
}
