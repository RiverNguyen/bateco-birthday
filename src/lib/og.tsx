/* eslint-disable @next/next/no-img-element */

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { EVENT_NAME, EVENT_VENUE, EVENT_WHEN, ORG_NAME } from '@/lib/site'

export const OG_SIZE = { width: 1200, height: 630 }

type OgAssets = {
  background: string
  invite: string
}
type CardProps = {
  who: string
  title?: string
  partner?: string
  big?: boolean
  assets: OgAssets
}
type OgFont = {
  name: string
  data: ArrayBuffer
  weight: 400 | 700
  style: 'normal'
}

const publicPath = (file: string) => join(process.cwd(), 'public', file)
const readPublicFile = async (file: string) => {
  const buffer = await readFile(publicPath(file))
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer
}
const readAsset = async (file: string, mime: string) => {
  const buffer = await readFile(publicPath(file))
  return `data:${mime};base64,${buffer.toString('base64')}`
}

let fontsPromise: Promise<OgFont[]> | null = null
let assetsPromise: Promise<OgAssets> | null = null

export const getOgFonts = () => {
  fontsPromise ??= Promise.all([
    readPublicFile('fonts/NotoSans-Regular.ttf').then((data) => ({
      name: 'Noto Sans',
      data,
      weight: 400 as const,
      style: 'normal' as const,
    })),
    readPublicFile('fonts/NotoSans-Bold.ttf').then((data) => ({
      name: 'Noto Sans',
      data,
      weight: 700 as const,
      style: 'normal' as const,
    })),
  ])

  return fontsPromise
}

export const getOgAssets = () => {
  assetsPromise ??= Promise.all([
    readAsset('bg-new.png', 'image/png'),
    readAsset('thiep-og.jpg', 'image/jpeg'),
  ]).then(([background, invite]) => ({ background, invite }))

  return assetsPromise
}

/** Khung thiệp mời cho ảnh chia sẻ (Open Graph). */
export const OgCard = ({ who, title, partner, big = true, assets }: CardProps) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'center',
      position: 'relative',
      padding: 52,
      fontFamily: 'Noto Sans',
      color: '#f8f1e4',
      background: '#04162d',
    }}
  >
    <img
      src={assets.background}
      alt=''
      width={1200}
      height={630}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: 0.92,
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'linear-gradient(90deg, rgba(4,22,45,0.12) 0%, rgba(4,22,45,0.45) 55%, rgba(4,22,45,0.92) 100%)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        top: 28,
        left: 28,
        width: 1144,
        height: 574,
        border: '2px solid rgba(226,191,111,0.56)',
        borderRadius: 18,
      }}
    />
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 48,
        width: '100%',
        height: '100%',
      }}
    >
      <div
        style={{
          width: 281,
          height: 548,
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(226,191,111,0.86)',
          borderRadius: 8,
          boxShadow: '0 28px 78px rgba(0,0,0,0.42)',
          background: 'rgba(248,241,228,0.92)',
        }}
      >
        <img
          src={assets.invite}
          alt=''
          width={281}
          height={548}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingRight: 18,
        }}
      >
        <div style={{ fontSize: 28, color: '#d2b26e', fontWeight: 700 }}>THIỆP MỜI</div>
        <div
          style={{
            marginTop: 18,
            fontSize: big ? 62 : 46,
            fontWeight: 700,
            color: '#f3d58a',
            lineHeight: 1.12,
          }}
        >
          {who}
        </div>
        {partner ? (
          <div style={{ marginTop: 4, fontSize: 28, color: '#f3d58a' }}>{partner}</div>
        ) : null}
        {title ? (
          <div style={{ marginTop: 12, fontSize: 25, color: '#dbe6f4', lineHeight: 1.35 }}>
            {title}
          </div>
        ) : null}
        <div
          style={{
            marginTop: 28,
            marginBottom: 26,
            width: 220,
            height: 2,
            background: 'rgba(210,178,110,0.72)',
          }}
        />
        <div
          style={{
            maxWidth: 650,
            fontSize: 38,
            fontWeight: 700,
            color: '#ffffff',
            textTransform: 'uppercase',
            lineHeight: 1.22,
          }}
        >
          {EVENT_NAME}
        </div>
        <div style={{ marginTop: 24, fontSize: 26, color: '#d2b26e' }}>{EVENT_WHEN}</div>
        <div style={{ marginTop: 8, fontSize: 24, color: '#dbe6f4' }}>{EVENT_VENUE}</div>
        <div style={{ marginTop: 30, fontSize: 19, color: 'rgba(247,240,223,0.64)' }}>
          {ORG_NAME.toUpperCase()}
        </div>
      </div>
    </div>
  </div>
)
