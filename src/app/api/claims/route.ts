import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSessionUser, logAudit } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  try {
    const { user_id, bundle_id, amount, proof_image } = await req.json()

    if (user.id !== user_id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    // Check if there's already a pending or approved claim for this user+bundle
    const { data: existing } = await supabase
      .from('claims')
      .select('id, status')
      .eq('user_id', user_id)
      .eq('bundle_id', bundle_id)
      .in('status', ['PENDING', 'APPROVED'])
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'لديك طلب اشتراك موجود بالفعل لهذا الكورس' },
        { status: 400 }
      )
    }

    const { data: claim, error } = await supabase
      .from('claims')
      .insert({
        user_id,
        bundle_id,
        amount,
        proof_image,
        status: 'PENDING',
      })
      .select('id')
      .single()

    if (error) {
      console.error('claim insert error', error)
      return NextResponse.json({ error: 'فشل إرسال الطلب' }, { status: 500 })
    }

    await logAudit({
      user_id: user.id,
      action: 'CLAIM_SUBMIT',
      resource: `bundle/${bundle_id}`,
      ip: req.headers.get('x-forwarded-for'),
      details: `Claim ${claim.id} for ${amount} EGP`,
    })

    return NextResponse.json({ success: true, claim })
  } catch (e: any) {
    console.error('claim error', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
