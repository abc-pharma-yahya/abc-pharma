'use client'

import { useEffect, useState } from 'react'

interface Bundle {
  id: string
  title: string
  description: string
  price: number
  original_price: number
  image_url: string
  is_active: boolean
  is_featured: boolean
  sort_order: number
}

export default function AdminBundles() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Bundle | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    original_price: '',
    is_active: true,
    is_featured: false,
    sort_order: '0',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    fetch('/api/admin/bundles')
      .then((res) => res.json())
      .then((data) => {
        setBundles(data.bundles || [])
        setLoading(false)
      })
  }

  useEffect(() => {
    load()
  }, [])

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      price: '',
      original_price: '',
      is_active: true,
      is_featured: false,
      sort_order: '0',
    })
    setImageFile(null)
    setImagePreview('')
    setEditing(null)
    setShowForm(false)
  }

  const handleEdit = (b: Bundle) => {
    setEditing(b)
    setForm({
      title: b.title,
      description: b.description || '',
      price: b.price.toString(),
      original_price: b.original_price?.toString() || '',
      is_active: b.is_active,
      is_featured: b.is_featured,
      sort_order: b.sort_order?.toString() || '0',
    })
    setImagePreview(b.image_url || '')
    setShowForm(true)
  }

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setImageFile(f)
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(f)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let imageUrl = editing?.image_url || ''

      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('bucket', 'Lectures')
        formData.append('path', `bundles/${Date.now()}_${imageFile.name}`)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        const uploadData = await uploadRes.json()
        imageUrl = uploadData.url
      }

      const payload = {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price) || 0,
        original_price: parseFloat(form.original_price) || 0,
        image_url: imageUrl,
        is_active: form.is_active,
        is_featured: form.is_featured,
        sort_order: parseInt(form.sort_order) || 0,
      }

      if (editing) {
        await fetch(`/api/admin/bundles/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch('/api/admin/bundles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      resetForm()
      load()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكورس؟ سيتم حذف جميع المحاضرات المرتبطة به.')) return
    await fetch(`/api/admin/bundles/${id}`, { method: 'DELETE' })
    load()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-heading font-bold text-xl text-navy">إدارة الكورسات</h2>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary">
          <i className="fa-solid fa-plus"></i>
          إضافة كورس
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h3 className="font-heading font-bold text-lg text-navy mb-4">
            {editing ? 'تعديل كورس' : 'إضافة كورس جديد'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-navy font-semibold text-sm mb-2">عنوان الكورس</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-navy font-semibold text-sm mb-2">صورة الكورس</label>
                <input type="file" accept="image/*" onChange={handleImage} className="input-field p-2" />
                {imagePreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="معاينة" className="mt-2 h-24 rounded-lg object-cover" />
                )}
              </div>
            </div>

            <div>
              <label className="block text-navy font-semibold text-sm mb-2">الوصف</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-navy font-semibold text-sm mb-2">السعر (جنيه)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-navy font-semibold text-sm mb-2">السعر قبل الخصم</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.original_price}
                  onChange={(e) => setForm({ ...form, original_price: e.target.value })}
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
            </div>

            <div className="flex gap-6 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-5 h-5 accent-teal"
                />
                <span className="text-navy font-semibold">نشط</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="w-5 h-5 accent-teal"
                />
                <span className="text-navy font-semibold">مميز</span>
              </label>
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
                <th className="p-4 text-navy font-semibold text-sm">الكورس</th>
                <th className="p-4 text-navy font-semibold text-sm">السعر</th>
                <th className="p-4 text-navy font-semibold text-sm">الحالة</th>
                <th className="p-4 text-navy font-semibold text-sm">الترتيب</th>
                <th className="p-4 text-navy font-semibold text-sm">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {bundles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">لا يوجد كورسات</td>
                </tr>
              ) : (
                bundles.map((b) => (
                  <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {b.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={b.image_url} alt={b.title} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                            <i className="fa-solid fa-folder text-slate-300"></i>
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-navy">{b.title}</div>
                          {b.is_featured && <span className="text-xs text-gold">مميز</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-navy font-semibold">{b.price} ج</td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          b.is_active ? 'bg-teal/10 text-teal' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {b.is_active ? 'نشط' : 'موقوف'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{b.sort_order}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(b)}
                          className="w-8 h-8 rounded-lg bg-navy/10 text-navy hover:bg-navy hover:text-white transition-colors"
                          aria-label="تعديل"
                        >
                          <i className="fa-solid fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
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
