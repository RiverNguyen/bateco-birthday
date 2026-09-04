import type { Metadata } from 'next'
import { Lora, Noto_Serif, Pinyon_Script, Style_Script } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from 'sonner'

import { LenisProvider } from '@/components/providers/lenis-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { EVENT_NAME, ORG_NAME, SITE_URL, inviteDescription } from '@/lib/site'

import '@/styles/globals.css'

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
})

const pinyonScript = Pinyon_Script({
  variable: '--font-pinyon-script',
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['400'],
})
const styleScript = Style_Script({
  variable: '--font-style-script-face',
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['400'],
})
const notoSerif = Noto_Serif({
  variable: '--font-noto-serif',
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

const description = inviteDescription()

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Thiệp mời · ${EVENT_NAME}`,
    template: `%s · ${ORG_NAME}`,
  },
  description,
  applicationName: 'Thiệp mời Bateco',
  keywords: ['Bateco', 'thiệp mời', 'lễ kỷ niệm 14 năm', 'Tập đoàn Bateco'],
  authors: [{ name: ORG_NAME }],
  // Trang thiệp mời riêng tư (URL chứa tên khách) — không cho công cụ tìm kiếm lập chỉ mục.
  robots: { index: false, follow: false, nocache: true },
  openGraph: {
    type: 'website',
    siteName: ORG_NAME,
    locale: 'vi_VN',
    url: SITE_URL,
    title: `Thiệp mời · ${EVENT_NAME}`,
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Thiệp mời · ${EVENT_NAME}`,
    description,
  },
  formatDetection: { telephone: false, email: false, address: false },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='vi'>
      <body
        className={`${lora.variable} ${pinyonScript.variable} ${styleScript.variable} ${notoSerif.variable} font-sans antialiased`}
      >
        <QueryProvider>
          <NuqsAdapter>
            <LenisProvider>{children}</LenisProvider>
            <Toaster richColors />
          </NuqsAdapter>
        </QueryProvider>
      </body>
    </html>
  )
}
