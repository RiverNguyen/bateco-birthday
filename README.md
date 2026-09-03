# Source Code Guide

Tài liệu cấu trúc và cách dùng **Next.js 16 Template**.

Đọc kèm [README.md](./README.md) (setup / env / scripts). Docs UI trong app: `/` (tổng quan) · `/gioi-thieu` (cách hoạt động).

---

## 1. Stack

| Nhóm | Công nghệ |
|------|-----------|
| Core | Next.js 16 (App Router), React 19, TypeScript |
| Style | Tailwind CSS 4, shadcn/ui, IBM Plex Sans / Mono |
| i18n | next-intl (`vi` mặc định, `en`) |
| Data | TanStack Query, nuqs |
| Scroll | Lenis, GSAP |
| Forms | react-hook-form + zod |
| Deploy | `output: 'standalone'` |

Package manager: **pnpm**. Alias: `@/*` → `src/*`.

---

## 2. Cấu trúc thư mục

```text
src/
  app/                      # App Router
    layout.tsx              # Root: fonts, Query, nuqs, Lenis
    not-found.tsx           # 404 ngoài locale
    global-error.tsx        # Crash boundary (có html/body riêng)
    [locale]/
      layout.tsx            # Validate locale + NextIntlClientProvider
      page.tsx              # Trang chủ (docs overview)
      gioi-thieu/page.tsx   # Giới thiệu (how it works)
      error.tsx             # Error boundary theo locale
      not-found.tsx         # 404 theo locale
      [...rest]/page.tsx    # Catch-all → notFound()
  components/
    ui/                     # shadcn primitives
    providers/              # Query, Lenis, Drawer, Sheet
    site/                   # Section theo project (docs, …)
  configs/                  # env, endpoints, routes
  fetches/                  # HTTP CMS / Rank Math / CF7
  services/                 # Domain wrappers (vd. tour)
  i18n/                     # routing, request, navigation
  hooks/                    # Shared hooks
  lib/                      # cn, …
  utils/                    # scroll, metadata, parse Rank Math
  styles/globals.css        # Theme tokens
  content/                  # Data tĩnh cho docs
  proxy.ts                  # next-intl middleware (Next 16)
messages/
  vi.json
  en.json
```

---

## 3. Luồng request

```text
Request
  → src/proxy.ts                 # locale + pathname rewrite
  → src/app/layout.tsx           # QueryProvider → NuqsAdapter → LenisProvider
  → src/app/[locale]/layout.tsx  # setRequestLocale + messages
  → page.tsx
```

- Locale không hợp lệ → `notFound()`
- Route không tồn tại → `[...rest]` gọi `notFound()` → `[locale]/not-found.tsx`

---

## 4. i18n & routing

Cấu hình: `src/i18n/routing.ts`

| | |
|--|--|
| Locales | `vi`, `en` |
| Default | `vi` |
| Prefix | `as-needed` → `/` = vi, `/en/...` = en |
| Pathnames | `/gioi-thieu` (vi) ↔ `/about` (en) |

### Link nội bộ

Luôn dùng API từ `@/i18n/navigation` (không dùng `next/link` thuần):

```tsx
import { Link } from '@/i18n/navigation'
import ROUTES from '@/configs/routes'

<Link href={ROUTES.home}>Home</Link>
<Link href={ROUTES.about}>About</Link>
```

`ROUTES` dùng **internal pathname** (`/gioi-thieu`), next-intl tự map URL public theo locale.

### Messages

- File: `messages/vi.json`, `messages/en.json`
- Load: `src/i18n/request.ts`
- Trong page: `useTranslations('Namespace')`

**Lưu ý ICU:** không viết `{CMS}` / `{locale}` trong string dịch nếu không truyền biến — next-intl sẽ coi đó là placeholder.

---

## 5. Thêm page mới

1. Tạo file:

```text
src/app/[locale]/ten-trang/page.tsx
```

2. Skeleton:

```tsx
import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { use } from 'react'

type Props = { params: Promise<{ locale: string }> }

export default function ExamplePage({ params }: Props) {
  const { locale } = use(params)
  setRequestLocale(locale)

  const t = useTranslations('ExamplePage')
  return <h1>{t('title')}</h1>
}
```

