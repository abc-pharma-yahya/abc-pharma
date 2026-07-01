import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSessionUser, logAudit } from '@/lib/auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser()
  if (!user || user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const { id } = await params

  try {
    const body = await req.json()

    const { data: lecture, error } = await supabase
      .from('lectures')
      .update({
        bundle_id: body.bundle_id,
        title: body.title,
        description: body.description || null,
        video_url: body.video_url || null,
        pdf_url: body.pdf_url || null,
        duration: body.duration || 0,
        sort_order: body.sort_order,
        is_active: body.is_active,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'فشل تحديث المحاضرة' }, { status: 500 })
    }

    await logAudit({
      user_id: user.id,
      action: 'ADMIN_LECTURE_UPDATE',
      resource: `lecture/${id}`,
      ip: req.headers.get('x-forwarded-for') || '',
    })

    return NextResponse.json({ lecture })
  } catch (e: any) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser()
  if (!user || user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const { id } = await params

  // Delete related progress
  await supabase.from('progress').delete().eq('lecture_id', id)
  const { error } = await supabase.from('lectures').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'فشل حذف المحاضرة' }, { status: 500 })
  }

  await logAudit({
    user_id: user.id,
    action: 'ADMIN_LECTURE_DELETE',
    resource: `lecture/${id}`,
    ip: req.headers.get('x-forwarded-for') || '',
  })

  return NextResponse.json({ success: true })
}
