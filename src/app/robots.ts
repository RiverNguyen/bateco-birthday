import type { MetadataRoute } from 'next'

/** Microsite thiệp mời riêng tư — không cho bot lập chỉ mục trang nào. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ['facebookexternalhit', 'Facebot'],
        allow: '/',
      },
      {
        userAgent: '*',
        disallow: '/',
      },
    ],
  }
}
