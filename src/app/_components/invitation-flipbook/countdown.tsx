'use client'

import { CheckCircleIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useGuest } from '@/app/_components/invitation-flipbook/guest-context'
import { formatDeadline, getRemaining, isRsvpClosed, type Remaining } from '@/lib/event'

const UNITS: { key: keyof Remaining; label: string }[] = [
  { key: 'days', label: 'Ngày' },
  { key: 'hours', label: 'Giờ' },
  { key: 'minutes', label: 'Phút' },
  { key: 'seconds', label: 'Giây' },
]

const pad = (value: number) => String(value).padStart(2, '0')

const storageKey = (id: string) => `rsvp:${id}`

const Countdown = () => {
  const guest = useGuest()
  const id = guest?.id ?? ''

  const [remaining, setRemaining] = useState<Remaining | null>(null)
  const [confirmed, setConfirmed] = useState<number | null>(() => {
    if (typeof window === 'undefined' || !id) return null
    try {
      const stored = window.localStorage.getItem(storageKey(id))
      return stored ? Number(stored) : null
    } catch {
      return null
    }
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const tick = () => setRemaining(getRemaining())
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  const submit = async (partySize: number) => {
    if (!guest || saving) return
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: guest.name,
          honorific: guest.honorific,
          title: guest.title,
          partySize,
        }),
      })
      const result = (await response.json()) as { ok: boolean; error?: string }
      if (!result.ok) throw new Error(result.error ?? 'Lỗi.')
      setConfirmed(partySize)
      try {
        window.localStorage.setItem(storageKey(id), String(partySize))
        toast.success('Xác nhận thành công.')
      } catch {
        toast.error('Không ghi nhận được xác nhận.')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không gửi được xác nhận.')
    } finally {
      setSaving(false)
    }
  }

  // Chưa mount xong (SSR) thì không render để tránh lệch hydration.
  if (!remaining) return null

  const rsvpClosed = isRsvpClosed()

  return (
    <div className='absolute-y-center right-[9rem] z-20 flex flex-col gap-3 text-[#bb934f] select-none xsm:hidden'>
      <div className='flex flex-col gap-2'>
        {UNITS.map(({ key, label }) => (
          <div
            key={key}
            className='flex items-center px-3 py-2 shadow-[0_0.4rem_1.2rem_rgba(72,44,12,0.14)]'
          >
            <span
              className='font-noto-serif text-[3.5rem] leading-none font-bold tabular-nums'
              style={{ color: 'transparent', WebkitTextStroke: '2px #bb934f' }}
            >
              {key === 'days' ? remaining.days : pad(remaining[key] as number)}
            </span>
            <span className='font-lora mt-1 ml-4 text-[0.75rem] tracking-[0.15em] uppercase'>
              {label}
            </span>
          </div>
        ))}
      </div>

      {guest && (
        <div className='flex max-w-[16rem] flex-col gap-1'>
          <button
            type='button'
            disabled={saving || rsvpClosed}
            onClick={() => void submit(1)}
            className={`rounded-lg px-4 py-2 text-left text-[0.75rem] text-white transition-colors duration-300 ease-out hover:cursor-pointer disabled:opacity-60 disabled:hover:cursor-not-allowed flex items-center gap-2 ${
              confirmed === 1
                ? 'bg-[#8a6a2f] ring-2 ring-[#bb934f]'
                : 'bg-[#bb934f] hover:bg-[#bb934f]/80'
            }`}
          >
            {confirmed === 1 ? <CheckCircleIcon className='w-4 h-4' /> : ''}Xác nhận bản thân tham
            gia
          </button>

          {guest.partner && (
            <button
              type='button'
              disabled={saving || rsvpClosed}
              onClick={() => void submit(2)}
              className={`rounded-lg px-4 py-2 text-left text-[0.75rem] text-white transition-colors duration-300 ease-out hover:cursor-pointer disabled:opacity-60 disabled:hover:cursor-not-allowed flex items-center mt-1 gap-2 ${
                confirmed === 2
                  ? 'bg-[#6b0106] ring-2 ring-[#9d0208]'
                  : 'bg-[#9d0208] hover:bg-[#9d0208]/80'
              }`}
            >
              {confirmed === 2 ? <CheckCircleIcon className='w-4 h-4' /> : ''}Xác nhận tham gia cùng{' '}
              {guest.partner.toLowerCase()}
            </button>
          )}

          <p className='font-lora mt-1 text-[0.7rem] leading-snug text-[#bb934f]'>
            {rsvpClosed ? (
              <span className='text-[#9d0208]'>
                Đã hết hạn xác nhận ({formatDeadline()}). Vui lòng liên hệ Ban tổ chức.
              </span>
            ) : (
              <>Hạn xác nhận: {formatDeadline()}</>
            )}
          </p>
          {error && <p className='font-lora text-[0.7rem] text-[#9d0208]'>{error}</p>}
        </div>
      )}
    </div>
  )
}

export default Countdown
