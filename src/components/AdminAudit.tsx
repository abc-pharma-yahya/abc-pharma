'use client'

import { useEffect, useState } from 'react'

interface AuditEntry {
  id: string
  user_id: string | null
  user_name: string | null
  action: string
  resource: string | null
  ip: string | null
  details: string | null
  created_at: string
}

export default function AdminAudit() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    fetch(`/api/admin/audit?filter=${filter}`)
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries || [])
        setLoading(false)
      })
  }

  useEffect(() => {
    load()
  }, [filter])

  const filtered = entries.filter(
    (e) =>
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      (e.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.details || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-heading font-bold text-xl text-navy">سجل النشاط</h2>
        <input
          type="text"
          placeholder="بحث في السجل..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-xs"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'ALL', label: 'الكل' },
          { id: 'SUSPICIOUS', label: 'مشبوهة' },
          { id: 'AUTH', label: 'مصادقة' },
          { id: 'ADMIN', label: 'إدارة' },
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

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 text-navy font-semibold text-sm">النوع</th>
                <th className="p-4 text-navy font-semibold text-sm">المستخدم</th>
                <th className="p-4 text-navy font-semibold text-sm">الإجراء</th>
                <th className="p-4 text-navy font-semibold text-sm">التفاصيل</th>
                <th className="p-4 text-navy font-semibold text-sm">IP</th>
                <th className="p-4 text-navy font-semibold text-sm">التوقيت</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">جاري التحميل...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">لا يوجد سجلات</td>
                </tr>
              ) : (
                filtered.map((e) => {
                  const isSuspicious = e.action.startsWith('SUSPICIOUS_')
                  return (
                    <tr
                      key={e.id}
                      className={`border-b border-slate-50 hover:bg-slate-50 ${
                        isSuspicious ? 'bg-coral/5' : ''
                      }`}
                    >
                      <td className="p-4">
                        {isSuspicious ? (
                          <span className="inline-flex items-center gap-1 text-coral">
                            <i className="fa-solid fa-triangle-exclamation"></i>
                            <span className="text-xs font-bold">مشبوه</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-teal">
                            <i className="fa-solid fa-circle-info"></i>
                            <span className="text-xs font-bold">عادي</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-navy font-semibold text-sm">
                        {e.user_name || 'زائر'}
                      </td>
                      <td className="p-4 text-slate-600 text-sm font-mono" dir="ltr">
                        {e.action}
                      </td>
                      <td className="p-4 text-slate-500 text-sm max-w-xs truncate">
                        {e.details || '-'}
                      </td>
                      <td className="p-4 text-slate-500 text-sm font-mono" dir="ltr">
                        {e.ip || '-'}
                      </td>
                      <td className="p-4 text-slate-500 text-sm">
                        {new Date(e.created_at).toLocaleString('ar-EG')}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
