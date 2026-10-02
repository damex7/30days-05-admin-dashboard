/*
  Dates are handled as "day keys" (YYYY-MM-DD strings, Lagos time).
  They sort and compare correctly as plain strings, and they avoid
  time-zone surprises when the viewer isn't in Nigeria.

  "Today" is fixed so the sample data (and every number on the
  dashboard) stays the same no matter when you open the app.
*/
export const TODAY = '2026-09-30'

export const RANGES = [
  { value: '7d', label: '7 days', short: '7D', days: 7 },
  { value: '30d', label: '30 days', short: '30D', days: 30 },
  { value: '90d', label: '90 days', short: '90D', days: 90 },
  { value: '12m', label: '12 months', short: '12M', months: 12 },
]

export const DEFAULT_RANGE = '30d'

export function getRange(value) {
  return RANGES.find((range) => range.value === value) ?? RANGES.find((r) => r.value === DEFAULT_RANGE)
}

function toUTC(dayKey) {
  const [y, m, d] = dayKey.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

const fromUTC = (date) => date.toISOString().slice(0, 10)

export function addDays(dayKey, days) {
  const date = toUTC(dayKey)
  date.setUTCDate(date.getUTCDate() + days)
  return fromUTC(date)
}

export function addMonths(dayKey, months) {
  const date = toUTC(dayKey)
  date.setUTCDate(1)
  date.setUTCMonth(date.getUTCMonth() + months)
  return fromUTC(date)
}

export const dayKeyOf = (iso) => iso.slice(0, 10)
export const monthKeyOf = (iso) => iso.slice(0, 7)

/** Number of whole days from a to b. */
export const daysBetween = (a, b) => Math.round((toUTC(b) - toUTC(a)) / 86_400_000)

/**
 * The current window and the window just before it, as inclusive day keys,
 * plus the chart buckets: one per day for day ranges, one per month for 12m.
 */
export function getRangeBounds(value) {
  const range = getRange(value)
  const end = TODAY

  if (range.months) {
    const start = addMonths(end, -(range.months - 1)) // first day of the month, 11 months back
    const prevStart = addMonths(start, -range.months)
    const prevEnd = addDays(start, -1)
    const buckets = Array.from({ length: range.months }, (_, i) => addMonths(start, i).slice(0, 7))
    const prevBuckets = Array.from({ length: range.months }, (_, i) => addMonths(prevStart, i).slice(0, 7))
    return { range, start, end, prevStart, prevEnd, unit: 'month', buckets, prevBuckets }
  }

  const start = addDays(end, -(range.days - 1))
  const prevEnd = addDays(start, -1)
  const prevStart = addDays(prevEnd, -(range.days - 1))
  const buckets = Array.from({ length: range.days }, (_, i) => addDays(start, i))
  const prevBuckets = Array.from({ length: range.days }, (_, i) => addDays(prevStart, i))
  return { range, start, end, prevStart, prevEnd, unit: 'day', buckets, prevBuckets }
}

export const inWindow = (dayKey, start, end) => dayKey >= start && dayKey <= end
