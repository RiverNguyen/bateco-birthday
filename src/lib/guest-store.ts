import { guestId, inviteUrl, uniqueInviteSlug, type Guest } from '@/lib/guest'
import { prisma } from '@/lib/prisma'

/**
 * Ghi đè toàn bộ bảng `Guest` bằng danh sách mới: gộp khách trùng id, đánh STT
 * theo từng tab (category), cấp slug + link thiệp. Dùng khi upload file.
 */
export const replaceGuestList = async (guests: Guest[], origin = ''): Promise<number> => {
  const linkOrigin = origin.replace(/\/$/, '')

  const byId = new Map<string, Guest>()
  for (const guest of guests) {
    if (guest?.name) byId.set(guestId(guest), guest)
  }

  const sttByCategory = new Map<string, number>()
  const takenSlugs = new Set<string>()
  const rows = [...byId.entries()].map(([id, guest]) => {
    const category = guest.category ?? ''
    const stt = (sttByCategory.get(category) ?? 0) + 1
    sttByCategory.set(category, stt)
    const slug = uniqueInviteSlug(guest.name, takenSlugs)
    return {
      guestId: id,
      slug,
      stt,
      category: guest.category ?? null,
      name: guest.name,
      honorific: guest.honorific ?? null,
      title: guest.title ?? null,
      unit: guest.unit ?? null,
      department: guest.department ?? null,
      partner: guest.partner ?? null,
      link: inviteUrl(slug, linkOrigin),
    }
  })

  await prisma.$transaction([prisma.guest.deleteMany(), prisma.guest.createMany({ data: rows })])

  return rows.length
}

/**
 * Chỉ thêm khách MỚI (id chưa có trong DB), giữ nguyên khách cũ + xác nhận của họ.
 * STT của người mới nối tiếp theo từng tab. Trả về số khách được thêm.
 */
export const mergeGuestList = async (guests: Guest[], origin = ''): Promise<number> => {
  const linkOrigin = origin.replace(/\/$/, '')

  const byId = new Map<string, Guest>()
  for (const guest of guests) {
    if (guest?.name) byId.set(guestId(guest), guest)
  }

  const existing = await prisma.guest.findMany({
    select: { guestId: true, category: true, stt: true, slug: true },
  })
  const known = new Set(existing.map((row) => row.guestId))
  const takenSlugs = new Set(existing.map((row) => row.slug).filter((s): s is string => Boolean(s)))
  const maxStt = new Map<string, number>()
  for (const row of existing) {
    const key = row.category ?? ''
    maxStt.set(key, Math.max(maxStt.get(key) ?? 0, row.stt))
  }

  const data = [...byId.entries()]
    .filter(([id]) => !known.has(id))
    .map(([id, guest]) => {
      const key = guest.category ?? ''
      const stt = (maxStt.get(key) ?? 0) + 1
      maxStt.set(key, stt)
      const slug = uniqueInviteSlug(guest.name, takenSlugs)
      return {
        guestId: id,
        slug,
        stt,
        category: guest.category ?? null,
        name: guest.name,
        honorific: guest.honorific ?? null,
        title: guest.title ?? null,
        unit: guest.unit ?? null,
        department: guest.department ?? null,
        partner: guest.partner ?? null,
        link: inviteUrl(slug, linkOrigin),
      }
    })

  if (data.length > 0) await prisma.guest.createMany({ data })
  return data.length
}
