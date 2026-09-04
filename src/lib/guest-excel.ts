import type { Guest } from '@/lib/guest'

/**
 * Turns a raw sheet matrix (rows of cell values, from SheetJS or the Microsoft
 * Graph Excel API) into `Guest` rows. Shared by the admin upload flow and the
 * "write back to SharePoint" API so column detection stays identical.
 */

/** Strip accents + lowercase so header matching survives typos and casing. */
export const normalizeHeader = (value: unknown): string =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim()

const COLUMN_MATCHERS: { key: keyof Guest; test: (header: string) => boolean }[] = [
  { key: 'name', test: (h) => h.includes('ho va ten') || h.includes('ho ten') },
  { key: 'honorific', test: (h) => h.includes('danh xung') },
  { key: 'title', test: (h) => h.includes('chuc danh') },
  { key: 'unit', test: (h) => h.includes('don vi') },
  { key: 'department', test: (h) => h.includes('bo phan') },
  { key: 'partner', test: (h) => h.includes('phu nhan') || h.includes('phu quan') },
]

export const LINK_HEADER = 'Link thiệp'

const isNameHeader = (cell: unknown) => {
  const h = normalizeHeader(cell)
  return h.includes('ho va ten') || h.includes('ho ten')
}

/** Index of the row that holds the column headers, or -1. */
export const findHeaderRow = (matrix: unknown[][]): number =>
  matrix.findIndex((row) => Array.isArray(row) && row.some(isNameHeader))

export type ColumnIndex = Record<keyof Guest, number>

export const detectColumns = (headerRow: unknown[]): ColumnIndex => {
  const headers = headerRow.map(normalizeHeader)
  const columnIndex = {} as ColumnIndex
  for (const { key, test } of COLUMN_MATCHERS) {
    columnIndex[key] = headers.findIndex((header) => test(header))
  }
  return columnIndex
}

export const readGuestRow = (row: unknown[], columnIndex: ColumnIndex): Guest | null => {
  const cell = (key: keyof Guest) => {
    const index = columnIndex[key]
    return index >= 0 ? String(row?.[index] ?? '').trim() : ''
  }
  const name = cell('name')
  if (!name) return null
  return {
    name,
    honorific: cell('honorific') || undefined,
    title: cell('title') || undefined,
    unit: cell('unit') || undefined,
    department: cell('department') || undefined,
    partner: cell('partner') || undefined,
  }
}

export type ParsedSheet = {
  headerRowIndex: number
  columnIndex: ColumnIndex
  /** Existing "Link thiệp" column index, or -1 if the sheet has none yet. */
  linkColumnIndex: number
  /** One entry per data row that has a name, with its absolute row index in the matrix. */
  guests: { rowIndex: number; guest: Guest }[]
}

export const parseSheetMatrix = (matrix: unknown[][]): ParsedSheet => {
  const headerRowIndex = findHeaderRow(matrix)
  if (headerRowIndex === -1) {
    throw new Error('Không tìm thấy cột "Họ và tên" trong file.')
  }
  const headerRow = matrix[headerRowIndex]
  const columnIndex = detectColumns(headerRow)
  const linkColumnIndex = headerRow.findIndex(
    (cell) => normalizeHeader(cell) === normalizeHeader(LINK_HEADER),
  )

  const guests: { rowIndex: number; guest: Guest }[] = []
  for (let rowIndex = headerRowIndex + 1; rowIndex < matrix.length; rowIndex += 1) {
    const guest = readGuestRow(matrix[rowIndex] ?? [], columnIndex)
    if (guest) guests.push({ rowIndex, guest })
  }

  return { headerRowIndex, columnIndex, linkColumnIndex, guests }
}
