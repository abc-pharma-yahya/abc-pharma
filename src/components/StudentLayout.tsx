'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Purchase {
  id: string
  bundle_id: string
  bundle_title: string
  bundle_image: string
  bundle_description: string
  status: string
  paid_at: string | null
  lectures_count: number
  completed_count: number
}

export default function StudentLayout() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push('/login')
          return
        }
        setUser(data.user)
        return fetch('/api/purchases').then((r) => r.json())
      })
      .then((data) => {
        if (data) setPurchases(data.purchases || [])
        setLoading(false)
      })
      .catch(() => {
        router.push('/login')
        setLoading(false)
      })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <main className="min-h-screen bg-bglight">
      <div className="bg-gradient-to-bl from-navy to-teal py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading font-extrabold text-3xl text-white mb-2">
            أهلاً {user.full_name} 👋
          </h1>
          <p className="text-white/70">هذه هي كورساتك المشتراة. تابع تقدمك في التعلم</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="font-heading font-extrabold text-2xl text-navy mb-6">كورساتي المشتراة</h2>

        {purchases.length === 0 ? (
          <div className="card p-12 text-center">
            <i className="fa-solid fa-folder-open text-5xl text-slate-300 mb-4"></i>
            <h3 className="font-heading font-bold text-xl text-navy mb-2">لا توجد كورسات مشتراة</h3>
            <p className="text-slate-500 mb-6">تصفح الكورسات المتاحة واشترك الآن لتبدأ رحلتك التعليمية</p>
            <Link href="/catalog" className="btn-primary">
              <i className="fa-solid fa-graduation-cap"></i>
              تصفح الكورسات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchases.map((p) => {
              const progress = p.lectures_count > 0
                ? Math.round((p.completed_count / p.lectures_count) * 100)
                : 0
              return (
                <div key={p.id} className="card group hover:shadow-xl">
                  <div className="relative h-40 overflow-hidden bg-slate-100">
                    {p.bundle_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.bundle_image} alt={p.bundle_title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="fa-solid fa-book-open text-4xl text-slate-300"></i>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <div className="flex items-center justify-between text-white text-xs mb-1">
                        <span>التقدم</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-white/30 rounded-full h-2">
                        <div
                          className="bg-teal h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-heading font-bold text-lg text-navy mb-2 line-clamp-2">
                      {p.bundle_title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{p.bundle_description}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                      <span>
                        <i className="fa-solid fa-video ml-1"></i>
                        {p.lectures_count} محاضرة
                      </span>
                      <span>
                        <i className="fa-solid fa-check-circle ml-1 text-teal"></i>
                        {p.completed_count} مكتملة
                      </span>
                    </div>
                    <Link
                      href={`/student/${p.bundle_id}`}
                      className="btn-primary w-full text-sm"
                    >
                      <i className="fa-solid fa-play"></i>
                      متابعة الكورس
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
