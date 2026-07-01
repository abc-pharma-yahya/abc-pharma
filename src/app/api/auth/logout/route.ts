import { NextRequest, NextResponse } from 'next/server'
import { clearSession, getSessionUser, logAudit } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (user) {
    await logAudit({
      user_id: user.id,
      action: 'AUTH_LOGOUT',
      ip: req.headers.get('x-forwarded-for') || '',
    })
  }
  await clearSession()
  return NextResponse.json({ success: true })
}
