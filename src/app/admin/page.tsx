'use client'

import { useMemo, useRef, useState } from 'react'
import * as XLSX from 'xlsx'

import { buildGuestMap, buildInviteLink, guestId, type Guest } from '@/lib/guest'
import {
  LINK_HEADER,
  detectColumns,
  findHeaderRow,
  parseSheetMatrix,
  readGuestRow,
} from '@/lib/guest-excel'

type Row = Guest & { id: string; link: string }

const parseGuests = (data: ArrayBuffer): Guest[] => {
  const workbook = XLSX.read(data, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false })
  return parseSheetMatrix(matrix).guests.map(({ guest }) => guest)
}

const downloadJson = (data: unknown, name: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}

type PushResult = {
  ok: boolean
  error?: string
  file?: string
  webUrl?: string
  sheet?: string
  column?: string
  appended?: boolean
  updated?: number
  duplicateIds?: string[]
  guestMap?: Record<string, Guest>
}

const AdminPage = () => {
  const [origin, setOrigin] = useState('')
  const [guests, setGuests] = useState<Guest[]>([])
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [hasFile, setHasFile] = useState(false)
  const [pushing, setPushing] = useState(false)
  const [push, setPush] = useState<PushResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const bufferRef = useRef<ArrayBuffer | null>(null)

  if (!origin && typeof window !== 'undefined') {
    setOrigin(window.location.origin)
  }

  const rows: Row[] = useMemo(
    () =>
      guests.map((guest) => ({
        ...guest,
        id: guestId(guest),
        link: buildInviteLink(guest, origin),
      })),
    [guests, origin],
  )

  const duplicateIds = useMemo(() => {
    const seen = new Set<string>()
    const dupes = new Set<string>()
    for (const row of rows) {
      if (seen.has(row.id)) dupes.add(row.id)
      seen.add(row.id)
    }
    return dupes
  }, [rows])

  const handleFile = async (file: File) => {
    setError('')
    setFileName(file.name)
    try {
      const buffer = await file.arrayBuffer()
      const parsed = parseGuests(buffer)
      if (parsed.length === 0) throw new Error('File không có dòng khách nào hợp lệ.')
      bufferRef.current = buffer
      setHasFile(true)
      setGuests(parsed)
    } catch (err) {
      bufferRef.current = null
      setHasFile(false)
      setGuests([])
      setError(err instanceof Error ? err.message : 'Không đọc được file.')
    }
  }

  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied((current) => (current === id ? null : current)), 1500)
  }

  /** Re-open the uploaded workbook, add a "Link thiệp" column, download the copy. */
  const downloadExcelWithLinks = () => {
    if (!bufferRef.current) return
    const workbook = XLSX.read(bufferRef.current, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 })

    const headerRowIndex = findHeaderRow(matrix)
    if (headerRowIndex === -1) return
    const columnIndex = detectColumns(matrix[headerRowIndex])
    const linkColIndex = matrix[headerRowIndex].length

    XLSX.utils.sheet_add_aoa(sheet, [[LINK_HEADER]], {
      origin: { r: headerRowIndex, c: linkColIndex },
    })
    for (let r = headerRowIndex + 1; r < matrix.length; r += 1) {
      const guest = readGuestRow(matrix[r] ?? [], columnIndex)
      if (guest) {
        XLSX.utils.sheet_add_aoa(sheet, [[buildInviteLink(guest, origin)]], {
          origin: { r, c: linkColIndex },
        })
      }
    }
    XLSX.writeFile(workbook, fileName.replace(/\.[^.]+$/, '') + ' - co-link.xlsx')
  }

  const pushToSharePoint = async () => {
    setPushing(true)
    setPush(null)
    try {
      const response = await fetch('/api/push-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin }),
      })
      const result = (await response.json()) as PushResult
      setPush(result)
      if (result.ok && result.guestMap) {
        setGuests(Object.values(result.guestMap))
      }
    } catch (err) {
      setPush({ ok: false, error: err instanceof Error ? err.message : 'Lỗi mạng.' })
    } finally {
      setPushing(false)
    }
  }

  return (
    <main className='mx-auto max-w-5xl px-6 py-10 font-sans text-[#1f2937]'>
      <h1 className='text-2xl font-bold'>Tạo link thiệp mời</h1>
      <p className='mt-1 text-sm text-gray-500'>
        Link mỗi người có dạng <code className='rounded bg-gray-100 px-1'>/ho-ten-idngan</code>.
      </p>

      <label className='mt-6 flex max-w-md flex-col gap-1 text-sm'>
        <span className='font-medium text-gray-700'>Tên miền dùng cho link</span>
        <input
          value={origin}
          onChange={(event) => setOrigin(event.target.value.replace(/\/$/, ''))}
          placeholder='https://thiep.bateco.com.vn'
          className='rounded-md border border-gray-300 px-3 py-2'
        />
      </label>

      <section className='mt-6 rounded-lg border border-gray-200 p-4'>
        <h2 className='font-semibold'>Ghi thẳng cột link vào file SharePoint</h2>
        <p className='mt-1 text-sm text-gray-500'>
          Thêm / cập nhật cột <b>{LINK_HEADER}</b> trong file Excel online (đã cấu hình qua
          Microsoft Graph). Không cần tải file lên.
        </p>
        <button
          type='button'
          onClick={pushToSharePoint}
          disabled={pushing}
          className='mt-3 rounded-md bg-[#002352] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50'
        >
          {pushing ? 'Đang ghi…' : 'Ghi cột link vào file SharePoint'}
        </button>

        {push && push.ok && (
          <div className='mt-3 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800'>
            Đã {push.appended ? 'thêm' : 'cập nhật'} cột <b>{push.column}</b> ({push.updated} khách)
            trong sheet <b>{push.sheet}</b> của <b>{push.file}</b>.{' '}
            {push.webUrl && (
              <a
                href={push.webUrl}
                target='_blank'
                rel='noreferrer'
                className='underline'
              >
                Mở file
              </a>
            )}
          </div>
        )}
        {push && !push.ok && (
          <p className='mt-3 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700'>{push.error}</p>
        )}
      </section>

      <section className='mt-6 rounded-lg border border-gray-200 p-4'>
        <h2 className='font-semibold'>Hoặc tải file Excel lên</h2>
        <div className='mt-3 flex flex-wrap items-center gap-3'>
          <button
            type='button'
            onClick={() => inputRef.current?.click()}
            className='rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50'
          >
            Chọn file Excel
          </button>
          <input
            ref={inputRef}
            type='file'
            accept='.xlsx,.xls,.csv'
            className='hidden'
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void handleFile(file)
              event.target.value = ''
            }}
          />
          {fileName && <span className='text-sm text-gray-600'>{fileName}</span>}
          {hasFile && rows.length > 0 && (
            <button
              type='button'
              onClick={downloadExcelWithLinks}
              className='rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50'
            >
              Tải Excel kèm cột link
            </button>
          )}
        </div>
      </section>

      {error && <p className='mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700'>{error}</p>}

      {rows.length > 0 && (
        <>
          <div className='mt-6 flex flex-wrap items-center gap-3'>
            <button
              type='button'
              onClick={() => downloadJson(buildGuestMap(guests), 'guests.json')}
              className='rounded-md bg-[#002352] px-4 py-2 text-sm font-medium text-white hover:opacity-90'
            >
              Tải guests.json ({rows.length})
            </button>
            <span className='text-xs text-gray-500'>
              Đặt vào <code className='rounded bg-gray-100 px-1'>src/data/guests.json</code> rồi
              deploy lại thì link mới hoạt động.
            </span>
          </div>

          {duplicateIds.size > 0 && (
            <p className='mt-3 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800'>
              Có {duplicateIds.size} id bị trùng (khách trùng cả tên lẫn chức danh). Thêm chi tiết
              phân biệt (đơn vị / bộ phận) để mỗi người một link riêng.
            </p>
          )}

          <div className='mt-4 overflow-x-auto rounded-lg border border-gray-200'>
            <table className='w-full border-collapse text-sm'>
              <thead className='bg-gray-50 text-left'>
                <tr>
                  <th className='px-3 py-2 font-semibold'>#</th>
                  <th className='px-3 py-2 font-semibold'>Khách mời</th>
                  <th className='px-3 py-2 font-semibold'>Chức danh</th>
                  <th className='px-3 py-2 font-semibold'>Đi cùng</th>
                  <th className='px-3 py-2 font-semibold'>Link</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.id + index}
                    className='border-t border-gray-100 align-top'
                  >
                    <td className='px-3 py-2 text-gray-400'>{index + 1}</td>
                    <td className='px-3 py-2'>
                      <div className='font-medium'>
                        {[row.honorific, row.name].filter(Boolean).join(' ')}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {[row.unit, row.department].filter(Boolean).join(' - ')}
                      </div>
                    </td>
                    <td className='px-3 py-2 text-gray-600'>{row.title}</td>
                    <td className='px-3 py-2 text-gray-600'>{row.partner}</td>
                    <td className='px-3 py-2'>
                      <div className='flex items-center gap-2'>
                        <a
                          href={row.link}
                          target='_blank'
                          rel='noreferrer'
                          className='max-w-[22rem] truncate text-[#002352] underline'
                        >
                          {row.link}
                        </a>
                        <button
                          type='button'
                          onClick={() => void copy(row.link, row.id)}
                          className='shrink-0 rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50'
                        >
                          {copied === row.id ? 'Đã chép' : 'Chép'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  )
}

export default AdminPage
