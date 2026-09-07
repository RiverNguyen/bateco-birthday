'use client'

import { useRef, useState } from 'react'

import { cn } from '@/lib/utils'

type FlipPageDef = { id: string; content: React.ReactNode }

type MobileFlipBookProps = {
  pages: FlipPageDef[]
  index: number
  onChange: (index: number) => void
}

type DragState = {
  startX: number
  startY: number
  startTime: number
  dir: 1 | -1
  moved: boolean
  // Direction was invalid (past the first/last page) — ignore on release,
  // don't reinterpret it as a tap.
  blocked: boolean
}

// Fraction of the card width a drag must cross to commit the flip.
const COMMIT_PROGRESS = 0.35
// A short, fast flick commits even if it didn't travel far.
const FLICK_MAX_MS = 260
const FLICK_MIN_PX = 40
const SETTLE_MS = 380

const Face = ({ children, back = false }: { children: React.ReactNode; back?: boolean }) => (
  <div
    className={cn(
      'invitation-flip-page absolute inset-0 h-full w-full select-none overflow-hidden bg-[#f8f1e4]',
      'shadow-[0_0.75rem_1.8rem_rgba(44,31,14,0.2)] [backface-visibility:hidden] [contain:layout_paint]',
      back && '[transform:rotateY(180deg)]',
    )}
  >
    {children}
  </div>
)

const isInteractiveTarget = (target: EventTarget | null) =>
  Boolean((target as HTMLElement | null)?.closest('a, button, input, textarea, select, label'))

/**
 * Flat, rigid card flip for mobile — the whole page rotates around its own
 * vertical center axis, like a flashcard, instead of react-pageflip's paper
 * curl (which only looks right in the 2-page landscape spread desktop gets).
 * Driven entirely by our own touch handling; independent of the desktop book.
 */
const MobileFlipBook = ({ pages, index, onChange }: MobileFlipBookProps) => {
  const stageRef = useRef<HTMLDivElement>(null)
  const flipperRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const angleRef = useRef(0)
  const dirRef = useRef<0 | 1 | -1>(0)

  const [dragDir, setDragDir] = useState<0 | 1 | -1>(0)
  const [animated, setAnimated] = useState(false)

  const last = pages.length - 1
  const canGo = (dir: 1 | -1) => (dir === 1 ? index < last : index > 0)
  const applyAngle = (nextAngle: number, transition = 'none') => {
    angleRef.current = nextAngle
    const flipper = flipperRef.current
    if (!flipper) return
    const sign = dirRef.current === -1 ? -1 : 1
    flipper.style.transition = transition
    flipper.style.transform = `translateZ(0) rotateY(${sign * nextAngle}deg)`
  }

  const beginFlip = (dir: 1 | -1) => {
    dirRef.current = dir
    setDragDir(dir)
    setAnimated(false)
    angleRef.current = 0
    const flipper = flipperRef.current
    if (!flipper) return
    flipper.style.transition = 'none'
    flipper.style.transform = 'translateZ(0) rotateY(0deg)'
  }

  const commit = () => {
    setAnimated(true)
    applyAngle(180, `transform ${SETTLE_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1)`)
  }

  const cancel = () => {
    setAnimated(true)
    applyAngle(0, `transform ${SETTLE_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1)`)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (animated || isInteractiveTarget(e.target)) return
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startTime: Date.now(),
      dir: 1,
      moved: false,
      blocked: false,
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag || drag.blocked || animated) return
    const dx = e.clientX - drag.startX
    const dy = e.clientY - drag.startY

    if (!drag.moved) {
      if (Math.abs(dx) < 6) return
      if (Math.abs(dy) > Math.abs(dx)) {
        drag.blocked = true
        return
      }
      const dir: 1 | -1 = dx < 0 ? 1 : -1
      if (!canGo(dir)) {
        drag.blocked = true
        return
      }
      drag.dir = dir
      drag.moved = true
      beginFlip(dir)
    }

    const width = stageRef.current?.clientWidth || 1
    const progress = Math.min(1, Math.abs(dx) / width)
    applyAngle(progress * 180)
  }

  const handleTap = (e: React.PointerEvent) => {
    if (isInteractiveTarget(e.target)) return
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return
    const dir: 1 | -1 = e.clientX - rect.left > rect.width / 2 ? 1 : -1
    if (!canGo(dir)) return
    beginFlip(dir)
    commit()
  }

  const finishDrag = (e: React.PointerEvent) => {
    if (animated) return
    const drag = dragRef.current
    dragRef.current = null
    if (drag?.blocked) return
    if (!drag?.moved) {
      handleTap(e)
      return
    }

    const dx = e.clientX - drag.startX
    const now = Date.now()
    const elapsed = now - drag.startTime
    const progress = Math.abs(dx) / (stageRef.current?.clientWidth || 1)
    const isFlick = elapsed < FLICK_MAX_MS && Math.abs(dx) > FLICK_MIN_PX

    if (progress > COMMIT_PROGRESS || isFlick) commit()
    else cancel()
  }

  const handlePointerCancel = () => {
    const drag = dragRef.current
    dragRef.current = null
    if (drag?.moved) cancel()
  }

  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (e.propertyName !== 'transform') return
    const completed = angleRef.current >= 180
    const dir = dirRef.current
    setAnimated(false)
    applyAngle(0)
    dirRef.current = 0
    setDragDir(0)
    if (completed && dir !== 0) onChange(index + dir)
  }

  const neighborIndex = dragDir === -1 ? Math.max(index - 1, 0) : Math.min(index + 1, last)
  const front = pages[index]?.content
  const back = pages[neighborIndex]?.content

  return (
    <div
      ref={stageRef}
      className='relative h-full w-full touch-pan-y select-none [perspective:2600px] [transform:translateZ(0)]'
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={handlePointerCancel}
    >
      <div
        ref={flipperRef}
        className='mfb-flipper absolute inset-0 [backface-visibility:hidden] [transform-style:preserve-3d]'
        style={{
          transform: 'translateZ(0) rotateY(0deg)',
          transition: 'none',
          willChange: 'transform',
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        <Face>{front}</Face>
        <Face back>{back}</Face>
      </div>
    </div>
  )
}

export default MobileFlipBook
