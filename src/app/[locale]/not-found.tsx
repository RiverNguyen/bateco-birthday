import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

export default function NotFoundPage() {
  const t = useTranslations('NotFoundPage')

  return (
    <main className='flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center'>
      <p className='text-sm font-medium tracking-wide text-muted-foreground'>404</p>
      <h1 className='text-2xl font-semibold tracking-tight'>{t('title')}</h1>
      <p className='max-w-md text-muted-foreground'>{t('description')}</p>
      <Link
        href='/'
        className='mt-2 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90'
      >
        {t('backHome')}
      </Link>
    </main>
  )
}
