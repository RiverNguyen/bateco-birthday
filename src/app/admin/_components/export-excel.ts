import * as XLSX from 'xlsx-js-style'

type Row = {
  guestId: string
  stt: number
  category: string | null
  name: string
  honorific: string | null
  title: string | null
  unit: string | null
  department: string | null
  partner: string | null
  link: string
  partySize: number | null
  confirmedAt: string | null
}

const NAVY = '002352'
const GOLD = 'C29E4A'
const HEADER_FILL = '002352'
const STRIPE = 'F5F1E6'
const BORDER = 'D9D2C0'

const thin = { style: 'thin', color: { rgb: BORDER } } as const
const allBorders = { top: thin, bottom: thin, left: thin, right: thin }

const COLS: { key: keyof Row | 'status'; label: string; width: number }[] = [
  { key: 'stt', label: 'STT', width: 6 },
  { key: 'honorific', label: 'Danh xưng', width: 10 },
  { key: 'name', label: 'Họ và tên', width: 26 },
  { key: 'title', label: 'Chức danh', width: 34 },
  { key: 'unit', label: 'Đơn vị', width: 28 },
  { key: 'department', label: 'Bộ phận', width: 16 },
  { key: 'partner', label: 'Đi cùng', width: 12 },
  { key: 'partySize', label: 'Số người tham gia', width: 16 },
  { key: 'status', label: 'Trạng thái', width: 16 },
  { key: 'link', label: 'Link thiệp', width: 46 },
]

const titleStyle = {
  font: { bold: true, sz: 15, color: { rgb: NAVY } },
  alignment: { horizontal: 'center', vertical: 'center' },
}
const subtitleStyle = {
  font: { italic: true, sz: 11, color: { rgb: '7A6A3F' } },
  alignment: { horizontal: 'center', vertical: 'center' },
}
const headerStyle = {
  font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
  fill: { patternType: 'solid', fgColor: { rgb: HEADER_FILL } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: allBorders,
}

const cellStyle = (rowIndex: number, extra: Record<string, unknown> = {}) => ({
  font: { sz: 10 },
  alignment: { vertical: 'center', wrapText: true },
  fill: rowIndex % 2 === 0 ? { patternType: 'solid', fgColor: { rgb: STRIPE } } : undefined,
  border: allBorders,
  ...extra,
})

const buildSheet = (rows: Row[], title: string): XLSX.WorkSheet => {
  const lastCol = COLS.length - 1
  const aoa: unknown[][] = [
    [title],
    ['Lễ kỷ niệm 14 năm thành lập Tập đoàn Bateco'],
    [],
    COLS.map((col) => col.label),
    ...rows.map((row) =>
      COLS.map((col) => {
        if (col.key === 'status') return row.partySize === null ? 'Chưa xác nhận' : 'Đã xác nhận'
        if (col.key === 'partySize') return row.partySize ?? ''
        if (col.key === 'stt') return row.stt
        const value = row[col.key as keyof Row]
        return value ?? ''
      }),
    ),
  ]

  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = COLS.map((col) => ({ wch: col.width }))
  ws['!rows'] = [{ hpt: 26 }, { hpt: 18 }, { hpt: 6 }, { hpt: 30 }]
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } },
  ]
  ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 3, c: 0 }, e: { r: 3, c: lastCol } }) }
  ws['!freeze'] = { xSplit: 0, ySplit: 4, topLeftCell: 'A5', activePane: 'bottomLeft', state: 'frozen' }

  const at = (r: number, c: number) => ws[XLSX.utils.encode_cell({ r, c })]

  if (at(0, 0)) at(0, 0).s = titleStyle
  if (at(1, 0)) at(1, 0).s = subtitleStyle
  COLS.forEach((_, c) => {
    const cell = at(3, c)
    if (cell) cell.s = headerStyle
  })

  rows.forEach((row, i) => {
    const r = i + 4
    COLS.forEach((col, c) => {
      const cell = at(r, c)
      if (!cell) return
      const center = col.key === 'stt' || col.key === 'partySize' || col.key === 'status'
      const extra: Record<string, unknown> = {}
      if (center) extra.alignment = { horizontal: 'center', vertical: 'center' }
      if (col.key === 'name') extra.font = { sz: 10, bold: true }
      if (col.key === 'status') {
        extra.font = {
          sz: 10,
          bold: true,
          color: { rgb: row.partySize === null ? '9AA0A6' : '1E7A34' },
        }
      }
      if (col.key === 'link') {
        cell.l = { Target: String(cell.v || ''), Tooltip: 'Mở thiệp' }
        extra.font = { sz: 9, color: { rgb: '1155CC' }, underline: true }
      }
      cell.s = cellStyle(i, extra)
    })
  })

  return ws
}

const summarySheet = (rows: Row[]): XLSX.WorkSheet => {
  const byCat = new Map<string, Row[]>()
  for (const row of rows) {
    const key = row.category?.trim() || 'Khác'
    byCat.set(key, [...(byCat.get(key) ?? []), row])
  }

  const line = (label: string, list: Row[]) => {
    const confirmed = list.filter((r) => r.partySize !== null)
    return [
      label,
      list.length,
      confirmed.length,
      list.length - confirmed.length,
      confirmed.reduce((s, r) => s + (r.partySize ?? 0), 0),
    ]
  }

  const aoa: unknown[][] = [
    ['TỔNG HỢP XÁC NHẬN THAM DỰ'],
    [],
    ['Nhóm', 'Số khách', 'Đã xác nhận', 'Chưa xác nhận', 'Tổng số người dự'],
    ...[...byCat.entries()].map(([label, list]) => line(label, list)),
    line('TỔNG CỘNG', rows),
  ]

  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = [{ wch: 22 }, { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 18 }]
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }]
  const at = (r: number, c: number) => ws[XLSX.utils.encode_cell({ r, c })]
  if (at(0, 0)) at(0, 0).s = titleStyle
  for (let c = 0; c < 5; c += 1) if (at(2, c)) at(2, c).s = headerStyle
  const lastRow = aoa.length - 1
  for (let r = 3; r <= lastRow; r += 1) {
    for (let c = 0; c < 5; c += 1) {
      const cell = at(r, c)
      if (!cell) continue
      cell.s = {
        font: { sz: 10, bold: r === lastRow },
        alignment: { horizontal: c === 0 ? 'left' : 'center', vertical: 'center' },
        fill: r === lastRow ? { patternType: 'solid', fgColor: { rgb: GOLD } } : undefined,
        border: allBorders,
      }
    }
  }
  return ws
}

/** Xuất file Excel đã định dạng: 1 sheet/nhóm + 1 sheet tổng hợp. */
export const exportGuestsExcel = (rows: Row[]) => {
  const byCat = new Map<string, Row[]>()
  for (const row of rows) {
    const key = row.category?.trim() || 'Khác'
    byCat.set(key, [...(byCat.get(key) ?? []), row])
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, summarySheet(rows), 'Tổng hợp')
  for (const [category, list] of byCat) {
    const sheet = buildSheet(list, `DANH SÁCH KHÁCH MỜI – ${category.toUpperCase()}`)
    XLSX.utils.book_append_sheet(wb, sheet, category.slice(0, 31))
  }

  const stamp = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `Danh sach khach moi - ${stamp}.xlsx`)
}
