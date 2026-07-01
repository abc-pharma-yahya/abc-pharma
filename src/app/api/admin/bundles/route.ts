import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSessionUser, logAudit } from '@/lib/auth'

export async function GET() {
  const user = await getSessionUser()
  if (!user || user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const { data: bundles, error } = await supabase
    .from('bundles')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'فشل تحميل الكورسات' }, { status: 500 })
  }

  return NextResponse.json({ bundles: bundles || [] })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user || user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  try {
    const body = await req.json()

    const { data: bundle, error } = await supabase
      .from('bundles')
      .insert({
        title: body.title,
        description: body.description || null,
        price: body.price,
        original_price: body.original_price || 0,
        image_url: body.image_url || null,
        is_active: body.is_active ?? true,
        is_featured: body.is_featured ?? false,
        sort_order: body.sort_order ?? 0,
      })
      .select()
      .single()

    if (error) {
      console.error('bundle insert error', error)
      return NextResponse.json({ error: 'فشل إضافة الكورس' }, { status: 500 })
    }

    await logAudit({
      user_id: user.id,
      action: 'ADMIN_BUNDLE_CREATE',
      resource: `bundle/${bundle.id}`,
      ip: req.headers.get('x-forwarded-for') || '',
      details: `Created bundle: ${bundle.title}`,
    })

    return NextResponse.json({ bundle })
  } catch (e: any) {
    console.error('bundle create error', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
