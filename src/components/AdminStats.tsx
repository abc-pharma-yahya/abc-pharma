'use client'

import { useEffect, useState } from 'react'

interface Stats {
  students: number
  bundles: number
  purchases: number
  revenue: number
  pending_claims: number
  lectures: number
}

interface RecentUser {
  id: string
  full_name: string
  email: string
  created_at: string
}

interface RecentClaim {
  id: string
  user_name: string
  bundle_title: string
  amount: number
  status: string
  created_at: string
}

const cards = [
  { key: 'students', label: 'الطلاب', icon: 'fa-users', color: 'teal' },
  { key: 'bundles', label: 'الكورسات', icon: 'fa-folder', color: 'navy' },
  { key: 'purchases', label: 'المشتريات', icon: 'fa-shopping-bag', color: 'coral' },
  { key: 'revenue', label: 'الإيرادات', icon: 'fa-money-bill-wave', color: 'gold', prefix: '', suffix: ' ج' },
  { key: 'pending_claims', label: 'طلبات معلقة', icon: 'fa-clock', color: 'coral' },
  { key: 'lectures', label: 'المحاضرات', icon: 'fa-video', color: 'teal' },
] as const

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [recentClaims, setRecentClaims] = useState<RecentClaim[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats)
        setRecentUsers(data.recent_users || [])
        setRecentClaims(data.recent_claims || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card, i) => {
          const value = (stats as any)?.[card.key] ?? 0
          return (
            <div key={i} className="card p-5">
              <div className={`w-12 h-12 rounded-xl bg-${card.color}/10 flex items-center justify-center mb-3`}>
                <i className={`fa-solid ${card.icon} text-${card.color} text-xl`}></i>
              </div>
              <div className="font-heading font-extrabold text-2xl text-navy">
                {value}{card.key === 'revenue' ? ' ج' : ''}
              </div>
              <div className="text-slate-500 text-sm mt-1">{card.label}</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-heading font-bold text-lg text-navy mb-4 flex items-center gap-2">
            <i className="fa-solid fa-user-plus text-teal"></i>
            آخر التسجيلات
          </h3>
          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-slate-500 text-center py-4">لا يوجد</p>
            ) : (
              recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <div className="font-semibold text-navy">{u.full_name}</div>
                    <div className="text-xs text-slate-500" dir="ltr">{u.email}</div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(u.created_at).toLocaleDateString('ar-EG')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-heading font-bold text-lg text-navy mb-4 flex items-center gap-2">
            <i className="fa-solid fa-bell text-coral"></i>
            آخر طلبات الاشتراك
          </h3>
          <div className="space-y-3">
            {recentClaims.length === 0 ? (
              <p className="text-slate-500 text-center py-4">لا يوجد</p>
            ) : (
              recentClaims.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <div className="font-semibold text-navy">{c.user_name}</div>
                    <div className="text-xs text-slate-500">{c.bundle_title} - {c.amount} ج</div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      c.status === 'PENDING'
                        ? 'bg-gold/10 text-gold'
                        : c.status === 'APPROVED'
                        ? 'bg-teal/10 text-teal'
                        : 'bg-coral/10 text-coral'
                    }`}
                  >
                    {c.status === 'PENDING' ? 'معلق' : c.status === 'APPROVED' ? 'مقبول' : 'مرفوض'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
