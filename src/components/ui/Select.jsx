import { useId } from 'react'
import { cx } from '../../lib/cx.js'
import { ChevronDownIcon } from './Icons.jsx'

const SIZES = { sm: 'h-8 text-sm pl-2.5 pr-8', md: 'h-10 text-sm pl-3 pr-9' }

/*
  A styled native <select>. Native means keyboard support, screen reader
  support and the phone's own picker come for free.
  options: [{ value, label }]
*/
export default function Select({ label, hideLabel = false, options, value, onChange, size = 'md', className, ...props }) {
  const id = useId()
  return (
    <div className={cx('flex flex-col gap-1', className)}>
      <label htmlFor={id} className={cx('text-xs font-medium text-ink-soft', hideLabel && 'sr-only')}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cx(
            'w-full cursor-pointer appearance-none rounded-lg border border-line-strong bg-panel text-ink',
            'hover:bg-panel-2',
            SIZES[size],
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          size={16}
          className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-ink-soft"
        />
      </div>
    </div>
  )
}
