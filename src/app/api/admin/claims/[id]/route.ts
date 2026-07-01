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
    const { status, admin_note } = await req.json()

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'حالة غير صالحة' }, { status: 400 })
    }

    // Get claim details
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('*')
      .eq('id', id)
      .single()

    if (claimError || !claim) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    // Update claim
    const { error: updateError } = await supabase
      .from('claims')
      .update({
        status,
        admin_note: admin_note || null,
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: 'فشل تحديث الطلب' }, { status: 500 })
    }

    // If approved, create a purchase record
    if (status === 'APPROVED') {
      // Check if purchase already exists
      const { data: existingPurchase } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', claim.user_id)
        .eq('bundle_id', claim.bundle_id)
        .eq('status', 'COMPLETED')
        .single()

      if (!existingPurchase) {
        await supabase.from('purchases').insert({
          user_id: claim.user_id,
          bundle_id: claim.bundle_id,
          status: 'COMPLETED',
          amount: claim.amount,
          paid_at: new Date().toISOString(),
        })
      }
    }

    await logAudit({
      user_id: user.id,
      action: status === 'APPROVED' ? 'ADMIN_CLAIM_APPROVE' : 'ADMIN_CLAIM_REJECT',
      resource: `claim/${id}`,
      ip: req.headers.get('x-forwarded-for') || '',
      details: admin_note ? `Note: ${admin_note}` : null,
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('claim update error', e)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
