'use client'

import { motion, type Variants } from 'motion/react'
import Image from 'next/image'

import {
  FLIP_STATE,
  useBookOrientation,
  useIsActivePage,
  useRevealOnce,
} from '@/app/_components/invitation-flipbook/active-page-context'
import { fadeIn, fadeUp, scaleIn, staggerContainer } from '@/lib/animations'

const schedule = [
  { time: '10h45', title: 'Đón tiếp đại biểu' },
  { time: '11h30', title: 'Khai mạc chương trình' },
  { time: '11h45', title: 'Phát biểu của chủ tịch' },
  { time: '11h50', title: 'Công bố nhận diện mới của Tập đoàn' },
  { time: '12h00', title: 'Công bố đối tác chiến lược mới' },
  { time: '12h15', title: 'Khai tiệc' },
  { time: '13h00', title: 'Chương trình nghệ thuật chào mừng 14 năm thành lập ' },
  { time: '13h30', title: 'Trao giải các cuộc thi, hội thao thành lập Tập đoàn' },
  { time: '14h30', title: 'Bế mạc' },
]

const scheduleItem: Variants = {
  hidden: { opacity: 0, y: -18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

const Page3 = () => {
  const orientation = useBookOrientation()
  const isActive = useIsActivePage(
    orientation === 'portrait' ? FLIP_STATE.portraitClosing : FLIP_STATE.spread,
  )
  const revealed = useRevealOnce(isActive)
  const animateState = revealed ? 'show' : 'hidden'

  return (
    <section className='page-three relative h-full w-full overflow-hidden bg-[#f8f1e4]'>
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
        variants={fadeIn}
      >
        <Image
          src='/decor-page-2.png'
          alt='decor'
          sizes='(max-width: 639px) 92vw, 460px'
          className='object-contain w-[15rem] top-0 h-auto left-0 z-[1] absolute rotate-y-180'
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
          className='absolute h-auto object-contain -bottom-10 left-0 w-full z-[1] rotate-y-180'
          width={800}
          height={800}
        />
      </motion.div>
      <motion.div
        initial='hidden'
        animate={animateState}
        variants={staggerContainer}
        className='page-three-header absolute-x-center top-[3.875rem] w-[82%] text-center xsm:top-[3.35rem]'
      >
        <motion.p
          variants={fadeUp}
          className='text-[#002352] font-lora text-[1.35rem] font-bold uppercase'
        >
          NỘI DUNG CHƯƠNG TRÌNH
        </motion.p>
        <motion.div variants={scaleIn}>
          <Image
            src='/decor-5.svg'
            alt='decor'
            width={800}
            height={800}
            className='page-three-header-decor w-[8rem] h-auto object-contain mt-4 mx-auto'
          />
        </motion.div>
      </motion.div>
      <div className='page-three-timeline absolute-x-center top-[8.75rem] w-[80%] xsm:top-[8.05rem]'>
        <div className='relative'>
          <motion.div
            initial='hidden'
            animate={animateState}
            variants={{
              hidden: { scaleY: 0 },
              show: { scaleY: 1, transition: { duration: 1.1, ease: 'easeOut', delay: 0.3 } },
            }}
            style={{ transformOrigin: 'top' }}
            className='page-three-line absolute bottom-[1rem] left-[6.125rem] top-[1.5rem] w-[0.12rem] bg-[#C29E4A] xsm:bottom-[0.7rem] xsm:left-[5.8675rem]'
          />
          <motion.div
            initial='hidden'
            animate={animateState}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1, delayChildren: 0.35 } },
            }}
            className='page-three-list flex flex-col gap-[0.55rem] xsm:gap-[0.32rem]'
          >
            {schedule.map((item) => (
              <motion.div
                key={`${item.time}-${item.title}`}
                variants={scheduleItem}
                className='page-three-item relative grid min-h-[2.5rem] grid-cols-[5.1rem_1.2rem_1fr] items-center gap-3 xsm:min-h-[2.22rem] xsm:gap-2'
              >
                <p className='page-three-time font-lora pt-1 text-[1.05rem] font-bold leading-tight text-[#002352] xsm:text-[0.98rem]'>
                  {item.time}
                </p>
                <span className='relative z-10 mt-[0.45rem] size-[0.68rem] rounded-full bg-[#C29E4A] shadow-[0_0_0_0.18rem_rgba(194,158,74,0.12)]' />
                <p className='page-three-title pt-1 font-lora text-[0.75rem] xsm:text-[0.68rem]'>
                  {item.title}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
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

export default Page3
