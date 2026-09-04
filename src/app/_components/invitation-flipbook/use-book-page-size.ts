'use client'

import { useEffect, useState } from 'react'

// Per-page aspect ratio (width / height) the flipbook is designed around.
const PAGE_ASPECT = 24 / 47

// Vertical space reserved outside the book (section's pt-[2rem] + breathing room).
// Must mirror the reserved space used by the `.book-shell` rules in globals.css.
const RESERVED_VERTICAL_REM = 4

type BookPageSize = {
  width: number
  height: number
  minWidth: number
  maxWidth: number
  minHeight: number
  maxHeight: number
}

function computeBookPageSize(): BookPageSize {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0, minWidth: 0, maxWidth: 0, minHeight: 0, maxHeight: 0 }
  }

  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
  const maxHeightCapPx = 47 * rootFontSize
  const minHeightCapPx = 25 * rootFontSize
  const availableHeightPx = window.innerHeight - RESERVED_VERTICAL_REM * rootFontSize
  // Nội dung trang được thiết kế ở đúng 24rem — nhưng bề rộng thực tế không được
  // vượt quá khung nhìn, nếu không react-pageflip đặt inline-width lớn hơn màn hình
  // và chữ trong trang bị tràn / cắt ở mép phải.
  const maxWidthCapPx = Math.min(24 * rootFontSize, window.innerWidth)

  // react-pageflip otherwise renders each page at a fixed 24×47rem regardless of
  // viewport height — on a short screen (small phone, or a browser chrome that eats
  // a lot of vertical space) that spills the book past the visible area. Shrinking
  // height (and width, proportionally) to what's actually available keeps it on screen.
  const height = Math.max(1, Math.min(maxHeightCapPx, availableHeightPx))
  const width = Math.min(maxWidthCapPx, height * PAGE_ASPECT)
  const minHeight = Math.min(minHeightCapPx, height)

  return { width, height, minWidth: width, maxWidth: width, minHeight, maxHeight: height }
}

export function useBookPageSize(): BookPageSize {
  const [size, setSize] = useState(computeBookPageSize)

  useEffect(() => {
    const handleResize = () => setSize(computeBookPageSize())
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}
