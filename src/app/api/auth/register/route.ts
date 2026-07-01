import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createSession, setCookie, hashPassword, logAudit } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { full_name, email, phone, password } = await req.json()

    if (!full_name || !email || !phone || !password) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 })
    }

    if (!/^01\d{9}$/.test(phone)) {
      return NextResponse.json({ error: 'رقم الموبايل يجب أن يبدأ بـ 01 ويتكون من 11 رقم' }, { status: 400 })
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'هذا البريد الإلكتروني مسجل بالفعل' }, { status: 409 })
    }

    const hashed = await hashPassword(password)

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        full_name,
        email: email.toLowerCase().trim(),
        phone,
        password: hashed,
        role: 'STUDENT',
        is_active: true,
        is_locked: false,
      })
      .select('id, email, full_name, role, is_active, is_locked')
      .single()

    if (error) {
      console.error('register insert error', error)
      return NextResponse.json({ error: 'فشل إنشاء الحساب' }, { status: 500 })
    }

    const token = await createSession(newUser.id)
    await setCookie(token)

    await logAudit({
      user_id: newUser.id,
      action: 'AUTH_REGISTER',
      ip: req.headers.get('x-forwarded-for'),
      details: `New user ${newUser.email} registered`,
    })

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
      },
    })
  } catch (e: any) {
    console.error('register error', e)
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الحساب' }, { status: 500 })
  }
}
