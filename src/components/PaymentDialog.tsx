'use client'

import { useState } from 'react'

interface Bundle {
  id: string
  title: string
  price: number
}

interface PaymentDialogProps {
  bundle: Bundle
  userId: string
  onClose: () => void
  onSuccess: () => void
}

export default function PaymentDialog({ bundle, userId, onClose, onSuccess }: PaymentDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result as string)
      reader.readAsDataURL(f)
    }
  }

  const handleSubmit = async () => {
    if (!file) {
      setError('يرجى رفع إيصال الدفع')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'Lectures')
      formData.append('path', `receipts/${userId}/${bundle.id}/${Date.now()}_${file.name}`)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const uploadData = await uploadRes.json()

      if (!uploadData.url) {
        throw new Error('فشل رفع الإيصال')
      }

      const claimRes = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          bundle_id: bundle.id,
          amount: bundle.price,
          proof_image: uploadData.url,
        }),
      })

      if (!claimRes.ok) {
        const d = await claimRes.json().catch(() => ({}))
        throw new Error(d.error || 'فشل إرسال الطلب')
      }

      onSuccess()
    } catch (e: any) {
      setError(e.message || 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-extrabold text-2xl text-navy">إتمام الاشتراك</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl" aria-label="إغلاق">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-teal/10 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm">الكورس:</span>
              <span className="font-heading font-bold text-navy">{bundle.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 text-sm">المبلغ المطلوب:</span>
              <span className="font-heading font-extrabold text-2xl text-teal">{bundle.price} جنيه</span>
            </div>
          </div>

          <div className="bg-coral/10 border-2 border-dashed border-coral/30 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-coral flex items-center justify-center">
                <i className="fa-solid fa-mobile-screen text-white"></i>
              </div>
              <div>
                <div className="font-heading font-bold text-navy">فودافون كاش</div>
                <div className="text-slate-600 text-sm">أرسل المبلغ إلى الرقم التالي</div>
              </div>
            </div>
            <div className="text-center my-3">
              <div className="font-heading font-extrabold text-3xl text-coral" dir="ltr">01019755523</div>
            </div>
            <p className="text-slate-600 text-xs text-center">
              بعد إتمام التحويل، ارفع صورة الإيصال أدناه
            </p>
          </div>

          <label className="block">
            <span className="text-navy font-semibold text-sm mb-2 block">صورة الإيصال</span>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-teal transition-colors">
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" id="receipt" />
              <label htmlFor="receipt" className="cursor-pointer block">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="إيصال" className="max-h-40 mx-auto rounded-lg" />
                ) : (
                  <>
                    <i className="fa-solid fa-cloud-arrow-up text-4xl text-slate-300 mb-2"></i>
                    <p className="text-slate-500 text-sm">اضغط لرفع صورة الإيصال</p>
                  </>
                )}
              </label>
            </div>
          </label>
        </div>

        {error && (
          <div className="bg-coral/10 text-coral p-3 rounded-xl text-sm mb-4 text-center">{error}</div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1" disabled={loading}>
            إلغاء
          </button>
          <button onClick={handleSubmit} className="btn-primary flex-1" disabled={loading || !file}>
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                جاري الإرسال...
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane"></i>
                إرسال الطلب
              </>
            )}
          </button>
        </div>

        <p className="text-slate-500 text-xs text-center mt-4">
          سيتم مراجعة طلبك خلال 24 ساعة وستصلك رسالة التفعيل
        </p>
      </div>
    </div>
  )
}
