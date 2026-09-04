import { NextResponse } from 'next/server'

import { formatDeadline, isRsvpClosed } from '@/lib/event'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RsvpBody = {
  id?: string
  name?: string
  honorific?: string
  title?: string
  partySize?: number
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as RsvpBody
    const guestId = (body.id ?? '').trim()
    const name = (body.name ?? '').trim()
    const partySize = Number(body.partySize)

    if (!guestId || !name) {
      return NextResponse.json({ ok: false, error: 'Thiếu thông tin khách.' }, { status: 400 })
    }
    if (partySize !== 1 && partySize !== 2) {
      return NextResponse.json({ ok: false, error: 'Số người phải là 1 hoặc 2.' }, { status: 400 })
    }
    if (isRsvpClosed()) {
      return NextResponse.json(
        { ok: false, error: `Đã hết hạn xác nhận (${formatDeadline()}).` },
        { status: 403 },
      )
    }

    const data = {
      name,
      honorific: body.honorific?.trim() || null,
      title: body.title?.trim() || null,
      partySize,
      withPartner: partySize === 2,
    }

    const rsvp = await prisma.rsvp.upsert({
      where: { guestId },
      create: { guestId, ...data },
      update: data,
    })

    return NextResponse.json({ ok: true, rsvp })
  } catch (error) {
    console.error('[rsvp] POST failed:', error)
    return NextResponse.json({ ok: false, error: 'Không lưu được xác nhận.' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const rsvps = await prisma.rsvp.findMany({ orderBy: { createdAt: 'asc' } })
    const totalGuests = rsvps.reduce((sum, rsvp) => sum + rsvp.partySize, 0)
    return NextResponse.json({ ok: true, count: rsvps.length, totalGuests, rsvps })
  } catch (error) {
    console.error('[rsvp] GET failed:', error)
    return NextResponse.json({ ok: false, error: 'Không đọc được danh sách.' }, { status: 500 })
  }
}
