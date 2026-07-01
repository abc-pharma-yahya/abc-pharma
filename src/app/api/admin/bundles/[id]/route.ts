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

    const { data: bundle, error } = await supabase
      .from('bundles')
      .update({
        title: body.title,
        description: body.description || null,
        price: body.price,
        original_price: body.original_price || 0,
        image_url: body.image_url || null,
        is_active: body.is_active,
        is_featured: body.is_featured,
        sort_order: body.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'فشل تحديث الكورس' }, { status: 500 })
    }

    await logAudit({
      user_id: user.id,
      action: 'ADMIN_BUNDLE_UPDATE',
      resource: `bundle/${id}`,
      ip: req.headers.get('x-forwarded-for') || '',
    })

    return NextResponse.json({ bundle })
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

  // Delete related lectures first
  await supabase.from('lectures').delete().eq('bundle_id', id)
  // Delete progress for those lectures
  await supabase.from('progress').delete().in(
    'lecture_id',
    (await supabase.from('lectures').select('id').eq('bundle_id', id)).data?.map((l: any) => l.id) || []
  )
  // Delete the bundle
  const { error } = await supabase.from('bundles').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'فشل حذف الكورس' }, { status: 500 })
  }

  await logAudit({
    user_id: user.id,
    action: 'ADMIN_BUNDLE_DELETE',
    resource: `bundle/${id}`,
    ip: req.headers.get('x-forwarded-for') || '',
  })

  return NextResponse.json({ success: true })
}
