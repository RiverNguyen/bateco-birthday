'use client'

import Image from 'next/image'
import { forwardRef, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'

import Page1 from '@/app/[locale]/_components/page-1'
import Page2 from '@/app/[locale]/_components/page-2'
import Page3 from '@/app/[locale]/_components/page-3'
import { cn, convertRemToPx } from '@/lib/utils'

type PageFlipHandle = {
  pageFlip: () => {
    flipNext: () => void
    flipPrev: () => void
  }
}

type FlipPageProps = {
  children: React.ReactNode
  className?: string
}

const FlipPage = forwardRef<HTMLDivElement, FlipPageProps>(({ children, className }, ref) => {
  return (
    <div
      ref={ref}
      data-density='soft'
      className={cn(
        'invitation-flip-page h-full w-full overflow-hidden bg-[#f8f1e4]',
        'select-none shadow-[0_1.5rem_4rem_rgba(44,31,14,0.28)]',
        className,
      )}
    >
      {children}
    </div>
  )
})

FlipPage.displayName = 'FlipPage'

const pages = [
  { id: 'cover', label: 'Trang bìa', content: <Page1 /> },
  { id: 'details', label: 'Thông tin', content: <Page2 /> },
  { id: 'closing', label: 'Lời mời', content: <Page3 /> },
]

const InvitationFlipbook = () => {
  const bookRef = useRef<PageFlipHandle>(null)
  const [activePage, setActivePage] = useState(0)
  const [pageState, setPageState] = useState('read')

  return (
    <section className='invitation-stage relative min-h-dvh overflow-hidden text-[#5b3d19] pt-[2rem]'>
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
      <Image
        src='/14-2.webp'
        alt='14-2'
        className='absolute left-0 top-0 w-[8rem] h-auto object-contain'
        width={1000}
        height={1000}
        unoptimized
      />
      <Image
        src='/text-decor-2.png'
        alt='text'
        className='absolute left-[7.25rem] top-[2.65rem] w-[19rem] h-auto object-contain'
        width={1000}
        height={1000}
        unoptimized
      />
      <Image
        src='/logo-2.png'
        alt='text'
        className='absolute right-[1rem] bottom-[1rem] w-[10rem] h-auto object-contain opacity-30'
        width={1000}
        height={1000}
        unoptimized
      />
      <div className='relative mx-auto flex max-w-[78rem] flex-col items-center justify-center gap-5'>
        <div className='relative w-full max-w-[70rem]'>
          <div
            className={cn(
              'book-stage relative flex justify-center transition-transform duration-700 ease-out',
              activePage === 0 && '-translate-x-[12.5rem]',
              activePage === pages.length - 1 && 'translate-x-[15rem]',
            )}
          >
            <div
              className='book-shell'
              data-page-state={pageState}
            >
              <HTMLFlipBook
                ref={bookRef}
                className={cn('invitation-book', pageState === 'fold_corner' && 'cursor-grab')}
                style={{}}
                width={convertRemToPx(24) ?? 0}
                height={convertRemToPx(47) ?? 0}
                minWidth={convertRemToPx(24) ?? 0}
                maxWidth={convertRemToPx(24) ?? 0}
                minHeight={convertRemToPx(25) ?? 0}
                maxHeight={convertRemToPx(47) ?? 0}
                size='stretch'
                startPage={0}
                drawShadow
                flippingTime={1650}
                usePortrait
                startZIndex={30}
                autoSize
                maxShadowOpacity={0.86}
                showCover
                mobileScrollSupport
                clickEventForward
                useMouseEvents
                swipeDistance={8}
                showPageCorners
                disableFlipByClick={false}
                onFlip={(event) => setActivePage(Number(event.data))}
                onChangeState={(event) => setPageState(String(event.data))}
              >
                {pages.map((page) => (
                  <FlipPage key={page.id}>{page.content}</FlipPage>
                ))}
              </HTMLFlipBook>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default InvitationFlipbook
