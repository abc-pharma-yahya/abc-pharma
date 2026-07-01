'use client'

import { useState } from 'react'

export default function WhatsAppWidget() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start">
      {open && (
        <div className="mb-3 bg-white rounded-2xl shadow-2xl p-4 w-72 border border-slate-100">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
              <i className="fa-brands fa-whatsapp text-white text-xl"></i>
            </div>
            <div>
              <div className="font-heading font-bold text-navy text-sm">ABC Pharma</div>
              <div className="text-xs text-green-500">متصل الآن</div>
            </div>
          </div>
          <p className="text-slate-600 text-sm mb-3">
            مرحباً! كيف يمكننا مساعدتك؟ تواصل معنا عبر واتساب
          </p>
          <a
            href="https://wa.me/201019755523"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#1fae4f] text-white font-semibold py-2 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <i className="fa-brands fa-whatsapp"></i>
            بدء المحادثة
          </a>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1fae4f] shadow-2xl flex items-center justify-center text-white transition-all hover:scale-110"
        aria-label="WhatsApp"
      >
        <i className={`fa-brands fa-whatsapp text-2xl ${open ? 'rotate-90' : ''} transition-transform`}></i>
      </button>
    </div>
  )
}
