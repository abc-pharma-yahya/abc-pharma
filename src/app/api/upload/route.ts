import { NextRequest, NextResponse } from 'next/server'
import { supabase, BUCKETS } from '@/lib/supabase'
import { getSessionUser, logAudit } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const bucket = (formData.get('bucket') as string) || BUCKETS.LECTURES
    const path = formData.get('path') as string

    if (!file || !path) {
      return NextResponse.json({ error: 'ملف ومسار مطلوبان' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, bytes, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })

    if (error) {
      console.error('upload error', error)
      return NextResponse.json({ error: 'فشل رفع الملف: ' + error.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
    const url = urlData.publicUrl

    await logAudit({
      user_id: user.id,
      action: 'UPLOAD_FILE',
      resource: `${bucket}/${path}`,
      ip: req.headers.get('x-forwarded-for'),
      details: `File: ${file.name}, Size: ${file.size}`,
    })

    return NextResponse.json({ url, path })
  } catch (e: any) {
    console.error('upload route error', e)
    return NextResponse.json({ error: 'حدث خطأ أثناء الرفع' }, { status: 500 })
  }
}
