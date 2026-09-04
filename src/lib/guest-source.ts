import { unstable_cache } from 'next/cache'

import staticGuests from '@/data/guests.json'
import { buildGuestMap, type GuestMap } from '@/lib/guest'
import { parseSheetMatrix } from '@/lib/guest-excel'
import {
  createGraphClient,
  findWorkbookItem,
  getGraphConfig,
  getGraphToken,
  workbookBase,
} from '@/lib/ms-graph'

type UsedRange = { values: unknown[][] }

/** Reads the guest list straight from the SharePoint workbook via Microsoft Graph. */
const fetchGuestMapFromGraph = async (): Promise<GuestMap> => {
  const config = getGraphConfig()
  const token = await getGraphToken(config)
  const graph = createGraphClient(token)

  const item = await findWorkbookItem(graph, config)
  const base = workbookBase(config, item.id)

  const worksheets = await graph<{ value: { id: string; position: number }[] }>(
    `${base}/worksheets?$select=id,position`,
  )
  const sheet = [...worksheets.value].sort((a, b) => a.position - b.position)[0]
  if (!sheet) throw new Error('Workbook không có sheet nào.')

  const used = await graph<UsedRange>(
    `${base}/worksheets/${sheet.id}/usedRange(valuesOnly=true)?$select=values`,
  )
  return buildGuestMap(parseSheetMatrix(used.values).guests.map(({ guest }) => guest))
}

export const GUEST_MAP_TAG = 'guest-map'

/** Cached for 5 minutes so invite pages don't hit Graph on every request. */
const cachedGraphGuestMap = unstable_cache(fetchGuestMapFromGraph, ['guest-map-graph'], {
  revalidate: 300,
  tags: [GUEST_MAP_TAG],
})

/**
 * The guest lookup used by invite pages. Prefers the live SharePoint sheet (so
 * editing the Excel is enough — no redeploy); falls back to the committed
 * `src/data/guests.json` if Graph isn't configured or is unreachable.
 */
export const getGuestMap = async (): Promise<GuestMap> => {
  const fallback = staticGuests as GuestMap
  try {
    if (!process.env.MS_GRAPH_CLIENT_ID) return fallback
    const live = await cachedGraphGuestMap()
    return Object.keys(live).length > 0 ? { ...fallback, ...live } : fallback
  } catch (error) {
    console.error('[guest-source] Graph read failed, using static guests.json:', error)
    return fallback
  }
}
