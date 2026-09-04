'use client'

import { forwardRef, useEffect, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'

import {
  ActivePageProvider,
  BookOrientationProvider,
} from '@/app/_components/invitation-flipbook/active-page-context'
import { useBookPageSize } from '@/app/_components/invitation-flipbook/use-book-page-size'
import Page1 from '@/app/_components/page-1'
import Page2 from '@/app/_components/page-2'
import Page3 from '@/app/_components/page-3'
import Page4 from '@/app/_components/page-4'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

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

const basePages = [
  { id: 'cover', label: 'Trang bìa', content: <Page1 /> },
  { id: 'details', label: 'Thông tin', content: <Page2 /> },
  { id: 'closing', label: 'Lời mời', content: <Page3 /> },
]

const mobilePages = [...basePages, { id: 'rsvp', label: 'Xác nhận', content: <Page4 /> }]

/**
 * A real page-turning book via react-pageflip, at every screen size. The library
 * itself decides — from the actual rendered width vs. page size — whether to show
 * a single page (portrait) or a two-page spread (landscape); we don't force either.
 */
const FlipBook = () => {
  const bookRef = useRef<PageFlipHandle>(null)
  const [activePage, setActivePage] = useState(0)
  const [pageState, setPageState] = useState('read')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape')
  const bookPageSize = useBookPageSize()
  // Mobile: thêm trang 4 (xác nhận tham dự) vào cuốn thiệp, cùng hiệu ứng lật.
  const isMobile = useIsMobile()
  const pages = isMobile ? mobilePages : basePages

  // Chỉ dựng HTMLFlipBook SAU khi mount — lúc đó `isMobile` và kích thước đã đúng,
  // nên không phải remount (nguồn gây giật trang đầu trên mobile).
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  return (
    <>
      <ActivePageProvider value={activePage}>
        <BookOrientationProvider value={orientation}>
          <div className='relative w-full max-w-[70rem]'>
            <div
              className={cn(
                'book-stage relative flex justify-center transition-transform duration-700 ease-out',
                // These offsets re-center the wide landscape spread; they'd shove a
                // narrow portrait-mode book off-screen, so only apply in landscape.
                orientation === 'landscape' && activePage === 0 && '-translate-x-[12.5rem]',
                orientation === 'landscape' &&
                    activePage === pages.length - 1 &&
                    'translate-x-[15rem]',
              )}
            >
              <div
                className='book-shell'
                data-page-state={pageState}
              >
                {mounted && bookPageSize.width > 0 && (
                  <HTMLFlipBook
                    ref={bookRef}
                    className={cn('invitation-book', pageState === 'fold_corner' && 'cursor-grab')}
                    style={{}}
                    width={bookPageSize.width}
                    height={bookPageSize.height}
                    minWidth={bookPageSize.minWidth}
                    maxWidth={bookPageSize.maxWidth}
                    minHeight={bookPageSize.minHeight}
                    maxHeight={bookPageSize.maxHeight}
                    size='stretch'
                    startPage={0}
                    drawShadow={!isMobile}
                    flippingTime={isMobile ? 700 : 1650}
                    usePortrait
                    startZIndex={30}
                    autoSize
                    maxShadowOpacity={isMobile ? 0 : 0.86}
                    showCover={!isMobile}
                    mobileScrollSupport={false}
                    clickEventForward
                    useMouseEvents
                    swipeDistance={8}
                    showPageCorners={!isMobile}
                    disableFlipByClick={false}
                    onFlip={(event) => setActivePage(Number(event.data))}
                    onChangeState={(event) => setPageState(String(event.data))}
                    onChangeOrientation={(event) =>
                      setOrientation(event.data === 'portrait' ? 'portrait' : 'landscape')
                    }
                    // `changeOrientation` only fires on later changes — the *initial*
                    // orientation is resolved just after mount and would otherwise be
                    // missed, leaving `orientation` stuck at its default. `init` reports
                    // that first resolved orientation via `event.data.mode`.
                    onInit={(event) => {
                      const mode = (event.data as { mode?: string } | undefined)?.mode
                      if (mode) setOrientation(mode === 'portrait' ? 'portrait' : 'landscape')
                    }}
                  >
                    {pages.map((page) => (
                      <FlipPage key={page.id}>{page.content}</FlipPage>
                    ))}
                  </HTMLFlipBook>
                )}
              </div>
            </div>
          </div>
        </BookOrientationProvider>
      </ActivePageProvider>
      <p
        className={cn(
          ' text-[#bb934f] text-[1rem] font-semibold opacity-0 transition-opacity duration-300 ease-out',
          activePage === 0 && 'opacity-100',
        )}
      >
        Click hoặc vuốt màn hình để xem thiệp
      </p>
    </>
  )
}

export default FlipBook
