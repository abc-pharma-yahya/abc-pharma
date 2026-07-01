'use client'

import { useEffect, useState } from 'react'

interface Bundle {
  id: string
  title: string
}

interface Lecture {
  id: string
  bundle_id: string
  title: string
  description: string
  video_url: string
  pdf_url: string
  duration: number
  sort_order: number
  is_active: boolean
}

export default function AdminLectures() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [selectedBundle, setSelectedBundle] = useState<string>('')
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Lecture | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    video_url: '',
    pdf_url: '',
    duration: '0',
    sort_order: '0',
    is_active: true,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/bundles')
      .then((res) => res.json())
      .then((data) => {
        setBundles(data.bundles || [])
        if (data.bundles?.length > 0 && !selectedBundle) {
          setSelectedBundle(data.bundles[0].id)
        }
      })
  }, [])

  useEffect(() => {
    if (!selectedBundle) return
    setLoading(true)
    fetch(`/api/admin/lectures?bundle_id=${selectedBundle}`)
      .then((res) => res.json())
      .then((data) => {
        setLectures(data.lectures || [])
        setLoading(false)
      })
  }, [selectedBundle])

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      video_url: '',
      pdf_url: '',
      duration: '0',
      sort_order: '0',
      is_active: true,
    })
    setEditing(null)
    setShowForm(false)
  }

  const handleEdit = (l: Lecture) => {
    setEditing(l)
    setForm({
      title: l.title,
      description: l.description || '',
      video_url: l.video_url || '',
      pdf_url: l.pdf_url || '',
      duration: l.duration?.toString() || '0',
      sort_order: l.sort_order?.toString() || '0',
      is_active: l.is_active,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBundle) {
      alert('يرجى اختيار كورس أولاً')
      return
    }
    setSaving(true)

    try {
      const payload = {
        bundle_id: selectedBundle,
        title: form.title,
        description: form.description,
        video_url: form.video_url,
        pdf_url: form.pdf_url,
        duration: parseInt(form.duration) || 0,
        sort_order: parseInt(form.sort_order) || 0,
        is_active: form.is_active,
      }

      if (editing) {
        await fetch(`/api/admin/lectures/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch('/api/admin/lectures', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      resetForm()
      // Reload lectures
      const res = await fetch(`/api/admin/lectures?bundle_id=${selectedBundle}`)
      const data = await res.json()
      setLectures(data.lectures || [])
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المحاضرة؟')) return
    await fetch(`/api/admin/lectures/${id}`, { method: 'DELETE' })
    const res = await fetch(`/api/admin/lectures?bundle_id=${selectedBundle}`)
    const data = await res.json()
    setLectures(data.lectures || [])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-heading font-bold text-xl text-navy">إدارة المحاضرات</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="btn-primary"
          disabled={!selectedBundle}
        >
          <i className="fa-solid fa-plus"></i>
          إضافة محاضرة
        </button>
      </div>

      <div className="card p-4">
        <label className="block text-navy font-semibold text-sm mb-2">اختر الكورس</label>
        <select
          value={selectedBundle}
          onChange={(e) => setSelectedBundle(e.target.value)}
          className="input-field"
        >
          {bundles.length === 0 && <option value="">لا يوجد كورسات</option>}
          {bundles.map((b) => (
            <option key={b.id} value={b.id}>{b.title}</option>
          ))}
        </select>
      </div>

      {showForm && selectedBundle && (
        <div className="card p-6">
          <h3 className="font-heading font-bold text-lg text-navy mb-4">
            {editing ? 'تعديل محاضرة' : 'إضافة محاضرة جديدة'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-navy font-semibold text-sm mb-2">عنوان المحاضرة</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-navy font-semibold text-sm mb-2">الوصف</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-navy font-semibold text-sm mb-2">
                  <i className="fa-brands fa-youtube text-coral ml-1"></i>
                  رابط YouTube (Unlisted)
                </label>
                <input
                  type="url"
                  value={form.video_url}
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="input-field"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-navy font-semibold text-sm mb-2">
                  <i className="fa-solid fa-file-pdf text-coral ml-1"></i>
                  رابط Google Drive للـ PDF
                </label>
                <input
                  type="url"
                  value={form.pdf_url}
                  onChange={(e) => setForm({ ...form, pdf_url: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="input-field"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-navy font-semibold text-sm mb-2">المدة (بالثواني)</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-navy font-semibold text-sm mb-2">الترتيب</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-5 h-5 accent-teal"
                  />
                  <span className="text-navy font-semibold">نشط</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    جاري الحفظ...
                  </>
                ) : editing ? 'تحديث' : 'إضافة'}
              </button>
              <button type="button" onClick={resetForm} className="btn-outline">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 text-navy font-semibold text-sm">#</th>
                <th className="p-4 text-navy font-semibold text-sm">العنوان</th>
                <th className="p-4 text-navy font-semibold text-sm">المدة</th>
                <th className="p-4 text-navy font-semibold text-sm">الفيديو</th>
                <th className="p-4 text-navy font-semibold text-sm">PDF</th>
                <th className="p-4 text-navy font-semibold text-sm">الحالة</th>
                <th className="p-4 text-navy font-semibold text-sm">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {!selectedBundle ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">اختر كورس أولاً</td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">جاري التحميل...</td>
                </tr>
              ) : lectures.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">لا يوجد محاضرات</td>
                </tr>
              ) : (
                lectures.map((l, i) => (
                  <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="p-4 text-slate-600">{i + 1}</td>
                    <td className="p-4">
                      <div className="font-semibold text-navy">{l.title}</div>
                      {l.description && (
                        <div className="text-xs text-slate-500 line-clamp-1">{l.description}</div>
                      )}
                    </td>
                    <td className="p-4 text-slate-600 text-sm">
                      {l.duration > 0
                        ? `${Math.floor(l.duration / 60)}:${(l.duration % 60).toString().padStart(2, '0')}`
                        : '-'}
                    </td>
                    <td className="p-4">
                      {l.video_url ? (
                        <i className="fa-solid fa-check text-teal"></i>
                      ) : (
                        <i className="fa-solid fa-xmark text-slate-300"></i>
                      )}
                    </td>
                    <td className="p-4">
                      {l.pdf_url ? (
                        <i className="fa-solid fa-check text-teal"></i>
                      ) : (
                        <i className="fa-solid fa-xmark text-slate-300"></i>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          l.is_active ? 'bg-teal/10 text-teal' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {l.is_active ? 'نشط' : 'موقوف'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(l)}
                          className="w-8 h-8 rounded-lg bg-navy/10 text-navy hover:bg-navy hover:text-white transition-colors"
                          aria-label="تعديل"
                        >
                          <i className="fa-solid fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(l.id)}
                          className="w-8 h-8 rounded-lg bg-coral/10 text-coral hover:bg-coral hover:text-white transition-colors"
                          aria-label="حذف"
                        >
                          <i className="fa-solid fa-trash"></i>
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
