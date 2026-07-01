'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Lecture {
  id: string
  title: string
  description: string
  video_url: string
  pdf_url: string
  duration: number
  sort_order: number
  is_completed: boolean
}

interface Bundle {
  id: string
  title: string
}

/**
 * Extract YouTube video ID from various URL formats.
 */
function getYouTubeId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export default function StudentLecture() {
  const params = useParams()
  const router = useRouter()
  const bundleId = params.bundleId as string
  const lectureId = params.lectureId as string

  const [user, setUser] = useState<any>(null)
  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [current, setCurrent] = useState<Lecture | null>(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push('/login')
          return
        }
        setUser(data.user)
        setAuthChecked(true)
      })
      .catch(() => router.push('/login'))
  }, [router])

  useEffect(() => {
    if (!authChecked) return
    Promise.all([
      fetch(`/api/bundles/${bundleId}`).then((r) => r.json()),
      fetch(`/api/progress?bundle_id=${bundleId}`).then((r) => r.json()),
    ])
      .then(([bundleData, progressData]) => {
        if (bundleData.bundle) setBundle(bundleData.bundle)
        const allLectures: Lecture[] = bundleData.lectures || []
        const progressMap: Record<string, { is_completed: boolean; percent_watched: number }> =
          progressData.progress || {}
        const merged = allLectures.map((l) => ({
          ...l,
          is_completed: progressMap[l.id]?.is_completed || false,
        }))
        setLectures(merged)
        const found = merged.find((l) => l.id === lectureId) || null
        setCurrent(found)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [authChecked, bundleId, lectureId])

  /**
   * Full content protection: right-click, devtools, shortcuts, print, selection.
   */
  useEffect(() => {
    if (!current) return

    // Block context menu (right-click)
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      logSuspicious('SUSPICIOUS_RIGHT_CLICK', 'lecture/' + current.id)
    }

    // Block keyboard shortcuts: Ctrl+Shift+S/I/J/C, Ctrl+P, Ctrl+U, F12
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey

      // F12
      if (key === 'f12') {
        e.preventDefault()
        logSuspicious('SUSPICIOUS_DEVTOOLS_F12', 'lecture/' + current.id)
        return
      }
      // Ctrl+Shift+S/I/J/C
      if (ctrl && shift && ['s', 'i', 'j', 'c'].includes(key)) {
        e.preventDefault()
        logSuspicious(`SUSPICIOUS_DEVTOOLS_${key.toUpperCase()}`, 'lecture/' + current.id)
        return
      }
      // Ctrl+P (print)
      if (ctrl && key === 'p') {
        e.preventDefault()
        logSuspicious('SUSPICIOUS_PRINT', 'lecture/' + current.id)
        return
      }
      // Ctrl+U (view source)
      if (ctrl && key === 'u') {
        e.preventDefault()
        logSuspicious('SUSPICIOUS_VIEW_SOURCE', 'lecture/' + current.id)
        return
      }
    }

    // Block print via beforeprint
    const onBeforePrint = (e: Event) => {
      e.preventDefault()
      logSuspicious('SUSPICIOUS_PRINT_EVENT', 'lecture/' + current.id)
    }

    // DevTools detection: window size delta
    let devtoolsOpen = false
    const threshold = 160
    const checkDevtools = () => {
      const widthDiff = window.outerWidth - window.innerWidth
      const heightDiff = window.outerHeight - window.innerHeight
      const isOpen = widthDiff > threshold || heightDiff > threshold
      if (isOpen && !devtoolsOpen) {
        devtoolsOpen = true
        logSuspicious('SUSPICIOUS_DEVTOOLS_OPEN', 'lecture/' + current.id)
      } else if (!isOpen && devtoolsOpen) {
        devtoolsOpen = false
      }
    }
    const devtoolsInterval = setInterval(checkDevtools, 1000)

    // Block dragstart on images
    const onDragStart = (e: DragEvent) => {
      e.preventDefault()
    }

    document.addEventListener('contextmenu', onContextMenu)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('beforeprint', onBeforePrint)
    document.addEventListener('dragstart', onDragStart)

    // Apply user-select:none to the container
    if (containerRef.current) {
      containerRef.current.style.userSelect = 'none'
      ;(containerRef.current.style as any).webkitUserSelect = 'none'
      ;(containerRef.current.style as any).mozUserSelect = 'none'
      ;(containerRef.current.style as any).msUserSelect = 'none'
    }

    return () => {
      document.removeEventListener('contextmenu', onContextMenu)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('beforeprint', onBeforePrint)
      document.removeEventListener('dragstart', onDragStart)
      clearInterval(devtoolsInterval)
    }
  }, [current])

  const logSuspicious = async (action: string, resource: string) => {
    try {
      await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, resource, details: `Lecture: ${current?.title || ''}` }),
      })
    } catch (e) {
      // silent fail
    }
  }

  const markCompleted = async (lectureId: string) => {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lecture_id: lectureId,
        is_completed: true,
        percent_watched: 100,
      }),
    })
    setLectures((prev) =>
      prev.map((l) => (l.id === lectureId ? { ...l, is_completed: true } : l))
    )
    if (current?.id === lectureId) {
      setCurrent({ ...current, is_completed: true })
    }
  }

  const goToLecture = (id: string) => {
    router.push(`/student/${bundleId}/${id}`)
  }

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
      </div>
    )
  }

  if (!current) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <i className="fa-solid fa-exclamation-circle text-5xl text-coral"></i>
        <p className="text-xl text-navy">المحاضرة غير موجودة</p>
        <Link href={`/student/${bundleId}`} className="btn-primary">العودة للكورس</Link>
      </div>
    )
  }

  const youtubeId = getYouTubeId(current.video_url)
  const currentIndex = lectures.findIndex((l) => l.id === current.id)
  const nextLecture = lectures[currentIndex + 1]
  const prevLecture = lectures[currentIndex - 1]

  return (
    <main className="min-h-screen bg-bglight">
      {/* Top bar */}
      <div className="bg-navy text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <Link
            href="/student"
            className="text-white/70 hover:text-white text-sm flex items-center gap-2"
          >
            <i className="fa-solid fa-arrow-right"></i>
            كورساتي
          </Link>
          <div className="text-sm">
            <i className="fa-solid fa-shield-halved text-gold ml-2"></i>
            المحتوى محمي ضد النسخ والتسجيل
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main video area */}
          <div className="lg:col-span-3" ref={containerRef}>
            <div className="card overflow-hidden no-select">
              {youtubeId ? (
                <div className="relative aspect-video bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                    title={current.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-navy flex flex-col items-center justify-center text-white">
                  <i className="fa-solid fa-video-slash text-5xl mb-3 opacity-50"></i>
                  <p className="text-white/70">لا يوجد فيديو لهذه المحاضرة</p>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h1 className="font-heading font-extrabold text-2xl text-navy">{current.title}</h1>
                  {current.is_completed && (
                    <span className="flex-shrink-0 bg-teal/10 text-teal text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <i className="fa-solid fa-check"></i>
                      مكتملة
                    </span>
                  )}
                </div>
                {current.description && (
                  <p className="text-slate-600 leading-relaxed mb-4">{current.description}</p>
                )}

                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                  {current.pdf_url && (
                    <a
                      href={current.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline"
                    >
                      <i className="fa-solid fa-file-pdf"></i>
                      فتح PDF في تاب جديد
                    </a>
                  )}
                  {!current.is_completed && (
                    <button onClick={() => markCompleted(current.id)} className="btn-primary">
                      <i className="fa-solid fa-check-circle"></i>
                      تحديد كمكتملة
                    </button>
                  )}
                  {nextLecture && (
                    <button
                      onClick={() => goToLecture(nextLecture.id)}
                      className="btn-coral mr-auto"
                    >
                      المحاضرة التالية
                      <i className="fa-solid fa-arrow-left"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-4">
              {prevLecture ? (
                <button onClick={() => goToLecture(prevLecture.id)} className="btn-outline">
                  <i className="fa-solid fa-arrow-right"></i>
                  السابقة
                </button>
              ) : (
                <div></div>
              )}
              <span className="text-slate-500 text-sm">
                محاضرة {currentIndex + 1} من {lectures.length}
              </span>
              {nextLecture ? (
                <button onClick={() => goToLecture(nextLecture.id)} className="btn-outline">
                  التالية
                  <i className="fa-solid fa-arrow-left"></i>
                </button>
              ) : (
                <div></div>
              )}
            </div>
          </div>

          {/* Sidebar: lectures list */}
          <aside className="lg:col-span-1">
            <div className="card sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-heading font-bold text-navy">
                  {bundle?.title || 'محاضرات الكورس'}
                </h3>
                <p className="text-slate-500 text-xs mt-1">{lectures.length} محاضرة</p>
              </div>
              <div className="p-2">
                {lectures.map((l, i) => (
                  <button
                    key={l.id}
                    onClick={() => goToLecture(l.id)}
                    className={`w-full text-right p-3 rounded-xl transition-colors flex items-start gap-3 ${
                      l.id === current.id
                        ? 'bg-teal/10 text-teal'
                        : 'hover:bg-slate-50 text-navy'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        l.is_completed
                          ? 'bg-teal text-white'
                          : l.id === current.id
                          ? 'bg-teal text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {l.is_completed ? (
                        <i className="fa-solid fa-check text-xs"></i>
                      ) : (
                        <span className="text-xs font-bold">{i + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm line-clamp-2">{l.title}</div>
                      {l.duration > 0 && (
                        <div className="text-xs text-slate-400 mt-1">
                          <i className="fa-regular fa-clock ml-1"></i>
                          {Math.floor(l.duration / 60)}:{(l.duration % 60).toString().padStart(2, '0')}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
