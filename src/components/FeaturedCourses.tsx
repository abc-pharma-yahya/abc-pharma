'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Bundle {
  id: string
  title: string
  description: string
  price: number
  original_price: number
  image_url: string
}

export default function FeaturedCourses() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/bundles?featured=true')
      .then((res) => res.json())
      .then((data) => {
        setBundles(data.bundles || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <span className="text-teal font-semibold text-sm uppercase tracking-wide">كورسات مميزة</span>
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-navy mt-2">
              الأكثر طلباً
            </h2>
          </div>
          <Link href="/catalog" className="text-teal hover:text-navy font-semibold flex items-center gap-2">
            عرض الكل
            <i className="fa-solid fa-arrow-left"></i>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-slate-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-10 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : bundles.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <i className="fa-solid fa-folder-open text-4xl mb-4 opacity-50"></i>
            <p>لا توجد كورسات مميزة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map((bundle) => (
              <Link key={bundle.id} href={`/bundle/${bundle.id}`} className="card group hover:shadow-xl">
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  {bundle.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={bundle.image_url}
                      alt={bundle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="fa-solid fa-book-open text-4xl text-slate-300"></i>
                    </div>
                  )}
                  {bundle.original_price > bundle.price && (
                    <div className="absolute top-3 right-3 bg-coral text-white text-xs font-bold px-3 py-1 rounded-full">
                      خصم {Math.round((1 - bundle.price / bundle.original_price) * 100)}%
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-heading font-bold text-xl text-navy mb-2 line-clamp-2">{bundle.title}</h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{bundle.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-heading font-extrabold text-2xl text-teal">{bundle.price} جنيه</span>
                      {bundle.original_price > bundle.price && (
                        <span className="text-slate-400 line-through text-sm mr-2">{bundle.original_price} جنيه</span>
                      )}
                    </div>
                    <span className="text-teal group-hover:text-navy font-semibold text-sm flex items-center gap-1">
                      التفاصيل
                      <i className="fa-solid fa-arrow-left"></i>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
