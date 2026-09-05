'use client'

import { CheckIcon, DownloadIcon, SearchIcon, Trash2Icon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'
import { toast } from 'sonner'

import { exportGuestsExcel } from '@/app/admin/_components/export-excel'
import GuestFormDialog from '@/app/admin/_components/guest-form-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export type GuestRow = {
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

const PAGE_SIZE = 10

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd').toLowerCase()

const chartConfig = {
  count: { label: 'Số khách', color: '#002352' },
} satisfies ChartConfig

type Props = {
  rows: GuestRow[]
  loading: boolean
  origin: string
  onRefresh: () => void
}

const StatCard = ({ label, value, hint }: { label: string; value: number; hint?: string }) => (
  <div className='rounded-lg border border-gray-200 p-4'>
    <p className='text-xs font-medium tracking-wide text-gray-500 uppercase'>{label}</p>
    <p className='mt-1 text-2xl font-bold'>{value}</p>
    {hint && <p className='text-xs text-gray-400'>{hint}</p>}
  </div>
)

const CATEGORY_FALLBACK = 'Khác'
const catOf = (row: GuestRow) => row.category?.trim() || CATEGORY_FALLBACK

const GuestTable = ({ rows, loading, origin, onRefresh }: Props) => {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('all')
  const [status, setStatus] = useState<'all' | 'confirmed' | 'pending'>('all')
  const [page, setPage] = useState(1)
  const [copied, setCopied] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const deleteGuest = async (guestId: string) => {
    setDeletingId(guestId)
    try {
      const response = await fetch(`/api/guests/${guestId}`, { method: 'DELETE' })
      const result = (await response.json()) as { ok: boolean; error?: string }
      if (!result.ok) throw new Error(result.error ?? 'Lỗi.')
      toast.success('Đã xoá khách.')
      onRefresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không xoá được khách.')
    } finally {
      setDeletingId(null)
    }
  }

  const categories = useMemo(() => {
    const seen = new Map<string, number>()
    for (const row of rows) seen.set(catOf(row), (seen.get(catOf(row)) ?? 0) + 1)
    return [...seen.entries()]
  }, [rows])

  const scoped = useMemo(
    () => (tab === 'all' ? rows : rows.filter((row) => catOf(row) === tab)),
    [rows, tab],
  )

  const stats = useMemo(() => {
    const confirmed = scoped.filter((row) => row.partySize !== null)
    return {
      total: scoped.length,
      confirmed: confirmed.length,
      pending: scoped.length - confirmed.length,
      people: confirmed.length,
    }
  }, [scoped])

  const chartData = useMemo(
    () => [
      { bucket: 'Chưa xác nhận', count: stats.pending },
      { bucket: 'Đã xác nhận', count: stats.confirmed },
    ],
    [stats],
  )

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    return scoped.filter((row) => {
      if (status === 'confirmed' && row.partySize === null) return false
      if (status === 'pending' && row.partySize !== null) return false
      if (!q) return true
      return normalize(
        `${row.honorific ?? ''} ${row.name} ${row.title ?? ''} ${row.unit ?? ''}`,
      ).includes(q)
    })
  }, [scoped, query, status])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const pageRows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  const showGroupColumn = tab === 'all' && categories.length > 1
  const columnCount = (showGroupColumn ? 5 : 4) + 1
  const categoryNames = categories.map(([name]) => name)

  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied((value) => (value === id ? null : value)), 1500)
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <StatCard
          label='Tổng khách'
          value={stats.total}
        />
        <StatCard
          label='Đã xác nhận'
          value={stats.confirmed}
          hint={`${stats.total ? Math.round((stats.confirmed / stats.total) * 100) : 0}%`}
        />
        <StatCard
          label='Chưa xác nhận'
          value={stats.pending}
        />
        <StatCard
          label='Số người đã xác nhận'
          value={stats.people}
        />
      </div>

      <div className='rounded-lg border border-gray-200 p-4'>
        <p className='mb-2 text-sm font-semibold'>Thống kê xác nhận</p>
        <ChartContainer
          config={chartConfig}
          className='aspect-[3/1] w-full'
        >
          <BarChart
            data={chartData}
            layout='vertical'
            margin={{ left: 12, right: 32 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis
              type='number'
              allowDecimals={false}
            />
            <YAxis
              type='category'
              dataKey='bucket'
              width={150}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey='count'
              fill='var(--color-count)'
              radius={4}
            >
              <LabelList
                dataKey='count'
                position='right'
                className='fill-foreground'
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      {categories.length > 1 && (
        <div className='flex flex-wrap gap-2'>
          <Button
            variant={tab === 'all' ? 'default' : 'outline'}
            size='sm'
            onClick={() => {
              setTab('all')
              setPage(1)
            }}
          >
            Tất cả ({rows.length})
          </Button>
          {categories.map(([name, count]) => (
            <Button
              key={name}
              variant={tab === name ? 'default' : 'outline'}
              size='sm'
              onClick={() => {
                setTab(name)
                setPage(1)
              }}
            >
              {name} ({count})
            </Button>
          ))}
        </div>
      )}

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex flex-wrap items-center gap-2'>
          <div className='relative w-full max-w-xs'>
            <SearchIcon className='absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-gray-400' />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
              placeholder='Tìm theo tên, chức danh, đơn vị…'
              className='pl-8'
            />
          </div>
          {(
            [
              ['all', `Tất cả (${stats.total})`],
              ['confirmed', `Đã xác nhận (${stats.confirmed})`],
              ['pending', `Chưa xác nhận (${stats.pending})`],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              variant={status === value ? 'default' : 'outline'}
              size='sm'
              onClick={() => {
                setStatus(value)
                setPage(1)
              }}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className='flex gap-2'>
          <GuestFormDialog
            origin={origin}
            categories={categoryNames}
            onSaved={onRefresh}
          />
          <Button
            variant='outline'
            size='sm'
            onClick={() => exportGuestsExcel(rows)}
            disabled={rows.length === 0}
          >
            <DownloadIcon className='size-4' />
            Xuất Excel
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? 'Đang tải…' : 'Làm mới'}
          </Button>
        </div>
      </div>

      <div className='rounded-lg border border-gray-200'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-12'>STT</TableHead>
              {showGroupColumn && <TableHead className='w-28'>Nhóm</TableHead>}
              <TableHead>Họ tên</TableHead>
              <TableHead>Link</TableHead>
              <TableHead className='w-40 text-center'>Xác nhận</TableHead>
              <TableHead className='w-32 text-right'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className='py-8 text-center text-sm text-gray-500'
                >
                  {rows.length === 0
                    ? 'Chưa có khách trong DB. Tải file Excel lên để nạp danh sách.'
                    : 'Không tìm thấy khách phù hợp.'}
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row) => (
                <TableRow key={row.guestId}>
                  <TableCell className='text-gray-400'>{row.stt}</TableCell>
                  {showGroupColumn && (
                    <TableCell>
                      <Badge variant='outline'>{catOf(row)}</Badge>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className='font-medium'>
                      {[row.honorific, row.name].filter(Boolean).join(' ')}
                    </div>
                    {(row.title || row.unit) && (
                      <div className='text-xs text-gray-500'>
                        {[row.title, row.unit].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <a
                        href={row.link}
                        target='_blank'
                        rel='noreferrer'
                        className='max-w-[18rem] truncate text-[#002352] underline'
                      >
                        {row.link}
                      </a>
                      <Button
                        variant='outline'
                        size='sm'
                        className='h-7 px-2 text-xs'
                        onClick={() => void copy(row.link, row.guestId)}
                      >
                        {copied === row.guestId ? <CheckIcon className='size-3.5' /> : 'Chép'}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    {row.partySize === null ? (
                      <span className='text-gray-400'>Chưa xác nhận</span>
                    ) : (
                      <Badge variant='secondary'>Đã xác nhận</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='flex justify-end gap-1'>
                      <GuestFormDialog
                        origin={origin}
                        categories={categoryNames}
                        onSaved={onRefresh}
                        guest={{
                          guestId: row.guestId,
                          category: row.category ?? '',
                          honorific: row.honorific ?? '',
                          name: row.name,
                          title: row.title ?? '',
                          unit: row.unit ?? '',
                          department: row.department ?? '',
                          partner: row.partner ?? '',
                        }}
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-7 px-2 text-xs text-red-600 hover:text-red-700'
                            disabled={deletingId === row.guestId}
                          >
                            <Trash2Icon className='size-3.5' />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xoá khách này?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Xoá <b>{[row.honorific, row.name].filter(Boolean).join(' ')}</b> khỏi
                              danh sách. Xác nhận tham dự của người này (nếu có) cũng bị xoá. Link
                              thiệp sẽ không còn hoạt động.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Huỷ</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => void deleteGuest(row.guestId)}
                              className='bg-red-600 hover:bg-red-700'
                            >
                              Xoá
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {filtered.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={columnCount - 2}>Tổng số thiệp đã xác nhận</TableCell>
                <TableCell className='text-center font-semibold'>{stats.people}</TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      {pageCount > 1 && (
        <div className='flex items-center justify-between text-sm text-gray-500'>
          <span>
            {filtered.length} khách · trang {current}/{pageCount}
          </span>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
            >
              Trước
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={current >= pageCount}
              onClick={() => setPage(current + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GuestTable
