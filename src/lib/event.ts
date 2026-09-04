/**
 * Ngày giờ diễn ra lễ kỷ niệm (giờ Việt Nam, UTC+7).
 *
 * Lưu ý: Page 2 đang hiển thị ngày/giờ này bằng các dòng chữ riêng — nếu đổi ở
 * đây thì sửa luôn `src/app/_components/page-2/index.tsx` cho khớp.
 */
export const EVENT_DATE = new Date('2026-09-19T11:30:00+07:00')

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
