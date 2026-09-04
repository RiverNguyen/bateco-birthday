import { notFound } from 'next/navigation'

import InvitationFlipbook from '@/app/_components/invitation-flipbook'
import { idFromSlug } from '@/lib/guest'
import { getGuestMap } from '@/lib/guest-source'

type InvitePageProps = {
  params: Promise<{ invite: string }>
}

const InvitePage = async ({ params }: InvitePageProps) => {
  const { invite } = await params
  const guestMap = await getGuestMap()
  const guest = guestMap[idFromSlug(invite)]

  if (!guest) notFound()

  return <InvitationFlipbook guest={guest} />
}

export default InvitePage
