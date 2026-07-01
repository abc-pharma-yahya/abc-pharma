'use client'

import { useEffect, useState } from 'react'

interface Student {
  id: string
  full_name: string
  email: string
  phone: string
  is_active: boolean
  is_locked: boolean
  created_at: string
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/admin/students')
      .then((res) => res.json())
      .then((data) => {
        setStudents(data.students || [])
        setLoading(false)
      })
  }

  useEffect(() => {
    load()
  }, [])

  const toggleLock = async (s: Student) => {
    const action = s.is_locked ? 'فتح' : 'قفل'
    if (!confirm(`هل أنت متأكد من ${action} حساب ${s.full_name}؟`)) return
    await fetch(`/api/admin/students/${s.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_lock' }),
    })
    load()
  }

  const toggleActive = async (s: Student) => {
    const action = s.is_active ? 'تعطيل' : 'تفعيل'
    if (!confirm(`هل أنت متأكد من ${action} حساب ${s.full_name}؟`)) return
    await fetch(`/api/admin/students/${s.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_active' }),
    })
    load()
  }

  const resetPassword = async (s: Student) => {
    if (!confirm(`هل أنت متأكد من إعادة تعيين كلمة مرور ${s.full_name}؟ سيتم تعيينها إلى 123456`)) return
    await fetch(`/api/admin/students/${s.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset_password' }),
    })
    alert('تم إعادة تعيين كلمة المرور إلى: 123456')
  }

  const filtered = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone || '').includes(search)
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-heading font-bold text-xl text-navy">إدارة الطلاب</h2>
        <input
          type="text"
          placeholder="بحث..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-xs"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 text-navy font-semibold text-sm">الاسم</th>
                <th className="p-4 text-navy font-semibold text-sm">البريد</th>
                <th className="p-4 text-navy font-semibold text-sm">الموبايل</th>
                <th className="p-4 text-navy font-semibold text-sm">التسجيل</th>
                <th className="p-4 text-navy font-semibold text-sm">الحالة</th>
                <th className="p-4 text-navy font-semibold text-sm">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">جاري التحميل...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">لا يوجد طلاب</td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="p-4 font-semibold text-navy">{s.full_name}</td>
                    <td className="p-4 text-slate-600 text-sm" dir="ltr">{s.email}</td>
                    <td className="p-4 text-slate-600 text-sm" dir="ltr">{s.phone || '-'}</td>
                    <td className="p-4 text-slate-500 text-sm">
                      {new Date(s.created_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`text-xs px-2 py-1 rounded-full text-center ${
                            s.is_active ? 'bg-teal/10 text-teal' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {s.is_active ? 'نشط' : 'موقوف'}
                        </span>
                        {s.is_locked && (
                          <span className="text-xs px-2 py-1 rounded-full bg-coral/10 text-coral text-center">
                            مقفل
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleLock(s)}
                          className={`w-8 h-8 rounded-lg transition-colors ${
                            s.is_locked
                              ? 'bg-teal/10 text-teal hover:bg-teal hover:text-white'
                              : 'bg-gold/10 text-gold hover:bg-gold hover:text-white'
                          }`}
                          aria-label={s.is_locked ? 'فتح' : 'قفل'}
                          title={s.is_locked ? 'فتح الحساب' : 'قفل الحساب'}
                        >
                          <i className={`fa-solid ${s.is_locked ? 'fa-lock-open' : 'fa-lock'}`}></i>
                        </button>
                        <button
                          onClick={() => toggleActive(s)}
                          className={`w-8 h-8 rounded-lg transition-colors ${
                            s.is_active
                              ? 'bg-coral/10 text-coral hover:bg-coral hover:text-white'
                              : 'bg-teal/10 text-teal hover:bg-teal hover:text-white'
                          }`}
                          aria-label={s.is_active ? 'تعطيل' : 'تفعيل'}
                          title={s.is_active ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                        >
                          <i className={`fa-solid ${s.is_active ? 'fa-ban' : 'fa-circle-check'}`}></i>
                        </button>
                        <button
                          onClick={() => resetPassword(s)}
                          className="w-8 h-8 rounded-lg bg-navy/10 text-navy hover:bg-navy hover:text-white transition-colors"
                          aria-label="إعادة تعيين كلمة المرور"
                          title="إعادة تعيين كلمة المرور"
                        >
                          <i className="fa-solid fa-key"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
