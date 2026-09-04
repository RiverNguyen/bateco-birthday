import { NextResponse } from 'next/server'

import { inviteUrl, uniqueInviteSlug } from '@/lib/guest'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type PatchBody = {
  origin?: string
  category?: string
  honorific?: string
  name?: string
  title?: string
  unit?: string
  department?: string
  partner?: string
}

const clean = (value: string | undefined) => value?.trim() || null

type RouteContext = { params: Promise<{ id: string }> }

/** Sửa thông tin một khách (guestId giữ nguyên, link cập nhật theo tên mới). */
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const body = (await request.json().catch(() => ({}))) as PatchBody

    const current = await prisma.guest.findUnique({ where: { guestId: id } })
    if (!current) {
      return NextResponse.json({ ok: false, error: 'Không tìm thấy khách.' }, { status: 404 })
    }

    const name = clean(body.name) ?? current.name
    const category = body.category === undefined ? current.category : clean(body.category)
    const origin = (body.origin ?? '').replace(/\/$/, '')

    // Đổi tab → dồn STT xuống cuối tab mới.
    let stt = current.stt
    if (category !== current.category) {
      const max = await prisma.guest.aggregate({
        where: { category },
        _max: { stt: true },
      })
      stt = (max._max.stt ?? 0) + 1
    }

    // Đổi tên → cấp slug mới (không đụng slug người khác); giữ nguyên nếu tên không đổi.
    let slug = current.slug
    if (name !== current.name || !slug) {
      const others = await prisma.guest.findMany({
        where: { NOT: { guestId: id } },
        select: { slug: true },
      })
      const taken = new Set(others.map((o) => o.slug).filter((s): s is string => Boolean(s)))
      slug = uniqueInviteSlug(name, taken)
    }

    const updated = await prisma.guest.update({
      where: { guestId: id },
      data: {
        category,
        stt,
        slug,
        name,
        honorific: body.honorific === undefined ? current.honorific : clean(body.honorific),
        title: body.title === undefined ? current.title : clean(body.title),
        unit: body.unit === undefined ? current.unit : clean(body.unit),
        department: body.department === undefined ? current.department : clean(body.department),
        partner: body.partner === undefined ? current.partner : clean(body.partner),
        link: inviteUrl(slug, origin),
      },
    })

    return NextResponse.json({ ok: true, guest: updated })
  } catch (error) {
    console.error('[guests/:id] PATCH failed:', error)
    return NextResponse.json({ ok: false, error: 'Không sửa được khách.' }, { status: 500 })
  }
}

/** Xoá một khách và xác nhận tham dự của họ. */
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    await prisma.$transaction([
      prisma.rsvp.deleteMany({ where: { guestId: id } }),
      prisma.guest.deleteMany({ where: { guestId: id } }),
    ])
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[guests/:id] DELETE failed:', error)
    return NextResponse.json({ ok: false, error: 'Không xoá được khách.' }, { status: 500 })
  }
}
