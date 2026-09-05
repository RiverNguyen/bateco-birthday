'use client'

import { MapPinIcon } from 'lucide-react'
import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'

import {
  FLIP_STATE,
  useIsActivePage,
  useRevealOnce,
} from '@/app/_components/invitation-flipbook/active-page-context'
import { useGuest } from '@/app/_components/invitation-flipbook/guest-context'
import { fadeIn, fadeUp, staggerContainer } from '@/lib/animations'

const Page2 = () => {
  const guest = useGuest()
  const guestName = guest
    ? [guest.honorific, guest.name].filter(Boolean).join(' ')
    : 'Ông Phạm Trung Hưng'
  // Thiệp nội bộ: chỉ hiện chức danh, bỏ đơn vị / bộ phận.
  const guestSubtitle = guest
    ? guest.category === 'Nội bộ'
      ? [guest.title].filter(Boolean)
      : [guest.title, [guest.unit, guest.department].filter(Boolean).join(' - ')].filter(Boolean)
    : ['Nguyên Chánh văn phòng', 'Tập đoàn Công nghiệp Than - Khoáng sản Việt Nam']
  const isActive = useIsActivePage(FLIP_STATE.spread)
  const revealed = useRevealOnce(isActive)
  const animateState = revealed ? 'show' : 'hidden'

  return (
    <section className='page-two relative h-full w-full overflow-hidden bg-[#f8f1e4] pointer-events-auto'>
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
          className='pointer-events-none object-cover opacity-95'
        />
      </motion.div>
      <Image
        src='/border.svg'
        alt='border'
        fill
        sizes='(max-width: 639px) 92vw, 460px'
        className='pointer-events-none w-full object-contain'
      />
      <motion.div
        initial='hidden'
        animate={animateState}
        variants={fadeIn}
      >
        <Image
          src='/decor-page-2.png'
          alt='decor'
          sizes='(max-width: 639px) 92vw, 460px'
          className='pointer-events-none absolute right-0 top-0 z-[1] h-auto w-[15rem] object-contain'
          width={800}
          height={800}
        />
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
      <motion.div
        initial='hidden'
        animate={animateState}
        variants={staggerContainer}
        className='page-two-content absolute left-1/2 top-[4rem] z-10 w-[82%] -translate-x-1/2 text-center'
      >
        <motion.p
          variants={fadeUp}
          className='page-two-brand text-[#002352] font-lora text-[1.5rem] font-bold uppercase'
        >
          Tập đoàn Bateco
        </motion.p>
        <motion.p
          variants={fadeUp}
          className='page-two-kicker text-[#002352] font-lora text-[1rem] font-bold uppercase'
        >
          Trân trọng kính mời
        </motion.p>
        <motion.p
          variants={fadeUp}
          className='page-two-guest font-style-script mt-4 text-[1.875rem]'
          style={{ fontFamily: "'Style Script', cursive", fontWeight: 400 }}
        >
          {guestName}
        </motion.p>
        {guestSubtitle.length > 0 && (
          <motion.p
            variants={fadeUp}
            className='page-two-subtitle font-lora text-[0.75rem]'
          >
            {guestSubtitle.map((line, index) => (
              <span key={line}>
                {index > 0 && <br />}
                {line}
              </span>
            ))}
          </motion.p>
        )}
        <motion.div
          variants={fadeUp}
          className='page-two-section-title flex gap-2 justify-center mt-8'
        >
          <Image
            src='/line.png'
            alt='decor'
            width={800}
            height={800}
            className='w-[5rem] h-auto object-contain mt-1.5'
          />
          <p className='text-[#002352] font-lora text-[0.875rem] font-bold'>Tới tham dự</p>
          <Image
            src='/line-2.png'
            alt='decor'
            width={800}
            height={800}
            className='w-[5rem] h-auto object-contain mt-1.5 -translate-x-2'
          />
        </motion.div>
        <motion.p
          variants={fadeUp}
          className='page-two-event-title text-[#002352] font-lora text-[1.25rem] font-bold uppercase mt-4'
        >
          LỄ KỶ NIỆM 14 NĂM <br /> THÀNH LẬP TẬP ĐOÀN BATECO
        </motion.p>
        <motion.div variants={fadeUp}>
          <Image
            src='/decor-5.svg'
            alt='decor'
            width={800}
            height={800}
            className='page-two-mid-decor w-[8rem] h-auto object-contain mt-4 mx-auto'
          />
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className='page-two-date-block flex flex-col items-center justify-center mt-4'
        >
          <motion.p
            variants={fadeUp}
            className='page-two-month text-[#002352] font-lora text-[1.25rem] font-bold uppercase'
          >
            THÁNG 9
          </motion.p>
          <motion.div
            variants={fadeUp}
            className='page-two-date-row flex justify-center items-center gap-4 translate-x-3'
          >
            <p className='page-two-weekday text-[#002352] font-lora text-[1.25rem] font-bold uppercase pr-2 border-r-2 border-[#C29E4A]'>
              Thứ 7
            </p>
            <motion.p
              variants={{
                hidden: { opacity: 0, scale: 0.6 },
                show: {
                  opacity: 1,
                  scale: 1,
                  transition: { type: 'spring', stiffness: 260, damping: 16, delay: 0.15 },
                },
              }}
              className='page-two-day text-[#C29E4A] text-[2.5rem] font-bold'
            >
              19
            </motion.p>
            <p className='page-two-time text-[#002352] font-lora text-[1.25rem] font-bold uppercase pl-2 border-l-2 border-[#C29E4A]'>
              11:30 AM
            </p>
          </motion.div>
          <motion.p
            variants={fadeUp}
            className='page-two-year text-[#002352] font-lora text-[1.25rem] font-bold uppercase -translate-x-1'
          >
            2026
          </motion.p>
          <motion.div
            variants={fadeUp}
            className='page-two-location-title flex gap-2 justify-center mt-8'
          >
            <Image
              src='/line.png'
              alt='decor'
              width={800}
              height={800}
              className='w-[5rem] h-auto object-contain mt-1.5'
            />
            <p className='text-[#002352] font-lora text-[0.875rem] font-bold'>Địa điểm</p>
            <Image
              src='/line-2.png'
              alt='decor'
              width={800}
              height={800}
              className='w-[5rem] h-auto object-contain mt-1.5 -translate-x-2'
            />
          </motion.div>
          <motion.div
            variants={fadeUp}
            className='page-two-location flex items-center justify-center gap-2 mt-6'
          >
            <MapPinIcon className='size-6 text-[#C29E4A]' />
            <Link
              href='https://maps.app.goo.gl/5y3VsoYPvU6d9ZoU7'
              target='_blank'
              rel='noreferrer'
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              className='relative z-20 cursor-pointer font-lora text-[0.75rem] font-medium text-[#C29E4A] pointer-events-auto'
            >
              <span className='text-base'>Sheraton Hanoi West</span> <br />
              36 Đường Lê Đức Thọ, Hà Nội
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
      <motion.div
        initial='hidden'
        animate={animateState}
        variants={fadeIn}
      >
        <Image
          src='/logo-2.png'
          alt='decor'
          width={800}
          height={800}
          className='page-three-logo absolute-x-center bottom-[3.5rem] w-[6.5rem] h-auto object-contain opacity-20 xsm:bottom-[2.2rem]'
        />
      </motion.div>
    </section>
  )
}

export default Page2
