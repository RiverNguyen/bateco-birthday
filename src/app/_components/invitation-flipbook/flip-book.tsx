'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
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
import { useIsMobile, useIsTablet } from '@/hooks/use-mobile'
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

const isTypingTarget = (target: EventTarget | null) =>
  Boolean(
    (target as HTMLElement | null)?.closest(
      'a, button, input, textarea, select, [contenteditable="true"]',
    ),
  )

/**
 * A real page-turning book via react-pageflip, with explicit viewport modes.
 * Mobile/tablet stay as one portrait card; desktop is the only two-page spread.
 */
const FlipBook = () => {
  const bookRef = useRef<PageFlipHandle>(null)
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isCompactBook = isMobile || isTablet
  const [activePage, setActivePage] = useState(0)
  const [pageState, setPageState] = useState('read')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    isCompactBook ? 'portrait' : 'landscape',
  )
  const bookPageSize = useBookPageSize()

  // react-pageflip không báo hướng lật (tới/lui) qua bất kỳ event nào — nhưng vùng
  // "innerShadow" của nó bị thư viện tính rộng bất thường khi lật lùi (BACK), nên
  // lớp nền kem mình ép vào (chống hiệu ứng "trong suốt") lại che luôn cả trang
  // phía sau trong TH đó. Tự theo dõi hướng kéo bằng con trỏ để chỉ bật lớp nền đó
  // khi lật tới (FORWARD), nơi vùng innerShadow đã đúng kích thước khớp nếp gấp.
  const [flipDirection, setFlipDirection] = useState<'forward' | 'back' | null>(null)
  const pointerStartXRef = useRef<number | null>(null)
  // Không lật (đã về `read`) thì hướng lật dở dang trước đó không còn ý nghĩa —
  // suy ra thẳng từ pageState thay vì đồng bộ qua effect để tránh render lồng nhau.
  const effectiveFlipDirection = pageState === 'read' ? null : flipDirection
  const handlePointerDown = (event: React.PointerEvent) => {
    pointerStartXRef.current = event.clientX
  }
  const handlePointerMove = (event: React.PointerEvent) => {
    if (pointerStartXRef.current === null) return
    const dx = event.clientX - pointerStartXRef.current
    if (Math.abs(dx) < 4) return
    setFlipDirection(dx < 0 ? 'forward' : 'back')
  }
  const handlePointerEnd = () => {
    pointerStartXRef.current = null
  }
  // Mobile/tablet: thêm trang 4 (xác nhận tham dự) vào cuốn thiệp, cùng hiệu ứng lật.
  const pages = isCompactBook ? mobilePages : basePages
  const canFlipPrev = activePage > 0 && pageState === 'read'
  const canFlipNext = activePage < pages.length - 1 && pageState === 'read'

  const flipPrev = useCallback(() => {
    if (!canFlipPrev) return
    setFlipDirection('back')
    bookRef.current?.pageFlip().flipPrev()
  }, [canFlipPrev])

  const flipNext = useCallback(() => {
    if (!canFlipNext) return
    setFlipDirection('forward')
    bookRef.current?.pageFlip().flipNext()
  }, [canFlipNext])

  // Chỉ dựng HTMLFlipBook SAU khi mount — lúc đó `isMobile` và kích thước đã đúng,
  // nên không phải remount (nguồn gây giật trang đầu trên mobile).
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrientation(isCompactBook ? 'portrait' : 'landscape')
    setActivePage((currentPage) => Math.min(currentPage, pages.length - 1))
  }, [isCompactBook, pages.length])

  useEffect(() => {
    if (isCompactBook) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        return
      }
      if (isTypingTarget(event.target)) return

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        flipPrev()
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        flipNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [flipNext, flipPrev, isCompactBook])

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
                data-flip-direction={effectiveFlipDirection ?? undefined}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
              >
                {mounted && bookPageSize.width > 0 && (
                  <HTMLFlipBook
                    key={isCompactBook ? 'compact-book' : 'desktop-book'}
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
                    drawShadow
                    flippingTime={isCompactBook ? 700 : 900}
                    usePortrait={isCompactBook}
                    startZIndex={30}
                    autoSize
                    maxShadowOpacity={0.86}
                    showCover={!isCompactBook}
                    mobileScrollSupport={false}
                    clickEventForward
                    useMouseEvents
                    swipeDistance={8}
                    showPageCorners={!isCompactBook}
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
          'text-[#bb934f] text-[1rem] font-semibold opacity-0 transition-opacity duration-300 ease-out xlg:hidden',
          activePage === 0 && 'opacity-100',
        )}
      >
        Click hoặc vuốt màn hình để xem thiệp
      </p>
      <div className='compact-book-controls hidden items-center justify-center gap-3 xlg:flex'>
        <button
          type='button'
          aria-label='Trang trước'
          disabled={!canFlipPrev}
          onClick={flipPrev}
          className='flex size-[2.75rem] items-center justify-center rounded-full border border-[#bb934f]/55 bg-[#f8f1e4]/90 text-[#8a6a2f] shadow-[0_0.35rem_1rem_rgba(44,31,14,0.18)] transition-colors disabled:opacity-35'
        >
          <ChevronLeftIcon className='size-5' />
        </button>
        <span className='min-w-[4.25rem] rounded-full border border-[#bb934f]/35 bg-[#f8f1e4]/80 px-3 py-2 text-center font-lora text-[0.78rem] font-semibold text-[#8a6a2f] tabular-nums shadow-[0_0.35rem_1rem_rgba(44,31,14,0.12)]'>
          {activePage + 1}/{pages.length}
        </span>
        <button
          type='button'
          aria-label='Trang sau'
          disabled={!canFlipNext}
          onClick={flipNext}
          className='flex size-[2.75rem] items-center justify-center rounded-full border border-[#bb934f]/55 bg-[#f8f1e4]/90 text-[#8a6a2f] shadow-[0_0.35rem_1rem_rgba(44,31,14,0.18)] transition-colors disabled:opacity-35'
        >
          <ChevronRightIcon className='size-5' />
        </button>
      </div>
    </>
  )
}

export default FlipBook
