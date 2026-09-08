'use client'

import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  CheckIcon,
  DownloadIcon,
  SearchIcon,
  Trash2Icon,
} from 'lucide-react'
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
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
const SIBLING_PAGES = 1
type SortKey = 'stt' | 'category' | 'name' | 'link' | 'status' | 'confirmedAt'
type SortDirection = 'asc' | 'desc'

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd').toLowerCase()

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'short',
  hour12: false,
})

const formatConfirmedAt = (value: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return dateFormatter.format(date)
}

const confirmedAtTime = (row: GuestRow) =>
  row.confirmedAt ? new Date(row.confirmedAt).getTime() : Number.NEGATIVE_INFINITY

const compareText = (a: string | null, b: string | null, direction: SortDirection) => {
  const aValue = normalize(a?.trim() ?? '')
  const bValue = normalize(b?.trim() ?? '')

  if (!aValue && !bValue) return 0
  if (!aValue) return 1
  if (!bValue) return -1

  const result = aValue.localeCompare(bValue, 'vi')
  return direction === 'asc' ? result : -result
}

const compareNumber = (a: number, b: number, direction: SortDirection) =>
  direction === 'asc' ? a - b : b - a

const compareNullableNumber = (a: number | null, b: number | null, direction: SortDirection) => {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1
  return compareNumber(a, b, direction)
}

const compareRows = (a: GuestRow, b: GuestRow, sortKey: SortKey, direction: SortDirection) => {
  switch (sortKey) {
    case 'stt':
      return compareNumber(a.stt, b.stt, direction)
    case 'category':
      return compareText(catOf(a), catOf(b), direction)
    case 'name':
      return compareText(
        `${a.honorific ?? ''} ${a.name}`,
        `${b.honorific ?? ''} ${b.name}`,
        direction,
      )
    case 'link':
      return compareText(a.link, b.link, direction)
    case 'status':
      return compareNumber(a.partySize === null ? 0 : 1, b.partySize === null ? 0 : 1, direction)
    case 'confirmedAt':
      return compareNullableNumber(
        a.confirmedAt ? confirmedAtTime(a) : null,
        b.confirmedAt ? confirmedAtTime(b) : null,
        direction,
      )
  }

  return 0
}

const getPaginationItems = (current: number, pageCount: number) => {
  const visible = new Set([1, pageCount])
  for (
    let pageNumber = current - SIBLING_PAGES;
    pageNumber <= current + SIBLING_PAGES;
    pageNumber += 1
  ) {
    if (pageNumber >= 1 && pageNumber <= pageCount) visible.add(pageNumber)
  }

  const pages = [...visible].sort((a, b) => a - b)
  return pages.flatMap((pageNumber, index) => {
    const previous = pages[index - 1]
    if (previous && pageNumber - previous > 1) {
      return [`ellipsis-${previous}-${pageNumber}`, pageNumber] as const
    }
    return [pageNumber] as const
  })
}

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

type SortableHeadProps = {
  active: boolean
  align?: 'left' | 'center' | 'right'
  className?: string
  direction: SortDirection
  label: string
  onSort: () => void
}

const SortableHead = ({
  active,
  align = 'left',
  className,
  direction,
  label,
  onSort,
}: SortableHeadProps) => {
  const Icon = active ? (direction === 'asc' ? ArrowUpIcon : ArrowDownIcon) : ArrowUpDownIcon
  const justify = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : ''

  return (
    <TableHead className={className}>
      <Button
        variant='ghost'
        size='sm'
        className={`h-8 w-full px-0 font-semibold hover:bg-transparent ${justify}`}
        aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
        onClick={onSort}
      >
        {label}
        <Icon className='size-3.5' />
      </Button>
    </TableHead>
  )
}

const GuestTable = ({ rows, loading, origin, onRefresh }: Props) => {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('all')
  const [status, setStatus] = useState<'all' | 'confirmed' | 'pending'>('all')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'confirmedAt',
    direction: 'desc',
  })
  const [copied, setCopied] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const setSortKey = (key: SortKey) => {
    setSort((currentSort) => ({
      key,
      direction: currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc',
    }))
    setPage(1)
  }

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
    return scoped
      .filter((row) => {
        if (status === 'confirmed' && row.partySize === null) return false
        if (status === 'pending' && row.partySize !== null) return false
        if (!q) return true
        return normalize(
          `${row.honorific ?? ''} ${row.name} ${row.title ?? ''} ${row.unit ?? ''}`,
        ).includes(q)
      })
      .toSorted((a, b) => {
        const result = compareRows(a, b, sort.key, sort.direction)
        return result === 0 ? a.stt - b.stt : result
      })
  }, [scoped, query, status, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const pageRows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  const paginationItems = getPaginationItems(current, pageCount)
  const showGroupColumn = tab === 'all' && categories.length > 1
  const columnCount = (showGroupColumn ? 6 : 5) + 1
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
              <SortableHead
                label='STT'
                className='w-12'
                active={sort.key === 'stt'}
                direction={sort.direction}
                onSort={() => setSortKey('stt')}
              />
              {showGroupColumn && (
                <SortableHead
                  label='Nhóm'
                  className='w-28'
                  active={sort.key === 'category'}
                  direction={sort.direction}
                  onSort={() => setSortKey('category')}
                />
              )}
              <SortableHead
                label='Họ tên'
                active={sort.key === 'name'}
                direction={sort.direction}
                onSort={() => setSortKey('name')}
              />
              <SortableHead
                label='Link'
                active={sort.key === 'link'}
                direction={sort.direction}
                onSort={() => setSortKey('link')}
              />
              <SortableHead
                label='Xác nhận'
                className='w-40'
                align='center'
                active={sort.key === 'status'}
                direction={sort.direction}
                onSort={() => setSortKey('status')}
              />
              <SortableHead
                label='Thời gian'
                className='w-40'
                active={sort.key === 'confirmedAt'}
                direction={sort.direction}
                onSort={() => setSortKey('confirmedAt')}
              />
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
                  <TableCell className='whitespace-nowrap text-sm text-gray-600'>
                    {formatConfirmedAt(row.confirmedAt)}
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
                <TableCell colSpan={columnCount - 3}>Tổng số thiệp đã xác nhận</TableCell>
                <TableCell className='text-center font-semibold'>{stats.people}</TableCell>
                <TableCell />
                <TableCell />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      {pageCount > 1 && (
        <div className='flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500'>
          <span>
            {filtered.length} khách · trang {current}/{pageCount}
          </span>
          <Pagination className='mx-0 w-auto'>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href='#'
                  text='Trước'
                  aria-disabled={current <= 1}
                  className={current <= 1 ? 'opacity-50' : undefined}
                  onClick={(event) => {
                    event.preventDefault()
                    setPage(Math.max(1, current - 1))
                  }}
                />
              </PaginationItem>
              {paginationItems.map((item) => (
                <PaginationItem key={item}>
                  {typeof item === 'string' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href='#'
                      isActive={item === current}
                      onClick={(event) => {
                        event.preventDefault()
                        setPage(item)
                      }}
                    >
                      {item}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href='#'
                  text='Sau'
                  aria-disabled={current >= pageCount}
                  className={current >= pageCount ? 'opacity-50' : undefined}
                  onClick={(event) => {
                    event.preventDefault()
                    setPage(Math.min(pageCount, current + 1))
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}

export default GuestTable
