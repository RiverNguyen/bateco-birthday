import type { Variants } from 'motion/react'

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.15,
    },
  },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.9, ease: 'easeOut' },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
}

export const lineExpand: Variants = {
  hidden: { opacity: 0, scaleX: 0 },
  show: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
}

export const riseFromBottom: Variants = {
  hidden: { opacity: 0, y: 48 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
}

export function withDelay(variants: Variants, delay: number): Variants {
  const show = variants.show
  if (typeof show !== 'object') return variants

  return {
    ...variants,
    show: { ...show, transition: { ...show.transition, delay } },
  }
}
