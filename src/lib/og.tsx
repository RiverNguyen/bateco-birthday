import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { EVENT_NAME, EVENT_VENUE, EVENT_WHEN, ORG_NAME } from '@/lib/site'

export const OG_SIZE = { width: 1200, height: 630 }

type CardProps = { who: string; title?: string; partner?: string; big?: boolean }
type OgFont = {
  name: string
  data: ArrayBuffer
  weight: 400 | 700
  style: 'normal'
}

const fontPath = (file: string) => join(process.cwd(), 'public', 'fonts', file)
const readFont = async (file: string) => {
  const buffer = await readFile(fontPath(file))
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer
}

let fontsPromise: Promise<OgFont[]> | null = null

export const getOgFonts = () => {
  fontsPromise ??= Promise.all([
    readFont('NotoSans-Regular.ttf').then((data) => ({
      name: 'Noto Sans',
      data,
      weight: 400 as const,
      style: 'normal' as const,
    })),
    readFont('NotoSans-Bold.ttf').then((data) => ({
      name: 'Noto Sans',
      data,
      weight: 700 as const,
      style: 'normal' as const,
    })),
  ])

  return fontsPromise
}

/** Khung thiệp mời cho ảnh chia sẻ (Open Graph). */
export const OgCard = ({ who, title, partner, big = true }: CardProps) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 56,
      fontFamily: 'Noto Sans',
      color: '#f7f0df',
      background: 'linear-gradient(135deg, #04162d 0%, #0b2b52 55%, #04162d 100%)',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 26,
        left: 26,
        right: 26,
        bottom: 26,
        border: '3px solid rgba(214,180,110,0.7)',
        borderRadius: 14,
      }}
    />
    <div style={{ fontSize: 28, color: '#d2b26e', fontWeight: 700 }}>
      THIỆP MỜI
    </div>
    <div
      style={{
        marginTop: 18,
        fontSize: big ? 72 : 50,
        fontWeight: 700,
        color: '#e9cf8a',
        textAlign: 'center',
        lineHeight: 1.1,
      }}
    >
      {who}
    </div>
    {title ? (
      <div style={{ marginTop: 12, fontSize: 28, color: '#cdd7e6', textAlign: 'center' }}>
        {title}
      </div>
    ) : null}
    {partner ? <div style={{ marginTop: 6, fontSize: 30, color: '#e9cf8a' }}>{partner}</div> : null}

    <div
      style={{
        marginTop: 30,
        marginBottom: 26,
        width: 220,
        height: 2,
        background: 'rgba(210,178,110,0.6)',
      }}
    />

    <div
      style={{
        fontSize: 38,
        fontWeight: 700,
        color: '#ffffff',
        textAlign: 'center',
        textTransform: 'uppercase',
        lineHeight: 1.25,
        maxWidth: 900,
      }}
    >
      {EVENT_NAME}
    </div>
    <div style={{ marginTop: 18, fontSize: 26, color: '#d2b26e', textAlign: 'center' }}>
      {EVENT_WHEN}
    </div>
    <div style={{ marginTop: 4, fontSize: 24, color: '#cdd7e6' }}>{EVENT_VENUE}</div>
    <div
      style={{
        marginTop: 26,
        fontSize: 20,
        letterSpacing: 1.5,
        color: 'rgba(247,240,223,0.6)',
      }}
    >
      {ORG_NAME.toUpperCase()}
    </div>
  </div>
)
