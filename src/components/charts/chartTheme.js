import { useSyncExternalStore } from 'react'

/*
  Shared chart styling. Colours are CSS variables, so every chart switches
  with the theme without re-rendering: the browser just repaints.
*/
export const SERIES = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-3)']

export const axisProps = {
  tick: { fill: 'var(--color-ink-faint)', fontSize: 12 },
  tickLine: false,
  axisLine: false,
}

export const gridProps = { stroke: 'var(--color-chart-grid)', vertical: false }

// Turn chart animations off when the user asked their OS for less motion
const query = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
const subscribe = (callback) => {
  query?.addEventListener('change', callback)
  return () => query?.removeEventListener('change', callback)
}
export const usePrefersReducedMotion = () => useSyncExternalStore(subscribe, () => query?.matches ?? false)
