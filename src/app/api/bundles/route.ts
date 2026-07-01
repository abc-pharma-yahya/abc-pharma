import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const featured = searchParams.get('featured')

  let query = supabase
    .from('bundles')
    .select('id, title, description, price, original_price, image_url, is_featured, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (featured === 'true') {
    query = query.eq('is_featured', true)
  }

  const { data: bundles, error } = await query

  if (error) {
    return NextResponse.json({ error: 'فشل تحميل الكورسات' }, { status: 500 })
  }

  return NextResponse.json({ bundles: bundles || [] })
}
