'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import PaymentDialog from './PaymentDialog'

interface Lecture {
  id: string
  title: string
  description: string
  duration: number
  sort_order: number
}

interface Bundle {
  id: string
  title: string
  description: string
  price: number
  original_price: number
  image_url: string
}

export default function BundleDetail() {
  const params = useParams()
  const id = params.id as string

  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [purchased, setPurchased] = useState(false)
  const [showPayment, setShowPayment] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/bundles/${id}`).then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()),
    ])
      .then(([bundleData, userData]) => {
        if (bundleData.bundle) {
          setBundle(bundleData.bundle)
          setLectures(bundleData.lectures || [])
        }
        if (userData.user) {
          setUser(userData.user)
          return fetch(`/api/purchases?bundle_id=${id}`).then((r) => r.json())
        }
        return null
      })
      .then((purchaseData) => {
        if (purchaseData) setPurchased(purchaseData.purchased === true)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    )
  }

  if (!bundle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <i className="fa-solid fa-exclamation-circle text-5xl text-coral"></i>
        <p className="text-xl text-navy">الكورس غير موجود</p>
        <Link href="/catalog" className="btn-primary">العودة للكورسات</Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-bglight">
      <div className="bg-gradient-to-bl from-navy to-teal py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/catalog" className="text-white/70 hover:text-white text-sm mb-4 inline-flex items-center gap-2">
            <i className="fa-solid fa-arrow-right"></i>
            العودة للكورسات
          </Link>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-white mb-4">{bundle.title}</h1>
              <p className="text-white/70 mb-6 leading-relaxed">{bundle.description}</p>
              <div className="flex items-center gap-4 mb-6">
                <span className="font-heading font-extrabold text-4xl text-gold">{bundle.price} جنيه</span>
                {bundle.original_price > bundle.price && (
                  <span className="text-white/50 line-through text-xl">{bundle.original_price} جنيه</span>
                )}
              </div>
              {user ? (
                purchased ? (
                  <Link href="/student" className="btn-primary">
                    <i className="fa-solid fa-play"></i>
                    متابعة الكورس
                  </Link>
                ) : (
                  <button onClick={() => setShowPayment(true)} className="btn-coral">
                    <i className="fa-solid fa-credit-card"></i>
                    اشترك الآن
                  </button>
                )
              ) : (
                <Link href="/login" className="btn-coral">
                  <i className="fa-solid fa-sign-in-alt"></i>
                  سجل دخول للاشتراك
                </Link>
              )}
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              {bundle.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bundle.image_url} alt={bundle.title} className="w-full h-64 object-cover" />
              ) : (
                <div className="w-full h-64 bg-white/10 flex items-center justify-center">
                  <i className="fa-solid fa-book-open text-6xl text-white/30"></i>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="font-heading font-extrabold text-2xl text-navy mb-6">
          محتويات الكورس ({lectures.length} محاضرة)
        </h2>

        {lectures.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <i className="fa-solid fa-folder-open text-4xl mb-4 opacity-50"></i>
            <p>سيتم إضافة المحاضرات قريباً</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lectures.map((lecture, index) => (
              <div key={lecture.id} className="card p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-heading font-bold text-teal">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-lg text-navy">{lecture.title}</h3>
                  {lecture.description && (
                    <p className="text-slate-600 text-sm mt-1 line-clamp-1">{lecture.description}</p>
                  )}
                </div>
                {lecture.duration > 0 && (
                  <div className="text-slate-500 text-sm flex items-center gap-1 flex-shrink-0">
                    <i className="fa-regular fa-clock"></i>
                    {Math.floor(lecture.duration / 60)}:{(lecture.duration % 60).toString().padStart(2, '0')}
                  </div>
                )}
                <div className="text-slate-400 flex-shrink-0">
                  <i className="fa-solid fa-lock"></i>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPayment && bundle && user && (
        <PaymentDialog
          bundle={bundle}
          userId={user.id}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setPurchased(true)
            setShowPayment(false)
          }}
        />
      )}
    </main>
  )
}
