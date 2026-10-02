import { cx } from '../../lib/cx.js'

const TONES = {
  neutral: 'bg-panel-2 text-ink-soft',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  accent: 'bg-accent-soft text-ink',
}

const DOTS = {
  neutral: 'bg-ink-faint',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  accent: 'bg-accent',
}

const SIZES = {
  sm: 'h-5 gap-1 px-2 text-xs',
  md: 'h-6 gap-1.5 px-2.5 text-xs',
}

/** A small label. Colour is never the only signal: the text says it too. */
export default function Badge({ tone = 'neutral', size = 'md', dot = false, className, children }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full font-medium whitespace-nowrap',
        TONES[tone],
        SIZES[size],
        className,
      )}
    >
      {dot && <span aria-hidden="true" className={cx('size-1.5 rounded-full', DOTS[tone])} />}
      {children}
    </span>
  )
}
