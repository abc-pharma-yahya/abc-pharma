import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSessionUser, hashPassword, logAudit } from '@/lib/auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getSessionUser()
  if (!admin || admin.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const { id } = await params

  try {
    const { action } = await req.json()

    if (action === 'toggle_lock') {
      const { data: student } = await supabase
        .from('users')
        .select('is_locked')
        .eq('id', id)
        .single()

      const newLocked = !student?.is_locked

      await supabase
        .from('users')
        .update({ is_locked: newLocked, updated_at: new Date().toISOString() })
        .eq('id', id)

      await logAudit({
        user_id: admin.id,
        action: newLocked ? 'ADMIN_STUDENT_LOCK' : 'ADMIN_STUDENT_UNLOCK',
        resource: `user/${id}`,
        ip: req.headers.get('x-forwarded-for') || '',
      })
    } else if (action === 'toggle_active') {
      const { data: student } = await supabase
        .from('users')
        .select('is_active')
        .eq('id', id)
        .single()

      const newActive = !student?.is_active

      await supabase
        .from('users')
        .update({ is_active: newActive, updated_at: new Date().toISOString() })
        .eq('id', id)

      await logAudit({
        user_id: admin.id,
        action: newActive ? 'ADMIN_STUDENT_ACTIVATE' : 'ADMIN_STUDENT_DEACTIVATE',
        resource: `user/${id}`,
        ip: req.headers.get('x-forwarded-for') || '',
      })
    } else if (action === 'reset_password') {
      const hashed = await hashPassword('123456')
      await supabase
        .from('users')
        .update({ password: hashed, session_token: null, updated_at: new Date().toISOString() })
        .eq('id', id)

      await logAudit({
        user_id: admin.id,
        action: 'ADMIN_STUDENT_RESET_PASSWORD',
        resource: `user/${id}`,
        ip: req.headers.get('x-forwarded-for') || '',
      })
    } else {
      return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('student update error', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
