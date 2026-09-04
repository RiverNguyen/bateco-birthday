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
const storageKey = (id: string) => `rsvp:${id}`

const Page4 = () => {
  const guest = useGuest()
  const id = guest?.id ?? ''

  const isActive = useIsActivePage(FLIP_STATE.mobileRsvp)
  const revealed = useRevealOnce(isActive)
  const animateState = revealed ? 'show' : 'hidden'

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

  useEffect(() => {
    const tick = () => setRemaining(getRemaining())
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  const submit = async (partySize: number) => {
    if (!guest || saving) return
    setSaving(true)
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
      } catch {
        // localStorage không dùng được — bỏ qua
      }
      toast.success('Xác nhận thành công.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không gửi được xác nhận.')
    } finally {
      setSaving(false)
    }
  }

  const rsvpClosed = isRsvpClosed()

  return (
    <section className='relative h-full w-full overflow-hidden bg-[#f8f1e4]'>
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
        className='absolute-x-center top-[1.5rem] flex w-[82%] flex-col items-center text-center'
      >
        <Image
          src='/logo-2.png'
          alt='text'
          className='opacity-30 w-[12.5rem] h-auto object-contain translate-y-[0.5rem]'
          width={1000}
          height={1000}
          unoptimized
        />

        <motion.p
          variants={fadeUp}
          className='text-[#002352] font-lora text-[1.35rem] font-bold uppercase mt-6'
        >
          Xác nhận tham dự
        </motion.p>
        <motion.div variants={scaleIn}>
          <Image
            src='/decor-5.svg'
            alt='decor'
            width={800}
            height={800}
            className='mx-auto mt-4 h-auto w-[8rem] object-contain'
          />
        </motion.div>

        {guest ? (
          <>
            <motion.p
              variants={fadeUp}
              className='mt-6 font-lora text-[0.9rem] leading-relaxed text-[#5b3d19]'
            >
              Kính mời{' '}
              <span className='font-bold text-[#002352]'>
                {[guest.honorific, guest.name].filter(Boolean).join(' ')}
              </span>
              {guest.partner ? ` cùng ${guest.partner}` : ''} xác nhận tham dự.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className='mt-6 flex justify-center gap-2 text-[#bb934f]'
            >
              {UNITS.map(({ key, label }) => (
                <div
                  key={key}
                  className='flex w-[3.5rem] flex-col items-center rounded-lg border border-[#bb934f]/40 bg-white/50 py-2'
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
              className='mt-6 flex w-[18rem] flex-col gap-2'
            >
              <button
                type='button'
                disabled={saving || rsvpClosed}
                onClick={() => void submit(1)}
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[0.8rem] text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  confirmed === 1
                    ? 'bg-[#8a6a2f] ring-2 ring-[#bb934f]'
                    : 'bg-[#bb934f] hover:bg-[#bb934f]/85'
                }`}
              >
                {confirmed === 1 && <CheckCircleIcon className='h-4 w-4' />}
                Xác nhận bản thân tham gia
              </button>

              {guest.partner && (
                <button
                  type='button'
                  disabled={saving || rsvpClosed}
                  onClick={() => void submit(2)}
                  className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[0.8rem] text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    confirmed === 2
                      ? 'bg-[#6b0106] ring-2 ring-[#9d0208]'
                      : 'bg-[#9d0208] hover:bg-[#9d0208]/85'
                  }`}
                >
                  {confirmed === 2 && <CheckCircleIcon className='h-4 w-4' />}
                  Xác nhận tham gia cùng {guest.partner.toLowerCase()}
                </button>
              )}

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
