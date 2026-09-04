import { ImageResponse } from 'next/og'

import { OG_SIZE, OgCard, getOgFonts } from '@/lib/og'

export const runtime = 'nodejs'
export const alt = 'Thiệp mời · Lễ kỷ niệm 14 năm thành lập Tập đoàn Bateco'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function OgImage() {
  return new ImageResponse(
    <OgCard
      who='Trân trọng kính mời'
      big={false}
    />,
    { ...size, fonts: await getOgFonts() },
  )
}
