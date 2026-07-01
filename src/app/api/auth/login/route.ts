import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createSession, setCookie, verifyPassword, isSuperAdmin, logAudit } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' }, { status: 400 })
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 })
    }

    if (user.is_locked) {
      await logAudit({ user_id: user.id, action: 'AUTH_LOGIN_LOCKED', ip: req.headers.get('x-forwarded-for') || '' })
      return NextResponse.json({ error: 'تم قفل حسابك. تواصل مع الإدارة' }, { status: 403 })
    }

    if (!user.is_active) {
      return NextResponse.json({ error: 'حسابك غير مفعل. تواصل مع الإدارة' }, { status: 403 })
    }

    const valid = await verifyPassword(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 })
    }

    // Determine role: SUPERADMIN if email matches ADMIN_EMAIL
    const role = isSuperAdmin(user.email) ? 'SUPERADMIN' : user.role || 'STUDENT'
    if (role !== user.role) {
      await supabase.from('users').update({ role, updated_at: new Date().toISOString() }).eq('id', user.id)
    }

    const token = await createSession(user.id)
    await setCookie(token)

    await logAudit({
      user_id: user.id,
      action: 'AUTH_LOGIN_SUCCESS',
      ip: req.headers.get('x-forwarded-for') || '',
      details: `User ${user.email} logged in`,
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role,
      },
    })
  } catch (e: any) {
    console.error('login error', e)
    return NextResponse.json({ error: 'حدث خطأ أثناء تسجيل الدخول' }, { status: 500 })
  }
}
