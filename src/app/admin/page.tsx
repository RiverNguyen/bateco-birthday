'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

import GuestTable, { type GuestRow } from '@/app/admin/_components/guest-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { inviteUrl, uniqueInviteSlug, type Guest } from '@/lib/guest'
import {
  LINK_HEADER,
  PARTNER_LINK_HEADER,
  findHeaderRow,
  normalizeHeader,
  parseSheetMatrix,
  sheetHasGuestList,
} from '@/lib/guest-excel'

/** Ưu tiên tên nhóm quen thuộc, còn lại dùng chính tên sheet có danh sách khách. */
const categoryOfSheet = (sheetName: string): string => {
  const n = normalizeHeader(sheetName)
  if (n.includes('noi bo')) return 'Nội bộ'
  if (n.includes('khach')) return 'Khách'
  return sheetName
}

const parseGuests = (data: ArrayBuffer): Guest[] => {
  const workbook = XLSX.read(data, { type: 'array' })
  const all: Guest[] = []
  for (const sheetName of workbook.SheetNames) {
    const category = categoryOfSheet(sheetName)
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], {
      header: 1,
      blankrows: false,
    })
    if (!sheetHasGuestList(matrix)) continue
    all.push(...parseSheetMatrix(matrix, category).guests.map(({ guest }) => guest))
  }
  return all
}

const AdminPage = () => {
  const [origin, setOrigin] = useState('')
  const [rows, setRows] = useState<GuestRow[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fileName, setFileName] = useState('')
  const [hasFile, setHasFile] = useState(false)
  const [replaceAll, setReplaceAll] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const bufferRef = useRef<ArrayBuffer | null>(null)

  if (!origin && typeof window !== 'undefined') {
    setOrigin(window.location.origin)
  }

  const loadDb = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/guests', { cache: 'no-store' })
      const result = (await response.json()) as { ok: boolean; error?: string; guests?: GuestRow[] }
      if (!result.ok) throw new Error(result.error ?? 'Lỗi.')
      setRows(result.guests ?? [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không tải được danh sách.')
    } finally {
      setLoading(false)
    }
  }, [])

  const saveGuestsToDb = useCallback(
    async (list: Guest[], replace: boolean) => {
      setSaving(true)
      try {
        const response = await fetch('/api/guests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ origin, guests: list, replace }),
        })
        const result = (await response.json()) as {
          ok: boolean
          error?: string
          replaced?: boolean
          added?: number
        }
        if (!result.ok) throw new Error(result.error ?? 'Lỗi.')
        toast.success(
          result.replaced
            ? `Đã nạp lại danh sách: ${result.added} khách.`
            : `Đã thêm ${result.added} khách mới (giữ nguyên khách cũ).`,
        )
        await loadDb()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Không lưu được danh sách vào DB.')
      } finally {
        setSaving(false)
      }
    },
    [origin, loadDb],
  )

  const handleFile = async (file: File) => {
    setFileName(file.name)
    try {
      const buffer = await file.arrayBuffer()
      const parsed = parseGuests(buffer)
      if (parsed.length === 0) throw new Error('File không có dòng khách nào hợp lệ.')
      bufferRef.current = buffer
      setHasFile(true)
      await saveGuestsToDb(parsed, replaceAll)
    } catch (err) {
      bufferRef.current = null
      setHasFile(false)
      toast.error(err instanceof Error ? err.message : 'Không đọc được file.')
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDb()
  }, [loadDb])

  /** Mở lại file đã upload, thêm cột "Link thiệp" vào 2 tab, tải bản sao xuống. */
  const downloadExcelWithLinks = () => {
    if (!bufferRef.current) return
    const workbook = XLSX.read(bufferRef.current, { type: 'array' })
    const takenSlugs = new Set<string>()

    for (const sheetName of workbook.SheetNames) {
      const category = categoryOfSheet(sheetName)
      const sheet = workbook.Sheets[sheetName]
      const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 })
      const headerRowIndex = findHeaderRow(matrix)
      if (headerRowIndex === -1) continue
      const linkColIndex = matrix[headerRowIndex].length
      const parsed = parseSheetMatrix(matrix, category)
      const linksByRow = new Map<number, string[]>()
      for (const { rowIndex, guest } of parsed.guests) {
        const link = inviteUrl(uniqueInviteSlug(guest.name, takenSlugs), origin)
        linksByRow.set(rowIndex, [...(linksByRow.get(rowIndex) ?? []), link])
      }

      XLSX.utils.sheet_add_aoa(sheet, [[LINK_HEADER, PARTNER_LINK_HEADER]], {
        origin: { r: headerRowIndex, c: linkColIndex },
      })
      for (let r = headerRowIndex + 1; r < matrix.length; r += 1) {
        const [guestLink, partnerGuestLink] = linksByRow.get(r) ?? []
        if (guestLink) {
          XLSX.utils.sheet_add_aoa(
            sheet,
            [[guestLink, partnerGuestLink ?? '']],
            { origin: { r, c: linkColIndex } },
          )
        }
      }
    }
    XLSX.writeFile(workbook, fileName.replace(/\.[^.]+$/, '') + ' - co-link.xlsx')
  }

  return (
    <main className='mx-auto max-w-[90rem] px-6 py-10 font-mono text-[#1f2937]'>
      <h1 className='text-2xl font-bold'>Danh sách khách mời &amp; link thiệp</h1>
      <p className='mt-1 text-sm text-gray-500'>
        Tải file Excel lên — hệ thống tự lưu vào DB, sinh link dạng{' '}
        <code className='rounded bg-gray-100 px-1'>/ho-ten-idngan</code> cho mỗi người.
      </p>

      <label className='mt-6 flex max-w-md flex-col gap-1 text-sm'>
        <span className='font-medium text-gray-700'>Tên miền dùng cho link</span>
        <Input
          value={origin}
          onChange={(event) => setOrigin(event.target.value.replace(/\/$/, ''))}
          placeholder='https://thiep.bateco.com.vn'
        />
      </label>

      <section className='mt-6 rounded-lg border border-gray-200 p-4'>
        <h2 className='font-semibold'>Tải file Excel danh sách khách</h2>
        <div className='mt-3 flex flex-wrap items-center gap-3'>
          <Button
            onClick={() => inputRef.current?.click()}
            disabled={saving}
          >
            {saving ? 'Đang lưu…' : 'Chọn file Excel'}
          </Button>
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
          {hasFile && (
            <Button
              variant='outline'
              onClick={downloadExcelWithLinks}
            >
              Tải Excel kèm cột link
            </Button>
          )}
        </div>
        <label className='mt-3 flex items-center gap-2 text-sm text-gray-700'>
          <input
            type='checkbox'
            checked={replaceAll}
            onChange={(event) => setReplaceAll(event.target.checked)}
            className='size-4'
          />
          Xoá danh sách cũ trước khi nạp (đánh lại STT từ 1)
        </label>
        <p className='mt-2 text-xs text-gray-500'>
          Mặc định chỉ <b>thêm người mới</b> — khách cũ và xác nhận của họ được giữ nguyên. Tích ô
          trên nếu muốn nạp lại từ đầu.
        </p>
      </section>

      <div className='mt-8'>
        <GuestTable
          rows={rows}
          loading={loading}
          origin={origin}
          onRefresh={loadDb}
        />
      </div>
    </main>
  )
}

export default AdminPage
