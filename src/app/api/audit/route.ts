import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, logAudit } from '@/lib/auth'

/**
 * POST endpoint for logging suspicious activity from the client.
 * Used by StudentLecture content protection.
 */
export async function POST(req: NextRequest) {
  const user = await getSessionUser()

  try {
    const { action, resource, details } = await req.json()

    if (!action || !action.startsWith('SUSPICIOUS_')) {
      return NextResponse.json({ error: 'invalid action' }, { status: 400 })
    }

    await logAudit({
      user_id: user?.id || null,
      action,
      resource: resource || null,
      details: details || null,
      ip: req.headers.get('x-forwarded-for') || '',
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'log failed' }, { status: 500 })
  }
}
