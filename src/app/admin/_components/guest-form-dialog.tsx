'use client'

import { PencilIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type GuestFormValue = {
  guestId?: string
  category: string
  honorific: string
  name: string
  title: string
  unit: string
  department: string
  partner: string
}

const EMPTY: GuestFormValue = {
  category: '',
  honorific: '',
  name: '',
  title: '',
  unit: '',
  department: '',
  partner: '',
}

const FIELDS = ['category', 'honorific', 'name', 'title', 'unit', 'department', 'partner'] as const

type Props = {
  origin: string
  categories: string[]
  onSaved: () => void
  /** Có giá trị = chế độ sửa; không có = chế độ thêm mới. */
  guest?: GuestFormValue
}

const GuestFormDialog = ({ origin, categories, onSaved, guest }: Props) => {
  const isEdit = Boolean(guest?.guestId)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<GuestFormValue>(guest ?? EMPTY)
  const [saving, setSaving] = useState(false)

  const reset = (next: boolean) => {
    setOpen(next)
    if (next) setForm(guest ?? EMPTY)
  }

  const set = (key: (typeof FIELDS)[number]) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }))

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error('Nhập họ tên khách.')
      return
    }
    setSaving(true)
    try {
      const payload = Object.fromEntries(
        FIELDS.map((key) => [key, form[key].trim() || undefined]),
      ) as Record<string, string | undefined>

      const response = isEdit
        ? await fetch(`/api/guests/${guest?.guestId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ origin, ...payload }),
        })
        : await fetch('/api/guests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ origin, guests: [payload], replace: false }),
        })
      const result = (await response.json()) as { ok: boolean; error?: string; added?: number }
      if (!result.ok) throw new Error(result.error ?? 'Lỗi.')

      if (isEdit) toast.success('Đã cập nhật khách.')
      else if (result.added === 0) toast.info('Khách này đã có trong danh sách.')
      else toast.success('Đã thêm khách.')

      setOpen(false)
      onSaved()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không lưu được.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={reset}
    >
      <DialogTrigger asChild>
        {isEdit ? (
          <Button
            variant='ghost'
            size='sm'
            className='h-7 px-2 text-xs'
          >
            <PencilIcon className='size-3.5' />
            Sửa
          </Button>
        ) : (
          <Button size='sm'>
            <PlusIcon className='size-4' />
            Thêm khách
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Sửa thông tin khách' : 'Thêm một khách mời'}</DialogTitle>
        </DialogHeader>

        <datalist id='guest-categories'>
          {categories.map((category) => (
            <option
              key={category}
              value={category}
            />
          ))}
        </datalist>

        <div className='grid gap-3'>
          <div className='grid gap-1.5'>
            <Label htmlFor='g-category'>Nhóm / tab</Label>
            <Input
              id='g-category'
              list='guest-categories'
              value={form.category}
              onChange={set('category')}
              placeholder='Khách'
            />
          </div>
          <div className='grid grid-cols-[6rem_1fr] gap-3'>
            <div className='grid gap-1.5'>
              <Label htmlFor='g-honorific'>Danh xưng</Label>
              <Input
                id='g-honorific'
                value={form.honorific}
                onChange={set('honorific')}
                placeholder='Ông'
              />
            </div>
            <div className='grid gap-1.5'>
              <Label htmlFor='g-name'>Họ và tên *</Label>
              <Input
                id='g-name'
                value={form.name}
                onChange={set('name')}
              />
            </div>
          </div>
          <div className='grid gap-1.5'>
            <Label htmlFor='g-title'>Chức danh</Label>
            <Input
              id='g-title'
              value={form.title}
              onChange={set('title')}
            />
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='grid gap-1.5'>
              <Label htmlFor='g-unit'>Đơn vị</Label>
              <Input
                id='g-unit'
                value={form.unit}
                onChange={set('unit')}
              />
            </div>
            <div className='grid gap-1.5'>
              <Label htmlFor='g-department'>Bộ phận</Label>
              <Input
                id='g-department'
                value={form.department}
                onChange={set('department')}
              />
            </div>
          </div>
          <div className='grid gap-1.5'>
            <Label htmlFor='g-partner'>Đi cùng (Phu nhân / Phu quân)</Label>
            <Input
              id='g-partner'
              value={form.partner}
              onChange={set('partner')}
              placeholder='Phu nhân'
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant='outline'
              disabled={saving}
            >
              Huỷ
            </Button>
          </DialogClose>
          <Button
            onClick={() => void submit()}
            disabled={saving}
          >
            {saving ? 'Đang lưu…' : isEdit ? 'Lưu' : 'Thêm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default GuestFormDialog
