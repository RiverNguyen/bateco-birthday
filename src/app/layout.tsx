import type { Metadata } from 'next'
import { Lora, Pinyon_Script, Style_Script } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import { LenisProvider } from '@/components/providers/lenis-provider'
import { QueryProvider } from '@/components/providers/query-provider'
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
export const metadata: Metadata = {
  title: 'Next.js 16 Template Docs',
  description: 'Source overview and how this Next.js 16 template works.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body
        className={`${lora.variable} ${pinyonScript.variable} ${styleScript.variable} font-sans antialiased`}
      >
        <QueryProvider>
          <NuqsAdapter>
            <LenisProvider>{children}</LenisProvider>
          </NuqsAdapter>
        </QueryProvider>
      </body>
    </html>
  )
}
