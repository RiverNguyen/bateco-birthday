import bundleAnalyzer from '@next/bundle-analyzer'
import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
    deviceSizes: [430, 768, 1080, 1280, 1600, 1920],
  },
  reactStrictMode: false,
  output: 'standalone',
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    viewTransition: true,
    webVitalsAttribution: ['CLS', 'LCP'],
    // cssChunking: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

// ANALYZE=true pnpm build

export default withBundleAnalyzer(withNextIntl(nextConfig))
