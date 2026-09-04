import { NextResponse } from 'next/server'

import type { Guest } from '@/lib/guest'
import { mergeGuestList, replaceGuestList } from '@/lib/guest-store'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type SaveBody = {
  origin?: string
  guests?: Guest[]
  /** true = xoá danh sách cũ rồi nạp lại; mặc định chỉ thêm người mới. */
  replace?: boolean
}

/** Nạp danh sách khách vào DB — mặc định chỉ thêm người mới, `replace` để ghi đè. */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as SaveBody
    const guests = Array.isArray(body.guests) ? body.guests : []
    if (guests.length === 0) {
      return NextResponse.json({ ok: false, error: 'Danh sách rỗng.' }, { status: 400 })
    }
    if (body.replace) {
      const saved = await replaceGuestList(guests, body.origin ?? '')
      return NextResponse.json({ ok: true, replaced: true, saved, added: saved })
    }
    const added = await mergeGuestList(guests, body.origin ?? '')
    return NextResponse.json({ ok: true, replaced: false, added })
  } catch (error) {
    console.error('[guests] POST failed:', error)
    return NextResponse.json({ ok: false, error: 'Không lưu được danh sách.' }, { status: 500 })
  }
}

/** Danh sách khách + trạng thái xác nhận, cho trang admin. */
export async function GET() {
  try {
    const [guests, rsvps] = await Promise.all([
      prisma.guest.findMany({ orderBy: [{ category: 'asc' }, { stt: 'asc' }] }),
      prisma.rsvp.findMany(),
    ])
    const rsvpById = new Map(rsvps.map((rsvp) => [rsvp.guestId, rsvp]))

    const list = guests.map((guest) => {
      const rsvp = rsvpById.get(guest.guestId)
      return {
        ...guest,
        partySize: rsvp?.partySize ?? null,
        confirmedAt: rsvp?.createdAt ?? null,
      }
    })
    const confirmedCount = list.filter((row) => row.partySize !== null).length
    const totalGuests = list.reduce((sum, row) => sum + (row.partySize ?? 0), 0)

    return NextResponse.json({
      ok: true,
      count: list.length,
      confirmedCount,
      totalGuests,
      guests: list,
    })
  } catch (error) {
    console.error('[guests] GET failed:', error)
    return NextResponse.json({ ok: false, error: 'Không đọc được danh sách.' }, { status: 500 })
  }
}
