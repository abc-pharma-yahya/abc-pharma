'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminStats from './AdminStats'
import AdminBundles from './AdminBundles'
import AdminLectures from './AdminLectures'
import AdminClaims from './AdminClaims'
import AdminStudents from './AdminStudents'
import AdminAudit from './AdminAudit'

const tabs = [
  { id: 'stats', label: 'الإحصائيات', icon: 'fa-chart-pie' },
  { id: 'bundles', label: 'الكورسات', icon: 'fa-folder' },
  { id: 'lectures', label: 'المحاضرات', icon: 'fa-video' },
  { id: 'claims', label: 'طلبات الاشتراك', icon: 'fa-credit-card' },
  { id: 'students', label: 'الطلاب', icon: 'fa-users' },
  { id: 'audit', label: 'سجل النشاط', icon: 'fa-shield-halved' },
]

export default function AdminLayout() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('stats')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user || data.user.role !== 'SUPERADMIN') {
          router.push('/login')
        } else {
          setUser(data.user)
        }
        setLoading(false)
      })
      .catch(() => {
        router.push('/login')
        setLoading(false)
      })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    )
  }

  if (!user) return null

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-bglight flex flex-col md:flex-row">
      {/* Sidebar - right side in RTL */}
      <aside
        className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-navy text-white p-4 md:min-h-screen md:fixed md:right-0 md:top-0 z-40 overflow-y-auto`}
      >
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-coral flex items-center justify-center">
            <i className="fa-solid fa-pills text-white"></i>
          </div>
          <div>
            <div className="font-heading font-extrabold">ABC Pharma</div>
            <div className="text-xs text-white/60">لوحة التحكم</div>
          </div>
        </div>

        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-right ${
                activeTab === tab.id ? 'bg-teal text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <i className={`fa-solid ${tab.icon} w-5 text-center`}></i>
              <span className="font-semibold">{tab.label}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-coral hover:bg-coral/10 transition-colors text-right mt-8"
        >
          <i className="fa-solid fa-sign-out-alt w-5 text-center"></i>
          <span className="font-semibold">تسجيل الخروج</span>
        </button>
      </aside>

      <div className="flex-1 md:mr-64">
        <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-navy text-2xl"
              aria-label="القائمة"
            >
              <i className="fa-solid fa-bars"></i>
            </button>
            <h1 className="font-heading font-extrabold text-xl text-navy">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h1>
            <div className="text-sm text-slate-600 flex items-center gap-2">
              <i className="fa-solid fa-user-shield text-teal"></i>
              <span>{user.full_name}</span>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          {activeTab === 'stats' && <AdminStats />}
          {activeTab === 'bundles' && <AdminBundles />}
          {activeTab === 'lectures' && <AdminLectures />}
          {activeTab === 'claims' && <AdminClaims />}
          {activeTab === 'students' && <AdminStudents />}
          {activeTab === 'audit' && <AdminAudit />}
        </main>
      </div>
    </div>
  )
}
