/**
 * Per-guest invitation data.
 *
 * `guestId` = mã băm nội bộ (tên + chức danh + đơn vị + bộ phận + tab), dùng làm
 * khoá chính và để nối với xác nhận tham dự.
 * `slug` = đường dẫn thiệp dạng `BTCGroup_Thiepmoi14AE_TenNguoiNhan` (xem
 * `uniqueInviteSlug`), trang `src/app/[invite]/page.tsx` tra khách theo slug này.
 */

export type Guest = {
  /** `guestId` trong DB — có khi thiệp được mở từ một khách đã lưu. */
  id?: string
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
  /** Tên tab trong file Excel: "Nội bộ" / "Khách" … */
  category?: string
}

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
  const seed = [guest.category, guest.name, guest.title, guest.unit, guest.department]
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

/** Phần đầu cố định của mọi đường dẫn thiệp. */
export const INVITE_PREFIX = 'BTCGroup_Thiepmoi14AE'

/** "Phạm Anh Tuấn" -> "PhamAnhTuan" (bỏ dấu, viết liền CamelCase). */
const camelName = (name: string): string =>
  slugify(name)
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

/** Slug cơ bản chưa xét trùng: `BTCGroup_Thiepmoi14AE_PhamAnhTuan`. */
export const baseInviteSlug = (name: string): string =>
  `${INVITE_PREFIX}_${camelName(name) || 'Khach'}`

/**
 * Slug duy nhất cho một khách. `taken` là tập slug đã dùng — hàm tự thêm `_2`,
 * `_3`… khi trùng và ghi slug vừa cấp vào `taken`.
 */
export const uniqueInviteSlug = (name: string, taken: Set<string>): string => {
  const base = baseInviteSlug(name)
  let slug = base
  let n = 2
  while (taken.has(slug)) {
    slug = `${base}_${n}`
    n += 1
  }
  taken.add(slug)
  return slug
}

/** Đường dẫn thiệp đầy đủ từ slug. */
export const inviteUrl = (slug: string, origin = ''): string => `${origin}/${slug}`
