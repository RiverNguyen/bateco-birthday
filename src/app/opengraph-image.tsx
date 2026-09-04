import { ImageResponse } from 'next/og'

import { OG_SIZE, OgCard, getOgAssets, getOgFonts } from '@/lib/og'

export const runtime = 'nodejs'
export const alt = 'Thiệp mời · Lễ kỷ niệm 14 năm thành lập Tập đoàn Bateco'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function OgImage() {
  const [assets, fonts] = await Promise.all([getOgAssets(), getOgFonts()])

  return new ImageResponse(
    <OgCard
      who='Trân trọng kính mời'
      big={false}
      assets={assets}
    />,
    { ...size, fonts },
  )
}
