'use client'

import { createContext, useContext, useState } from 'react'

const ActivePageContext = createContext(0)

export const ActivePageProvider = ActivePageContext.Provider

/**
 * react-pageflip reports flip *states*, not individual page indexes, and the
 * number of states depends on orientation — which the library picks itself
 * (its default behavior) from the real rendered width vs. page size, at any
 * screen size, not from a screen-size breakpoint we guess at:
 * - Landscape (book wide enough for 2 pages side by side): 2 states — 0 = cover
 *   alone, 1 = the final spread showing pages 2 and 3 together (state 2 never fires).
 * - Portrait (book only wide enough for 1 page): 3 states — 0 = cover, 1 = page 2,
 *   2 = page 3.
 */
export const FLIP_STATE = {
  cover: 0,
  spread: 1,
  portraitClosing: 2,
} as const

export function useIsActivePage(state: number) {
  const activePage = useContext(ActivePageContext)
  return activePage === state
}

const BookOrientationContext = createContext<'portrait' | 'landscape'>('landscape')

export const BookOrientationProvider = BookOrientationContext.Provider

/** The book's *actual* current orientation, as reported by react-pageflip itself. */
export function useBookOrientation() {
  return useContext(BookOrientationContext)
}

/**
 * Plays the reveal animation once, the first time `isActive` becomes true,
 * then stays revealed — flipping away and back no longer replays it.
 */
export function useRevealOnce(isActive: boolean) {
  const [revealed, setRevealed] = useState(isActive)

  if (isActive && !revealed) {
    setRevealed(true)
  }

  return revealed
}
