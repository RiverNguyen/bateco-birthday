'use client'

import { useEffect, useState } from 'react'

import { getRemaining, type Remaining } from '@/lib/event'

const UNITS: { key: keyof Remaining; label: string }[] = [
  { key: 'days', label: 'Ngày' },
  { key: 'hours', label: 'Giờ' },
  { key: 'minutes', label: 'Phút' },
  { key: 'seconds', label: 'Giây' },
]

const pad = (value: number) => String(value).padStart(2, '0')

const Countdown = () => {
  const [remaining, setRemaining] = useState<Remaining | null>(null)

  useEffect(() => {
    const tick = () => setRemaining(getRemaining())
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  // Chưa mount xong (SSR) thì không render để tránh lệch hydration.
  if (!remaining) return null

  return (
    <div className='absolute-y-center right-[10rem] z-20 items-center gap-3 text-[#bb934f] select-none flex flex-col'>
      <div className='flex flex-col gap-2'>
        {UNITS.map(({ key, label }) => (
          <div
            key={key}
            className='flex items-center px-3 py-2 shadow-[0_0.4rem_1.2rem_rgba(72,44,12,0.14)]'
          >
            <span
              className='font-noto-serif text-[4rem] leading-none font-bold tabular-nums'
              style={{
                color: 'transparent',
                WebkitTextStroke: '2px #bb934f',
              }}
            >
              {key === 'days' ? remaining.days : pad(remaining[key] as number)}
            </span>
            <span className='font-lora mt-1 text-[0.75rem] tracking-[0.15em] uppercase ml-4'>
              {label}
            </span>
          </div>
        ))}
      </div>
      <button className='bg-[#bb934f] text-white px-4 py-2 rounded-lg hover:bg-[#bb934f]/80 transition-colors duration-300 ease-out hover:cursor-pointer'>
        Xác nhận tham gia
      </button>
    </div>
  )
}

export default Countdown
