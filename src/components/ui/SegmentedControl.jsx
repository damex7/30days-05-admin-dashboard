import { useRef } from 'react'
import { cx } from '../../lib/cx.js'

const SIZES = {
  sm: 'h-7 px-2.5 text-xs',
  md: 'h-9 px-3.5 text-sm',
}

/*
  A row of mutually exclusive options (like the date range). Built as an
  ARIA radiogroup: Tab enters the group on the selected option, and the
  arrow keys move and select, like native radio buttons.
  options: [{ value, label, ariaLabel? }]
*/
export default function SegmentedControl({ options, value, onChange, label, size = 'md', className }) {
  const groupRef = useRef(null)

  const onKeyDown = (event) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    const edge = { Home: 0, End: options.length - 1 }[event.key]
    if (step == null && edge == null) return
    event.preventDefault()
    const current = options.findIndex((option) => option.value === value)
    const next = edge ?? (current + step + options.length) % options.length
    onChange(options[next].value)
    groupRef.current.querySelectorAll('[role="radio"]')[next]?.focus()
  }

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cx('inline-flex max-w-full rounded-lg border border-line bg-panel-2 p-0.5', className)}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.ariaLabel}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cx(
              'shrink-0 rounded-md font-medium whitespace-nowrap transition-colors',
              SIZES[size],
              selected ? 'bg-panel text-ink shadow-sm ring-1 ring-line' : 'text-ink-soft hover:text-ink',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
