import { ImageResponse } from 'next/og'

import { OG_SIZE, OgCard, getOgFonts } from '@/lib/og'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const alt = 'Thiệp mời · Lễ kỷ niệm 14 năm thành lập Tập đoàn Bateco'
export const size = OG_SIZE
export const contentType = 'image/png'

type Params = { params: Promise<{ invite: string }> }

export default async function OgImage({ params }: Params) {
  const { invite } = await params
  const guest = await prisma.guest
    .findUnique({ where: { slug: decodeURIComponent(invite) } })
    .catch(() => null)

  const who = guest
    ? [guest.honorific, guest.name].filter(Boolean).join(' ')
    : 'Trân trọng kính mời'

  return new ImageResponse(
    (
      <OgCard
        who={who}
        title={guest?.title ?? undefined}
        partner={guest?.partner ? `cùng ${guest.partner}` : undefined}
        big={Boolean(guest)}
      />
    ),
    { ...size, fonts: await getOgFonts() },
  )
}
