/*
  All number and date formatting goes through Intl, so commas, the ₦ sign
  and month names come from the browser's locale data, not hand-written code.
  Formatters are created once and reused (creating them is relatively slow).
*/
const LOCALE = 'en-NG'
const TIME_ZONE = 'Africa/Lagos'

const naira = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })
const nairaCompact = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'NGN',
  notation: 'compact',
  maximumFractionDigits: 1,
})
const number = new Intl.NumberFormat(LOCALE)
const numberCompact = new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 })
const percent = new Intl.NumberFormat(LOCALE, { style: 'percent', maximumFractionDigits: 1 })
const change = new Intl.NumberFormat(LOCALE, { style: 'percent', maximumFractionDigits: 1, signDisplay: 'exceptZero' })

const date = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric', timeZone: TIME_ZONE })
const dateTime = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: TIME_ZONE,
})
const dayLabel = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', timeZone: 'UTC' })
const monthLabel = new Intl.DateTimeFormat(LOCALE, { month: 'short', timeZone: 'UTC' })
const monthYearLabel = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric', timeZone: 'UTC' })

export const formatNaira = (value) => naira.format(value)
export const formatNairaCompact = (value) => nairaCompact.format(value)
export const formatNumber = (value) => number.format(value)
export const formatNumberCompact = (value) => numberCompact.format(value)
export const formatPercent = (value) => percent.format(value)
/** Signed change, e.g. +12.3% or -4%. null means there is nothing to compare with. */
export const formatChange = (value) => (value == null ? '—' : change.format(value))

export const formatDate = (iso) => date.format(new Date(iso))
export const formatDateTime = (iso) => dateTime.format(new Date(iso))

// Chart buckets are day keys (2026-09-14) or month keys (2026-09)
const keyToDate = (key) => new Date(`${key.length === 7 ? `${key}-01` : key}T00:00:00Z`)
export const formatBucket = (key) => (key.length === 7 ? monthLabel : dayLabel).format(keyToDate(key))
export const formatBucketLong = (key) =>
  (key.length === 7 ? monthYearLabel : date).format(keyToDate(key))
