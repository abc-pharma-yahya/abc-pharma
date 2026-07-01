import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSessionUser, logAudit } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const bundleId = searchParams.get('bundle_id')

  if (!bundleId) {
    return NextResponse.json({ error: 'bundle_id required' }, { status: 400 })
  }

  // Get all lectures in the bundle
  const { data: lectures } = await supabase
    .from('lectures')
    .select('id')
    .eq('bundle_id', bundleId)
    .eq('is_active', true)

  const lectureIds = (lectures || []).map((l) => l.id)

  if (lectureIds.length === 0) {
    return NextResponse.json({ progress: {} })
  }

  const { data: progressRows } = await supabase
    .from('progress')
    .select('lecture_id, is_completed, percent_watched')
    .eq('user_id', user.id)
    .in('lecture_id', lectureIds)

  const progressMap: Record<string, { is_completed: boolean; percent_watched: number }> = {}
  ;(progressRows || []).forEach((p: any) => {
    progressMap[p.lecture_id] = {
      is_completed: p.is_completed,
      percent_watched: p.percent_watched,
    }
  })

  return NextResponse.json({ progress: progressMap })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  try {
    const { lecture_id, is_completed, percent_watched } = await req.json()

    if (!lecture_id) {
      return NextResponse.json({ error: 'lecture_id required' }, { status: 400 })
    }

    // Verify the user has purchased the bundle that owns this lecture
    const { data: lecture } = await supabase
      .from('lectures')
      .select('bundle_id')
      .eq('id', lecture_id)
      .single()

    if (!lecture) {
      return NextResponse.json({ error: 'المحاضرة غير موجودة' }, { status: 404 })
    }

    const { data: purchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('bundle_id', lecture.bundle_id)
      .eq('status', 'COMPLETED')
      .single()

    if (!purchase) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    // Upsert progress
    const { error } = await supabase
      .from('progress')
      .upsert(
        {
          user_id: user.id,
          lecture_id,
          is_completed: is_completed ?? false,
          percent_watched: percent_watched ?? 0,
        },
        { onConflict: 'user_id,lecture_id' }
      )

    if (error) {
      console.error('progress upsert error', error)
      return NextResponse.json({ error: 'فشل تحديث التقدم' }, { status: 500 })
    }

    if (is_completed) {
      await logAudit({
        user_id: user.id,
        action: 'PROGRESS_COMPLETE',
        resource: `lecture/${lecture_id}`,
        ip: req.headers.get('x-forwarded-for') || '',
      })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('progress error', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
