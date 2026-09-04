import { notFound } from 'next/navigation'

import InvitationFlipbook from '@/app/_components/invitation-flipbook'
import type { Guest } from '@/lib/guest'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

type InvitePageProps = {
  params: Promise<{ invite: string }>
}

const InvitePage = async ({ params }: InvitePageProps) => {
  const { invite } = await params
  const record = await prisma.guest.findUnique({ where: { slug: decodeURIComponent(invite) } })

  if (!record) notFound()

  const guest: Guest = {
    id: record.guestId,
    name: record.name,
    honorific: record.honorific ?? undefined,
    title: record.title ?? undefined,
    unit: record.unit ?? undefined,
    department: record.department ?? undefined,
    partner: record.partner ?? undefined,
    category: record.category ?? undefined,
  }

  return <InvitationFlipbook guest={guest} />
}

export default InvitePage
