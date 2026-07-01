'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SessionUser {
  id: string
  full_name: string
  role: string
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<SessionUser | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user)
        else setUser(null)
      })
      .catch(() => setUser(null))
  }, [pathname])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-navy flex items-center justify-center shadow-md">
              <i className="fa-solid fa-pills text-white text-lg"></i>
            </div>
            <span className="font-heading font-extrabold text-xl text-navy">ABC Pharma</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-navy hover:text-teal font-semibold transition-colors">الرئيسية</Link>
            <Link href="/catalog" className="text-navy hover:text-teal font-semibold transition-colors">الكورسات</Link>
            {user ? (
              <>
                {user.role === 'SUPERADMIN' && (
                  <Link href="/admin" className="text-navy hover:text-teal font-semibold transition-colors">لوحة التحكم</Link>
                )}
                <Link href="/student" className="text-navy hover:text-teal font-semibold transition-colors">كورساتي</Link>
                <button
                  onClick={handleLogout}
                  className="btn-coral text-sm px-4 py-2"
                >
                  <i className="fa-solid fa-sign-out-alt"></i>
                  خروج
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-navy hover:text-teal font-semibold transition-colors">تسجيل الدخول</Link>
                <Link href="/register" className="btn-primary text-sm px-4 py-2">
                  <i className="fa-solid fa-user-plus"></i>
                  إنشاء حساب
                </Link>
              </>
            )}
          </nav>

          <button
            className="md:hidden text-navy text-2xl"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="القائمة"
          >
            <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-100">
            <div className="flex flex-col gap-3">
              <Link href="/" onClick={() => setIsOpen(false)} className="text-navy hover:text-teal font-semibold py-2">الرئيسية</Link>
              <Link href="/catalog" onClick={() => setIsOpen(false)} className="text-navy hover:text-teal font-semibold py-2">الكورسات</Link>
              {user ? (
                <>
                  {user.role === 'SUPERADMIN' && (
                    <Link href="/admin" onClick={() => setIsOpen(false)} className="text-navy hover:text-teal font-semibold py-2">لوحة التحكم</Link>
                  )}
                  <Link href="/student" onClick={() => setIsOpen(false)} className="text-navy hover:text-teal font-semibold py-2">كورساتي</Link>
                  <button onClick={handleLogout} className="btn-coral text-sm">خروج</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)} className="text-navy hover:text-teal font-semibold py-2">تسجيل الدخول</Link>
                  <Link href="/register" onClick={() => setIsOpen(false)} className="btn-primary text-sm">إنشاء حساب</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
