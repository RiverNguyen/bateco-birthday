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

const Countdown = () => {
  const guest = useGuest()
  const id = guest?.id ?? ''

  const [remaining, setRemaining] = useState<Remaining | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [checking, setChecking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const tick = () => setRemaining(getRemaining())
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChecking(true)
    setError('')

    fetch(`/api/rsvp?id=${encodeURIComponent(id)}`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = (await response.json()) as { ok: boolean; confirmed?: boolean }
        if (!response.ok || !result.ok) throw new Error('Không đọc được xác nhận.')
        setConfirmed(Boolean(result.confirmed))
      })
      .catch((err) => {
        if ((err as Error).name !== 'AbortError') {
          setError('Không đọc được xác nhận.')
          toast.error('Không đọc được xác nhận.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setChecking(false)
      })

    return () => controller.abort()
  }, [id])

  const submit = async () => {
    if (!guest || saving) return
    setSaving(true)
    setError('')
    try {
      const response = await fetch(
        confirmed ? `/api/rsvp?id=${encodeURIComponent(id)}` : '/api/rsvp',
        {
          method: confirmed ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: confirmed
            ? undefined
            : JSON.stringify({
              id,
              name: guest.name,
              honorific: guest.honorific,
              title: guest.title,
              partySize: 1,
            }),
        },
      )
      const result = (await response.json()) as { ok: boolean; error?: string; confirmed?: boolean }
      if (!result.ok) throw new Error(result.error ?? 'Lỗi.')
      setConfirmed(Boolean(result.confirmed))
      toast.success(result.confirmed ? 'Xác nhận thành công.' : 'Đã huỷ xác nhận.')
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
            disabled={saving || checking || rsvpClosed}
            onClick={() => void submit()}
            className={`rounded-lg px-4 py-2 text-left text-[0.75rem] text-white transition-colors duration-300 ease-out hover:cursor-pointer disabled:opacity-60 disabled:hover:cursor-not-allowed flex items-center gap-2 ${
              confirmed
                ? 'bg-[#8a6a2f] ring-2 ring-[#bb934f]'
                : 'bg-[#bb934f] hover:bg-[#bb934f]/80'
            }`}
          >
            {confirmed ? <CheckCircleIcon className='w-4 h-4' /> : ''}
            {checking
              ? 'Đang kiểm tra...'
              : confirmed
                ? 'Huỷ xác nhận tham gia'
                : 'Xác nhận tham gia'}
          </button>

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
