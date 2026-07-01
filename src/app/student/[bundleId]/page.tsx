import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'
import Link from 'next/link'

export default async function StudentBundlePage({
  params,
}: {
  params: Promise<{ bundleId: string }>
}) {
  const { bundleId } = await params
  const user = await getSessionUser()

  if (!user) {
    redirect('/login')
  }

  // Verify purchase
  const { data: purchase } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('bundle_id', bundleId)
    .eq('status', 'COMPLETED')
    .single()

  if (!purchase) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <i className="fa-solid fa-lock text-5xl text-coral"></i>
        <h1 className="font-heading font-extrabold text-2xl text-navy">غير مشترك</h1>
        <p className="text-slate-600 text-center">يجب الاشتراك في هذا الكورس أولاً للوصول إلى المحاضرات</p>
        <Link href={`/bundle/${bundleId}`} className="btn-primary">
          <i className="fa-solid fa-credit-card"></i>
          اشترك الآن
        </Link>
      </main>
    )
  }

  // Get bundle + lectures
  const { data: bundle } = await supabase
    .from('bundles')
    .select('id, title')
    .eq('id', bundleId)
    .single()

  const { data: lectures } = await supabase
    .from('lectures')
    .select('id, title, sort_order')
    .eq('bundle_id', bundleId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (!lectures || lectures.length === 0) {
    return (
      <main className="min-h-screen bg-bglight">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link href="/student" className="text-teal hover:text-navy text-sm mb-4 inline-flex items-center gap-2">
            <i className="fa-solid fa-arrow-right"></i>
            كورساتي
          </Link>
          <div className="card p-12 text-center">
            <i className="fa-solid fa-folder-open text-5xl text-slate-300 mb-4"></i>
            <h1 className="font-heading font-bold text-xl text-navy mb-2">{bundle?.title || 'الكورس'}</h1>
            <p className="text-slate-500">سيتم إضافة المحاضرات قريباً</p>
          </div>
        </div>
      </main>
    )
  }

  // Redirect to first lecture
  redirect(`/student/${bundleId}/${lectures[0].id}`)
}
