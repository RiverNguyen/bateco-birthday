'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface SheetProviderProps {
  open: boolean
  setOpen: (open: boolean) => void
  children: React.ReactNode
  className?: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  title?: string
  hideCloseButton?: boolean
}

const SheetProvider = ({
  open,
  setOpen,
  children,
  className,
  side = 'right',
  title = 'Menu',
  hideCloseButton = false,
}: SheetProviderProps) => {
  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
    >
      <SheetContent
        side={side}
        suppressHydrationWarning
        className={cn(hideCloseButton && '[&>button]:hidden', className)}
      >
        <SheetHeader className='sr-only'>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  )
}

export default SheetProvider
