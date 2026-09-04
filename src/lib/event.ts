/**
 * Ngày giờ diễn ra lễ kỷ niệm (giờ Việt Nam, UTC+7).
 *
 * Lưu ý: Page 2 đang hiển thị ngày/giờ này bằng các dòng chữ riêng — nếu đổi ở
 * đây thì sửa luôn `src/app/_components/page-2/index.tsx` cho khớp.
 */
export const EVENT_DATE = new Date('2026-09-19T11:30:00+07:00')

/** Hạn chót khách xác nhận tham dự (giờ Việt Nam). */
export const RSVP_DEADLINE = new Date('2026-09-15T23:59:00+07:00')

/** "23:59 ngày 15/09/2026" theo giờ Việt Nam. */
export const formatDeadline = (date: Date = RSVP_DEADLINE): string => {
  const parts = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false,
  }).formatToParts(date)
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  return `${get('hour')}:${get('minute')} ngày ${get('day')}/${get('month')}/${get('year')}`
}

/** Đã quá hạn xác nhận chưa? */
export const isRsvpClosed = (from: number = Date.now()): boolean => from > RSVP_DEADLINE.getTime()

export type Remaining = {
  total: number
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

/** Thời gian còn lại từ `from` (mặc định: bây giờ) đến giờ sự kiện. */
export const getRemaining = (from: number = Date.now()): Remaining => {
  const total = Math.max(0, EVENT_DATE.getTime() - from)
  const seconds = Math.floor(total / 1000)
  return {
    total,
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    done: total === 0,
  }
}
