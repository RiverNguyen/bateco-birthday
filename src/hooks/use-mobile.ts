import * as React from 'react'

const MOBILE_BREAKPOINT = 640
const TABLET_BREAKPOINT = 1025
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
const TABLET_QUERY = `(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`

function subscribeToQuery(query: string, onStoreChange: () => void) {
  const mql = window.matchMedia(query)
  mql.addEventListener('change', onStoreChange)
  return () => mql.removeEventListener('change', onStoreChange)
}

function getQuerySnapshot(query: string) {
  return window.matchMedia(query).matches
}

function getServerSnapshot() {
  return false
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    (onStoreChange) => subscribeToQuery(MOBILE_QUERY, onStoreChange),
    () => getQuerySnapshot(MOBILE_QUERY),
    getServerSnapshot,
  )
}

export function useIsTablet() {
  return React.useSyncExternalStore(
    (onStoreChange) => subscribeToQuery(TABLET_QUERY, onStoreChange),
    () => getQuerySnapshot(TABLET_QUERY),
    getServerSnapshot,
  )
}
