import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

import { buildGuestMap, buildInviteLink, guestId } from '@/lib/guest'
import { LINK_HEADER, parseSheetMatrix } from '@/lib/guest-excel'
import { GUEST_MAP_TAG } from '@/lib/guest-source'
import {
  columnLetter,
  createGraphClient,
  findWorkbookItem,
  getGraphConfig,
  getGraphToken,
  workbookBase,
} from '@/lib/ms-graph'

type UsedRange = {
  values: unknown[][]
  rowIndex: number
  columnIndex: number
  rowCount: number
  columnCount: number
}

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { origin } = (await request.json().catch(() => ({}))) as { origin?: string }
    const linkOrigin = (origin ?? '').replace(/\/$/, '')

    const config = getGraphConfig()
    const token = await getGraphToken(config)
    const graph = createGraphClient(token)

    const item = await findWorkbookItem(graph, config)
    const base = workbookBase(config, item.id)

    const worksheets = await graph<{ value: { id: string; name: string; position: number }[] }>(
      `${base}/worksheets?$select=id,name,position`,
    )
    const sheet = [...worksheets.value].sort((a, b) => a.position - b.position)[0]
    if (!sheet) throw new Error('Workbook không có sheet nào.')

    const used = await graph<UsedRange>(
      `${base}/worksheets/${sheet.id}/usedRange(valuesOnly=true)?$select=values,rowIndex,columnIndex,rowCount,columnCount`,
    )

    const parsed = parseSheetMatrix(used.values)
    if (parsed.guests.length === 0) throw new Error('Không có dòng khách hợp lệ trong sheet.')

    // Column to write: reuse an existing "Link thiệp" column, else append one.
    const relTargetCol =
      parsed.linkColumnIndex >= 0 ? parsed.linkColumnIndex : used.columnCount
    const absTargetCol = used.columnIndex + relTargetCol
    const letter = columnLetter(absTargetCol)

    const firstRel = parsed.headerRowIndex
    const lastRel = parsed.guests[parsed.guests.length - 1].rowIndex
    const linkByRel = new Map<number, string>()
    for (const { rowIndex, guest } of parsed.guests) {
      linkByRel.set(rowIndex, buildInviteLink(guest, linkOrigin))
    }

    // One rectangular column write. `null` leaves a cell untouched (gap rows).
    const values: (string | null)[][] = []
    for (let rel = firstRel; rel <= lastRel; rel += 1) {
      if (rel === parsed.headerRowIndex) values.push([LINK_HEADER])
      else values.push([linkByRel.get(rel) ?? null])
    }

    const startAbsRow = used.rowIndex + firstRel + 1
    const endAbsRow = used.rowIndex + lastRel + 1
    const address = `${letter}${startAbsRow}:${letter}${endAbsRow}`

    await graph(`${base}/worksheets/${sheet.id}/range(address='${address}')`, {
      method: 'PATCH',
      body: JSON.stringify({ values }),
    })

    // Invite pages read the sheet through a cached Graph call — bust it now so
    // freshly added guests resolve immediately.
    revalidateTag(GUEST_MAP_TAG, { expire: 0 })

    const guests = parsed.guests.map(({ guest }) => guest)
    return NextResponse.json({
      ok: true,
      file: item.name,
      webUrl: item.webUrl,
      sheet: sheet.name,
      column: letter,
      appended: parsed.linkColumnIndex < 0,
      updated: parsed.guests.length,
      duplicateIds: [...new Set(guests.map(guestId).filter((id, i, all) => all.indexOf(id) !== i))],
      guestMap: buildGuestMap(guests),
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Lỗi không xác định.' },
      { status: 500 },
    )
  }
}
