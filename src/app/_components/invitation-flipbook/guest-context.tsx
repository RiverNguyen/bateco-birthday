'use client'

import { createContext, useContext } from 'react'

import type { Guest } from '@/lib/guest'

const GuestContext = createContext<Guest | null>(null)

export const GuestProvider = GuestContext.Provider

/** The current guest decoded from the invite link, or `null` for the generic invitation. */
export function useGuest() {
  return useContext(GuestContext)
}
