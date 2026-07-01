import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'

/**
 * GET /api/purchases            -> list current user's purchases with progress + bundle info
 * GET /api/purchases?bundle_id= -> check if user purchased a specific bundle
 */
export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const bundleId = searchParams.get('bundle_id')

  if (bundleId) {
    const { data } = await supabase
      .from('purchases')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('bundle_id', bundleId)
      .eq('status', 'COMPLETED')
      .single()
    return NextResponse.json({ purchased: !!data })
  }

  // List all purchases with bundle info and progress
  const { data: purchases, error } = await supabase
    .from('purchases')
    .select(`
      id,
      bundle_id,
      status,
      paid_at,
      bundles!inner ( id, title, description, image_url )
    `)
    .eq('user_id', user.id)
    .eq('status', 'COMPLETED')
    .order('paid_at', { ascending: false })

  if (error) {
    console.error('purchases error', error)
    return NextResponse.json({ purchases: [] })
  }

  // For each purchase, get lectures count and completed count
  const result = await Promise.all(
    (purchases || []).map(async (p: any) => {
      const bundle = p.bundles
      const { count: lecturesCount } = await supabase
        .from('lectures')
        .select('id', { count: 'exact', head: true })
        .eq('bundle_id', p.bundle_id)
        .eq('is_active', true)

      const { count: completedCount } = await supabase
        .from('progress')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .in('lecture_id',
          (await supabase.from('lectures').select('id').eq('bundle_id', p.bundle_id)).data?.map((l: any) => l.id) || []
        )

      return {
        id: p.id,
        bundle_id: p.bundle_id,
        bundle_title: bundle?.title || '',
        bundle_image: bundle?.image_url || '',
        bundle_description: bundle?.description || '',
        status: p.status,
        paid_at: p.paid_at,
        lectures_count: lecturesCount || 0,
        completed_count: completedCount || 0,
      }
    })
  )

  return NextResponse.json({ purchases: result })
}
