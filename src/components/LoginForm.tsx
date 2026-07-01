'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'فشل تسجيل الدخول')
      }

      if (data.user.role === 'SUPERADMIN') {
        router.push('/admin')
      } else {
        router.push('/student')
      }
      router.refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bglight p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal to-navy flex items-center justify-center">
              <i className="fa-solid fa-pills text-white text-xl"></i>
            </div>
            <span className="font-heading font-extrabold text-2xl text-navy">ABC Pharma</span>
          </Link>
          <h1 className="font-heading font-extrabold text-2xl text-navy mb-2">تسجيل الدخول</h1>
          <p className="text-slate-600">مرحباً بعودتك! سجل دخولك للمتابعة</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-navy font-semibold text-sm mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <i className="fa-solid fa-envelope input-icon"></i>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="example@email.com"
                  className="input-field pr-12"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-navy font-semibold text-sm mb-2">كلمة المرور</label>
              <div className="relative">
                <i className="fa-solid fa-lock input-icon"></i>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-field pr-12"
                />
              </div>
            </div>

            {error && (
              <div className="bg-coral/10 text-coral p-3 rounded-xl text-sm text-center">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  جاري الدخول...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-sign-in-alt"></i>
                  دخول
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-slate-100">
            <p className="text-slate-600 text-sm">
              ليس لديك حساب؟{' '}
              <Link href="/register" className="text-teal hover:text-navy font-semibold">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
