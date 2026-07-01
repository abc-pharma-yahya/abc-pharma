import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: bundle, error } = await supabase
    .from('bundles')
    .select('id, title, description, price, original_price, image_url')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error || !bundle) {
    return NextResponse.json({ error: 'الكورس غير موجود' }, { status: 404 })
  }

  const { data: lectures } = await supabase
    .from('lectures')
    .select('id, title, description, duration, sort_order')
    .eq('bundle_id', id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return NextResponse.json({
    bundle,
    lectures: lectures || [],
  })
}
