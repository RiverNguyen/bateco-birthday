'use client'

import { useEffect } from 'react'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang='vi'>
      <body className='antialiased'>
        <main
          style={{
            display: 'flex',
            minHeight: '100vh',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '1.5rem',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#737373' }}>Error</p>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ margin: 0, maxWidth: '28rem', color: '#737373' }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            type='button'
            onClick={reset}
            style={{
              marginTop: '0.5rem',
              height: '2.5rem',
              padding: '0 1rem',
              border: 'none',
              borderRadius: '0.375rem',
              background: '#171717',
              color: '#fafafa',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
