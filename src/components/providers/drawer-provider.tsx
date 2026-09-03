'use client'

import { FC } from 'react'

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { cn } from '@/lib/utils'

interface DrawerProviderProps {
  children: React.ReactNode
  className?: string
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const DrawerProvider: FC<DrawerProviderProps> = ({ children, className, open, setOpen }) => {
  return (
    <Drawer
      onOpenChange={(open) => setOpen(open)}
      open={open}
      modal={true}
    >
      <DrawerContent
        suppressHydrationWarning
        className={cn(
          'left-0 right-0 w-screen max-w-none rounded-[1.5rem_1.5rem_0rem_0rem] bg-white',
          className,
        )}
      >
        {/* Giữ lại để tránh báo error */}
        <DrawerHeader className='hidden'>
          <DrawerTitle></DrawerTitle>
        </DrawerHeader>
        {children}
      </DrawerContent>
    </Drawer>
  )
}

export default DrawerProvider
