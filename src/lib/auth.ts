import { cookies } from 'next/headers'
import { supabase } from './supabase'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export interface SessionUser {
  id: string
  email: string
  full_name: string
  phone: string
  role: string
  is_active: boolean
  is_locked: boolean
}

/**
 * Create a new session token for a user and persist it in the users table.
 */
export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')

  await supabase
    .from('users')
    .update({
      session_token: token,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  return token
}

/**
 * Set the session cookie on the response. Server-side only.
 */
export async function setCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

/**
 * Read the session token from the request cookies. Server-side only.
 */
export async function getCookieToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get('session_token')?.value
}

/**
 * Resolve the currently logged-in user from the session cookie.
 * Returns null if no session, user inactive, or user locked.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await getCookieToken()
  if (!token) return null

  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, phone, role, is_active, is_locked')
    .eq('session_token', token)
    .single()

  if (error || !data) return null
  if (!data.is_active || data.is_locked) return null

  return data as SessionUser
}

/**
 * Clear the session server-side: invalidate token in DB and delete cookie.
 */
export async function clearSession() {
  const token = await getCookieToken()
  if (token) {
    await supabase
      .from('users')
      .update({
        session_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq('session_token', token)
  }
  const cookieStore = await cookies()
  cookieStore.delete('session_token')
}

/**
 * Hash a password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * Verify a plaintext password against a bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Verify the SUPERADMIN role against the configured admin email.
 */
export function isSuperAdmin(email: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL || 'abcpharma000@gmail.com'
  return email.toLowerCase() === adminEmail.toLowerCase()
}

/**
 * Write an entry to the audit log.
 */
export async function logAudit(opts: {
  user_id?: string | null
  action: string
  resource?: string
  ip?: string
  details?: string
}) {
  try {
    await supabase.from('audit_log').insert({
      user_id: opts.user_id || null,
      action: opts.action,
      resource: opts.resource || null,
      ip: opts.ip || null,
      details: opts.details || null,
    })
  } catch (e) {
    console.error('audit log failed', e)
  }
}
