import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ABC Pharma | منصة التعليم الصيدلي',
  description: 'منصة ABC Pharma التعليمية - كورسات صيدلة متكاملة مع محاضرات مسجلة وملفات PDF ومتابعة التقدم',
  keywords: 'صيدلة, كورسات صيدلة, تعليم صيدلي, ABC Pharma, محاضرات صيدلة',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
