/** Thông tin dùng cho SEO / thẻ chia sẻ (Open Graph) của thiệp mời. */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://bateco-birthday.vercel.app')
).replace(/\/$/, '')

export const ORG_NAME = 'Tập đoàn Bateco'
export const EVENT_NAME = 'Lễ kỷ niệm 14 năm thành lập Tập đoàn Bateco'
export const EVENT_WHEN = '11:30 · Thứ Bảy, 19/09/2026'
export const EVENT_VENUE = 'Sheraton Hanoi West, Hà Nội'

/** Câu mô tả chung, chèn tên khách nếu có. */
export const inviteDescription = (guestLine?: string) =>
  `Trân trọng kính mời ${guestLine ?? 'Quý vị'} tới dự ${EVENT_NAME}. ${EVENT_WHEN} tại ${EVENT_VENUE}.`
