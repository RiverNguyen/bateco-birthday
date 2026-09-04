import { EVENT_NAME, EVENT_VENUE, EVENT_WHEN, ORG_NAME } from '@/lib/site'

export const OG_SIZE = { width: 1200, height: 630 }

const FONT = (weight: 400 | 600 | 700) =>
  `https://cdn.jsdelivr.net/npm/@fontsource/be-vietnam-pro@5.1.0/files/be-vietnam-pro-vietnamese-${weight}-normal.woff`

/** Tải font tiếng Việt cho ImageResponse; lỗi mạng thì trả mảng rỗng (dùng font mặc định). */
export const loadOgFonts = async () => {
  try {
    const weights = [400, 600, 700] as const
    const data = await Promise.all(
      weights.map(async (w) => {
        const res = await fetch(FONT(w))
        if (!res.ok) throw new Error(`font ${w}`)
        return res.arrayBuffer()
      }),
    )
    return weights.map((weight, i) => ({
      name: 'BVP',
      data: data[i],
      weight,
      style: 'normal' as const,
    }))
  } catch {
    return []
  }
}

type CardProps = { who: string; title?: string; partner?: string; big?: boolean }

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
      fontFamily: 'BVP',
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
    <div style={{ fontSize: 26, letterSpacing: 10, color: '#d2b26e', fontWeight: 600 }}>
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
        letterSpacing: 4,
        color: 'rgba(247,240,223,0.6)',
      }}
    >
      {ORG_NAME.toUpperCase()}
    </div>
  </div>
)
