/**
 * Per-guest invitation data.
 *
 * Each guest gets a short, stable id derived from their name + title, and the
 * invite link is `/{slug họ tên}-{id}` (e.g. `/pham-anh-tuan-k3x9f2`). The admin
 * page reads the Excel file, builds a `{ id: Guest }` map, and exports it as
 * `guests.json` — drop that file into `src/data/guests.json`, redeploy, and the
 * links work. The invitation page looks the guest up by id.
 *
 * Trade-off vs. encoding everything in the URL: links are short and shareable,
 * but changing the guest list means re-exporting `guests.json` and redeploying.
 */

export type Guest = {
  /** "Ông" / "Bà" — danh xưng */
  honorific?: string
  /** "Phạm Anh Tuấn" — họ và tên */
  name: string
  /** "Chủ tịch HĐQT/Tổng Giám Đốc Tập đoàn" — chức danh */
  title?: string
  /** "Tập đoàn" / "BTC Việt Nam" — đơn vị */
  unit?: string
  /** "Ban lãnh đạo" — bộ phận */
  department?: string
  /** "Phu nhân" / "Phu quân" — người đi cùng, nếu có */
  partner?: string
}

export type GuestMap = Record<string, Guest>

/** Accent-free, lowercase, dash-separated slug of a Vietnamese string. */
export const slugify = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** Deterministic short id (base36) from the guest's identifying fields. */
export const guestId = (guest: Guest): string => {
  const seed = [guest.name, guest.title, guest.unit, guest.department]
    .map((part) => (part ?? '').trim().toLowerCase())
    .join('|')
    .normalize('NFD')

  // FNV-1a 32-bit — small, dependency-free, good enough spread for a guest list.
  let hash = 0x811c9dc5
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(36).padStart(7, '0').slice(0, 7)
}

/** The full path segment for a guest, e.g. `pham-anh-tuan-k3x9f2`. */
export const guestSlug = (guest: Guest): string => {
  const id = guestId(guest)
  const nameSlug = slugify(guest.name)
  return nameSlug ? `${nameSlug}-${id}` : id
}

/** Pulls the trailing id back out of a `/{slug}-{id}` path segment. */
export const idFromSlug = (segment: string): string => {
  const parts = segment.split('-')
  return parts[parts.length - 1] ?? ''
}

/** Root-relative (or absolute, with `origin`) invite link for one guest. */
export const buildInviteLink = (guest: Guest, origin = ''): string =>
  `${origin}/${guestSlug(guest)}`

/** Builds the `{ id: Guest }` map to export as `guests.json`. */
export const buildGuestMap = (guests: Guest[]): GuestMap => {
  const map: GuestMap = {}
  for (const guest of guests) {
    map[guestId(guest)] = guest
  }
  return map
}
