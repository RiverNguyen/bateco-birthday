'use client'

import Image from 'next/image'

import Countdown from '@/app/_components/invitation-flipbook/countdown'
import FlipBook from '@/app/_components/invitation-flipbook/flip-book'
import { GuestProvider } from '@/app/_components/invitation-flipbook/guest-context'
import { useIsMobile } from '@/hooks/use-mobile'
import type { Guest } from '@/lib/guest'

const InvitationFlipbook = ({ guest }: { guest?: Guest | null }) => {
  // Mobile: phần xác nhận nằm ở trang 4 của thiệp, không dùng cột đếm ngược bên phải.
  const isMobile = useIsMobile()

  return (
    <GuestProvider value={guest ?? null}>
      <section className='invitation-stage relative flex min-h-dvh overflow-hidden text-[#5b3d19] pt-[2rem]'>
        <Image
          src='/bg-new.png'
          alt='Background'
          fill
          sizes='100vw'
          unoptimized
          className='absolute inset-0 object-cover'
        />
        <Image
          src='/decor-bottom-left-loop.webp'
          alt='decoration'
          className='absolute bottom-0 left-0 w-[50rem] h-auto object-contain'
          width={1000}
          height={1000}
          unoptimized
        />
        <Image
          src='/decor-top-right-loop.webp'
          alt='decoration'
          className='absolute top-0 right-0 w-[50rem] h-auto object-contain'
          width={1000}
          height={1000}
          unoptimized
        />
        <div className='absolute-y-center left-0 flex'>
          <Image
            src='/14-2.webp'
            alt='14-2'
            className='w-[7.5rem] h-auto object-contain'
            width={1000}
            height={1000}
            unoptimized
          />
          <Image
            src='/text-decor-gold-sweep.webp'
            alt='text'
            className=' w-[17rem] h-auto object-contain translate-y-[0.5rem]'
            width={1000}
            height={1000}
            unoptimized
          />
        </div>

        <Image
          src='/logo-gold-sweep.webp'
          alt='text'
          className='absolute-y-center w-[40rem] h-auto object-contain opacity-30 -translate-x-[50.5%] left-1/2'
          width={1000}
          height={1000}
          unoptimized
        />
        <div className='relative mx-auto flex w-full max-w-[78rem] flex-col items-center justify-center gap-5 xsm:max-w-full'>
          <FlipBook />
        </div>
        {!isMobile && <Countdown />}
      </section>
    </GuestProvider>
  )
}

export default InvitationFlipbook
