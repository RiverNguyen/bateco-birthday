'use client'

import { motion } from 'motion/react'
import Image from 'next/image'

import {
  FLIP_STATE,
  useIsActivePage,
  useRevealOnce,
} from '@/app/_components/invitation-flipbook/active-page-context'
import { fadeIn, fadeUp, lineExpand, riseFromBottom, scaleIn, withDelay } from '@/lib/animations'

const Page1 = () => {
  const isActive = useIsActivePage(FLIP_STATE.cover)
  const revealed = useRevealOnce(isActive)

  return (
    <section className='relative h-full w-full overflow-hidden bg-[#f7f0df]'>
      <motion.div
        initial='hidden'
        animate={revealed ? 'show' : 'hidden'}
        variants={fadeIn}
        className='absolute inset-0'
      >
        <Image
          src='/background.png'
          alt='background'
          fill
          sizes='(max-width: 639px) 92vw, 460px'
          className='object-cover'
          priority
        />
      </motion.div>
      <Image
        src='/border.svg'
        alt='border'
        fill
        sizes='(max-width: 639px) 92vw, 460px'
        className='object-contain'
      />
      <motion.div
        initial='hidden'
        animate={revealed ? 'show' : 'hidden'}
        variants={scaleIn}
        className='absolute-x-center top-[6.25rem] w-[14.25rem]'
      >
        <Image
          src='/logo.svg'
          alt='logo'
          className='h-auto w-full object-contain drop-shadow-[0_0.6rem_1.4rem_rgba(72,44,12,0.16)]'
          width={400}
          height={400}
          unoptimized
        />
      </motion.div>

      <h1 className='font-lora text-[1.5rem] font-bold uppercase leading-relaxed text-[#002352] absolute-x-center top-[1.875rem] whitespace-nowrap'>
        Tập đoàn Bateco
      </h1>
      <motion.div
        initial='hidden'
        animate={revealed ? 'show' : 'hidden'}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.16, delayChildren: 0.55 } },
        }}
        className='absolute-x-center top-[21rem] w-[82%] text-center'
      >
        <motion.h2
          variants={fadeUp}
          className='font-pinyon-script text-[2.6rem] leading-none text-[#c29e4a] drop-shadow-[0_0.15rem_0_rgba(255,255,255,0.75)]'
        >
          Thiệp mời
        </motion.h2>
        <motion.div variants={lineExpand}>
          <Image
            src='/hr.svg'
            alt='decoration'
            className='h-auto w-[8rem] object-contain mx-auto mt-2'
            width={400}
            height={400}
          />
        </motion.div>
        <motion.p
          variants={fadeUp}
          className='mx-auto mt-2 font-lora text-[1.875rem] font-bold uppercase leading-relaxed text-[#002352]'
        >
          Lễ kỷ niệm <br /> <span className='text-[#C29E4A] font-bold font-lora'>14</span> năm thành
          lập
        </motion.p>
      </motion.div>
      <motion.div
        initial='hidden'
        animate={revealed ? 'show' : 'hidden'}
        variants={withDelay(riseFromBottom, 0.3)}
        className='absolute -bottom-10 left-0 w-full z-[1]'
      >
        <Image
          src='/decor-4.png'
          alt='decoration'
          className='h-auto w-full object-contain'
          width={800}
          height={800}
        />
      </motion.div>
      <motion.div
        initial='hidden'
        animate={revealed ? 'show' : 'hidden'}
        variants={withDelay(riseFromBottom, 0.45)}
        className='absolute -bottom-2 left-0 w-[20rem]'
      >
        <Image
          src='/tower.svg'
          alt='tower'
          className='h-auto w-full object-contain'
          width={800}
          height={800}
        />
      </motion.div>
    </section>
  )
}

export default Page1