3. Thêm pathname trong `src/i18n/routing.ts` (nếu URL khác nhau theo ngôn ngữ):

```ts
pathnames: {
  '/': '/',
  '/gioi-thieu': { vi: '/gioi-thieu', en: '/about' },
  '/ten-trang': { vi: '/ten-trang', en: '/example' },
},
```

4. Thêm `ROUTES` nếu cần:

```ts
// src/configs/routes.ts
const ROUTES = {
  home: '/',
  about: '/gioi-thieu',
  example: '/ten-trang',
} as const
```

5. Thêm copy vào `messages/vi.json` và `messages/en.json`.

---

## 6. Data layer

```text
configs/  →  fetches/  →  services/  →  page / component
```

| Tầng | Vai trò | Ví dụ |
|------|---------|--------|
| `configs/env.ts` | `DOMAIN`, `CMS`, `API` từ env | `ENV.CMS` |
| `configs/endpoints.ts` | Path API | `ENDPOINTS.tour.list` |
| `fetches/fetchData.ts` | `fetch(CMS + API + endpoint)` | GET/POST generic |
| `services/*` | Bọc domain | `tourService.getTours()` |

### Gọi trên Server Component

```tsx
import tourService from '@/services/tour'

const tours = await tourService.getTours()
```

### Gọi trên Client (TanStack Query)

```tsx
'use client'
import { useQuery } from '@tanstack/react-query'
import tourService from '@/services/tour'

const { data } = useQuery({
  queryKey: ['tours'],
  queryFn: () => tourService.getTours(),
})
```

Provider đã gắn ở root (`QueryProvider`). DevTools bật sẵn.

### URL state (nuqs)

```tsx
'use client'
import { useQueryState } from 'nuqs'

const [q, setQ] = useQueryState('q')
```

`NuqsAdapter` đã wrap trong root layout.

---

## 7. Providers

| Provider | File | Gắn ở |
|----------|------|--------|
| TanStack Query | `components/providers/query-provider.tsx` | root layout |
| nuqs | `nuqs/adapters/next/app` | root layout |
| Lenis | `components/providers/lenis-provider.tsx` | root layout |
| Drawer / Sheet | `drawer-provider.tsx`, `sheet-provider.tsx` | mount khi cần |

### Lenis

```tsx
'use client'
import { useLenis } from 'lenis/react'

const lenis = useLenis()
// lenis?.scrollTo(0)
```

---

## 8. UI (shadcn)

- Components: `src/components/ui/*`
- Utility class merge: `import { cn } from '@/lib/utils'`
- Thêm component: dùng CLI shadcn theo `components.json`

Section theo site: đặt ở `src/components/site/`.

---

## 9. SEO / CMS helpers

| File | Mục đích |
|------|----------|
| `fetches/getMetaDataRankMath.ts` | Lấy head Rank Math |
| `utils/parseRankMathHead.ts` | Parse HTML head |
| `utils/metadataValues.ts` | Map metadata |
| `fetches/cf7Request.ts` | Submit Contact Form 7 |

Env cần có: `NEXT_PUBLIC_DOMAIN`, `NEXT_PUBLIC_CMS`, `NEXT_PUBLIC_API` (xem README).

---

## 10. Error & 404

| File | Khi nào |
|------|---------|
| `[locale]/not-found.tsx` | `notFound()` trong locale |
| `app/not-found.tsx` | 404 ngoài locale tree |
| `[locale]/error.tsx` | Runtime error trong locale |
| `app/global-error.tsx` | Lỗi root (thay cả html/body) |

---

## 11. Convention nhanh

1. Page mới luôn nằm trong `app/[locale]/…`
2. `setRequestLocale(locale)` trước khi dùng next-intl trên server
3. Navigate bằng `@/i18n/navigation` + internal pathname
4. Không để `{variable}` trong JSON messages nếu không truyền giá trị
5. Fetch CMS qua `services` → `fetches`, không hardcode URL trong page
6. Client-only (Lenis, Query hooks, nuqs) → `'use client'`

---

## 12. URL tham chiếu

| Locale | Home | Giới thiệu |
|--------|------|------------|
| vi | `/` | `/gioi-thieu` |
| en | `/en` | `/en/about` |
