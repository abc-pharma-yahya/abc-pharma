import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSessionUser, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user || user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const bundleId = searchParams.get('bundle_id')

  if (!bundleId) {
    return NextResponse.json({ lectures: [] })
  }

  const { data: lectures, error } = await supabase
    .from('lectures')
    .select('*')
    .eq('bundle_id', bundleId)
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'فشل تحميل المحاضرات' }, { status: 500 })
  }

  return NextResponse.json({ lectures: lectures || [] })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user || user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  try {
    const body = await req.json()

    const { data: lecture, error } = await supabase
      .from('lectures')
      .insert({
        bundle_id: body.bundle_id,
        title: body.title,
        description: body.description || null,
        video_url: body.video_url || null,
        video_file: null,
        pdf_file: null,
        pdf_url: body.pdf_url || null,
        duration: body.duration || 0,
        sort_order: body.sort_order ?? 0,
        is_active: body.is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error('lecture insert error', error)
      return NextResponse.json({ error: 'فشل إضافة المحاضرة' }, { status: 500 })
    }

    await logAudit({
      user_id: user.id,
      action: 'ADMIN_LECTURE_CREATE',
      resource: `lecture/${lecture.id}`,
      ip: req.headers.get('x-forwarded-for') || '',
      details: `Created lecture: ${lecture.title}`,
    })

    return NextResponse.json({ lecture })
  } catch (e: any) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
