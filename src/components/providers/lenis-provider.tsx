'use client'

import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function LenisProvider({ children }: Props) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  )
}
