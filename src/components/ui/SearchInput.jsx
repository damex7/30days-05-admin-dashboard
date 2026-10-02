import { useEffect, useId, useRef, useState } from 'react'
import { cx } from '../../lib/cx.js'
import { CloseIcon, SearchIcon } from './Icons.jsx'

/*
  A search box that waits until you stop typing (debounce) before calling
  onChange, so we don't fire a request on every keystroke.

  `draft` is what's in the box right now; `value` is the committed search
  (from the URL). If the URL changes (Back button), the box follows it.
*/
export default function SearchInput({
  value,
  onChange,
  label = 'Search',
  hideLabel = true,
  placeholder = 'Search…',
  delay = 300,
  size = 'md',
  className,
}) {
  const id = useId()
  const inputRef = useRef(null)
  const [draft, setDraft] = useState(value)

  useEffect(() => setDraft(value), [value])

  useEffect(() => {
    if (draft === value) return
    const timer = setTimeout(() => onChange(draft), delay)
    return () => clearTimeout(timer) // typed again: restart the wait
  }, [draft, value, delay, onChange])

  const clear = () => {
    setDraft('')
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <div className={cx('flex flex-col gap-1', className)}>
      <label htmlFor={id} className={cx('text-xs font-medium text-ink-soft', hideLabel && 'sr-only')}>
        {label}
      </label>
      <div className="relative">
        <SearchIcon size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint" />
        <input
          ref={inputRef}
          id={id}
          type="search"
          value={draft}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck="false"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && draft) {
              event.preventDefault()
              clear()
            }
          }}
          className={cx(
            'w-full rounded-lg border border-line-strong bg-panel pr-9 pl-9 text-sm text-ink placeholder:text-ink-faint',
            '[&::-webkit-search-cancel-button]:appearance-none',
            size === 'sm' ? 'h-8' : 'h-10',
          )}
        />
        {draft && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-ink-soft hover:bg-panel-2 hover:text-ink"
          >
            <CloseIcon size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
