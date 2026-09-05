import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import InvitationFlipbook from '@/app/_components/invitation-flipbook'
import type { Guest } from '@/lib/guest'
import { prisma } from '@/lib/prisma'
import { EVENT_NAME, inviteDescription } from '@/lib/site'

export const dynamic = 'force-dynamic'

type InvitePageProps = {
  params: Promise<{ invite: string }>
}

const findGuest = (slug: string) =>
  prisma.guest.findUnique({ where: { slug: decodeURIComponent(slug) } }).catch(() => null)

const guestLine = (g: { honorific: string | null; name: string }) =>
  [g.honorific, g.name].filter(Boolean).join(' ')

export async function generateMetadata({ params }: InvitePageProps): Promise<Metadata> {
  const { invite } = await params
  const g = await findGuest(invite)
  if (!g) return { title: 'Không tìm thấy thiệp mời', robots: { index: false, follow: false } }

  const who = [g.honorific, g.name].filter(Boolean).join(' ')
  const title = `Thiệp mời · ${who}`
  const description = inviteDescription(guestLine(g))

  return {
    title,
    description,
    alternates: { canonical: `/${invite}` },
    openGraph: {
      type: 'website',
      title: `${title} · ${EVENT_NAME}`,
      description,
      url: `/${invite}`,
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: false, follow: false, nocache: true },
  }
}

const InvitePage = async ({ params }: InvitePageProps) => {
  const { invite } = await params
  const record = await findGuest(invite)

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
