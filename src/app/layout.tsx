import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: 'RKZ AI - نظام مراقبة مواقع البناء',
  description: 'نظام ذكاء اصطناعي لمراقبة مواقع البناء وضمان السلامة',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
