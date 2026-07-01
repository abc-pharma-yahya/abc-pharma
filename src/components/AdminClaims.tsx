'use client'

import { useEffect, useState } from 'react'

interface Claim {
  id: string
  user_id: string
  user_name: string
  user_email: string
  bundle_id: string
  bundle_title: string
  amount: number
  status: string
  proof_image: string
  admin_note: string | null
  created_at: string
}

export default function AdminClaims() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [viewing, setViewing] = useState<Claim | null>(null)
  const [rejecting, setRejecting] = useState<Claim | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  const load = () => {
    setLoading(true)
    fetch(`/api/admin/claims?status=${filter}`)
      .then((res) => res.json())
      .then((data) => {
        setClaims(data.claims || [])
        setLoading(false)
      })
  }

  useEffect(() => {
    load()
  }, [filter])

  const handleApprove = async (id: string) => {
    if (!confirm('هل أنت متأكد من قبول هذا الطلب؟ سيتم إضافة الكورس لطالب.')) return
    await fetch(`/api/admin/claims/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'APPROVED' }),
    })
    load()
  }

  const handleReject = async () => {
    if (!rejecting) return
    if (!rejectNote.trim()) {
      alert('يرجى إدخال سبب الرفض')
      return
    }
    await fetch(`/api/admin/claims/${rejecting.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REJECTED', admin_note: rejectNote }),
    })
    setRejecting(null)
    setRejectNote('')
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-heading font-bold text-xl text-navy">طلبات الاشتراك</h2>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'ALL', label: 'الكل' },
            { id: 'PENDING', label: 'معلقة' },
            { id: 'APPROVED', label: 'مقبولة' },
            { id: 'REJECTED', label: 'مرفوضة' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${
                filter === f.id ? 'bg-teal text-white' : 'bg-white text-navy hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 text-navy font-semibold text-sm">الطالب</th>
                <th className="p-4 text-navy font-semibold text-sm">الكورس</th>
                <th className="p-4 text-navy font-semibold text-sm">المبلغ</th>
                <th className="p-4 text-navy font-semibold text-sm">الإيصال</th>
                <th className="p-4 text-navy font-semibold text-sm">التاريخ</th>
                <th className="p-4 text-navy font-semibold text-sm">الحالة</th>
                <th className="p-4 text-navy font-semibold text-sm">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">جاري التحميل...</td>
                </tr>
              ) : claims.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">لا يوجد طلبات</td>
                </tr>
              ) : (
                claims.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-semibold text-navy">{c.user_name}</div>
                      <div className="text-xs text-slate-500" dir="ltr">{c.user_email}</div>
                    </td>
                    <td className="p-4 text-navy">{c.bundle_title}</td>
                    <td className="p-4 font-semibold text-teal">{c.amount} ج</td>
                    <td className="p-4">
                      {c.proof_image && (
                        <button
                          onClick={() => setViewing(c)}
                          className="text-teal hover:text-navy"
                          aria-label="عرض الإيصال"
                        >
                          <i className="fa-solid fa-receipt text-lg"></i>
                        </button>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 text-sm">
                      {new Date(c.created_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="p-4">
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
                      {c.admin_note && c.status === 'REJECTED' && (
                        <div className="text-xs text-coral mt-1 line-clamp-1">{c.admin_note}</div>
                      )}
                    </td>
                    <td className="p-4">
                      {c.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(c.id)}
                            className="w-8 h-8 rounded-lg bg-teal/10 text-teal hover:bg-teal hover:text-white transition-colors"
                            aria-label="قبول"
                          >
                            <i className="fa-solid fa-check"></i>
                          </button>
                          <button
                            onClick={() => setRejecting(c)}
                            className="w-8 h-8 rounded-lg bg-coral/10 text-coral hover:bg-coral hover:text-white transition-colors"
                            aria-label="رفض"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Receipt Modal */}
      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setViewing(null)}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg text-navy">إيصال الدفع</h3>
              <button onClick={() => setViewing(null)} className="text-slate-400 text-2xl">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={viewing.proof_image} alt="إيصال" className="w-full rounded-xl" />
            <div className="mt-4 text-sm text-slate-600">
              <div><strong>الطالب:</strong> {viewing.user_name}</div>
              <div><strong>الكورس:</strong> {viewing.bundle_title}</div>
              <div><strong>المبلغ:</strong> {viewing.amount} جنيه</div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="font-heading font-bold text-lg text-navy mb-4">رفض الطلب</h3>
            <label className="block text-navy font-semibold text-sm mb-2">سبب الرفض</label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              placeholder="أدخل سبب الرفض..."
              className="input-field"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={handleReject} className="btn-coral flex-1">تأكيد الرفض</button>
              <button
                onClick={() => { setRejecting(null); setRejectNote('') }}
                className="btn-outline flex-1"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
