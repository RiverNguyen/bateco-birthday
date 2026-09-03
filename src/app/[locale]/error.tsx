'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: Props) {
  const t = useTranslations('ErrorPage')

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className='flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center'>
      <p className='text-sm font-medium tracking-wide text-muted-foreground'>Error</p>
      <h1 className='text-2xl font-semibold tracking-tight'>{t('title')}</h1>
      <p className='max-w-md text-muted-foreground'>{t('description')}</p>
      <button
        type='button'
        onClick={reset}
        className='mt-2 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90'
      >
        {t('retry')}
      </button>
    </main>
  )
}
