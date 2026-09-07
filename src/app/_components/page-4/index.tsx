'use client'

import { CheckCircleIcon } from 'lucide-react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  FLIP_STATE,
  useIsActivePage,
  useRevealOnce,
} from '@/app/_components/invitation-flipbook/active-page-context'
import { useGuest } from '@/app/_components/invitation-flipbook/guest-context'
import { fadeIn, fadeUp, scaleIn, staggerContainer } from '@/lib/animations'
import { formatDeadline, getRemaining, isRsvpClosed, type Remaining } from '@/lib/event'

const UNITS: { key: keyof Remaining; label: string }[] = [
  { key: 'days', label: 'Ngày' },
  { key: 'hours', label: 'Giờ' },
  { key: 'minutes', label: 'Phút' },
  { key: 'seconds', label: 'Giây' },
]

const pad = (value: number) => String(value).padStart(2, '0')

const Page4 = () => {
  const guest = useGuest()
  const id = guest?.id ?? ''

  const isActive = useIsActivePage(FLIP_STATE.mobileRsvp)
  const revealed = useRevealOnce(isActive)
  const animateState = revealed ? 'show' : 'hidden'

  const [remaining, setRemaining] = useState<Remaining | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [checking, setChecking] = useState(false)
  const [saving, setSaving] = useState(false)

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
        if ((err as Error).name !== 'AbortError') toast.error('Không đọc được xác nhận.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setChecking(false)
      })

    return () => controller.abort()
  }, [id])

  const submit = async () => {
    if (!guest || saving) return
    setSaving(true)
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

  const rsvpClosed = isRsvpClosed()

  return (
    <section className='page-four relative h-full w-full overflow-hidden bg-[#f8f1e4]'>
      <motion.div
        initial='hidden'
        animate={animateState}
        variants={fadeIn}
        className='absolute inset-0'
      >
        <Image
          src='/background.png'
          alt='background'
          fill
          sizes='(max-width: 639px) 92vw, 460px'
          className='object-cover opacity-95'
        />
      </motion.div>
      <Image
        src='/border.svg'
        alt='border'
        fill
        sizes='(max-width: 639px) 92vw, 460px'
        className='object-contain w-full'
      />

      <motion.div
        initial='hidden'
        animate={animateState}
        variants={staggerContainer}
        className='page-four-content absolute-x-center top-[1.5rem] flex w-[82%] flex-col items-center text-center'
      >
        <Image
          src='/logo-2.png'
          alt='text'
          className='page-four-logo opacity-30 w-[12.5rem] h-auto object-contain translate-y-[0.5rem]'
          width={1000}
          height={1000}
          unoptimized
        />

        <motion.p
          variants={fadeUp}
          className='page-four-title text-[#002352] font-lora text-[1.35rem] font-bold uppercase mt-6'
        >
          Xác nhận tham dự
        </motion.p>
        <motion.div variants={scaleIn}>
          <Image
            src='/decor-5.svg'
            alt='decor'
            width={800}
            height={800}
            className='page-four-decor mx-auto mt-4 h-auto w-[8rem] object-contain'
          />
        </motion.div>

        {guest ? (
          <>
            <motion.p
              variants={fadeUp}
              className='page-four-copy mt-6 font-lora text-[0.9rem] leading-relaxed text-[#5b3d19] max-w-[15rem]'
            >
              Kính mời{' '}
              <span className='font-bold text-[#002352]'>
                {[guest.honorific, guest.name].filter(Boolean).join(' ')}
              </span>{' '}
              xác nhận tham dự.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className='page-four-countdown mt-6 flex justify-center gap-2 text-[#bb934f]'
            >
              {UNITS.map(({ key, label }) => (
                <div
                  key={key}
                  className='page-four-unit flex w-[3.5rem] flex-col items-center rounded-lg border border-[#bb934f]/40 bg-white/50 py-2'
                >
                  <span className='font-noto-serif text-[1.6rem] font-bold leading-none tabular-nums'>
                    {remaining
                      ? key === 'days'
                        ? remaining.days
                        : pad(remaining[key] as number)
                      : '00'}
                  </span>
                  <span className='font-lora mt-1 text-[0.55rem] uppercase tracking-[0.12em]'>
                    {label}
                  </span>
                </div>
              ))}
            </motion.div>

            <motion.div
              variants={fadeUp}
              className='page-four-actions mt-6 flex w-[18rem] flex-col gap-2'
            >
              <button
                type='button'
                disabled={saving || checking || rsvpClosed}
                onClick={() => void submit()}
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[0.8rem] text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  confirmed
                    ? 'bg-[#8a6a2f] ring-2 ring-[#bb934f]'
                    : 'bg-[#bb934f] hover:bg-[#bb934f]/85'
                }`}
              >
                {confirmed && <CheckCircleIcon className='h-4 w-4' />}
                {checking
                  ? 'Đang kiểm tra...'
                  : confirmed
                    ? 'Huỷ xác nhận tham gia'
                    : 'Xác nhận tham gia'}
              </button>

              <p className='font-lora mt-1 text-[0.7rem] leading-snug text-[#5b3d19]'>
                {rsvpClosed ? (
                  <span className='text-[#9d0208]'>
                    Đã hết hạn xác nhận ({formatDeadline()}). Vui lòng liên hệ Ban tổ chức.
                  </span>
                ) : (
                  <>Hạn xác nhận: {formatDeadline()}</>
                )}
              </p>
            </motion.div>
          </>
        ) : (
          <motion.p
            variants={fadeUp}
            className='mt-8 font-lora text-[0.8rem] leading-relaxed text-[#9d0208]'
          >
            Vui lòng mở đúng đường dẫn thiệp được Ban tổ chức gửi riêng để xác nhận tham dự.
          </motion.p>
        )}
      </motion.div>

      <motion.div
        initial='hidden'
        animate={animateState}
        variants={fadeIn}
      >
        <Image
          src='/decor-4.png'
          alt='decoration'
          className='pointer-events-none absolute -bottom-10 left-0 z-[1] h-auto w-full object-contain'
          width={800}
          height={800}
        />
      </motion.div>
    </section>
  )
}

export default Page4
