import { useId, useRef } from 'react'
import { cx } from '../../lib/cx.js'

/*
  ARIA tabs: a tablist of buttons plus the active panel. Arrow keys move
  between tabs; Tab moves into the panel. Only the active panel renders.
  tabs: [{ value, label, content }]
*/
export default function Tabs({ tabs, value, onChange, label, className }) {
  const baseId = useId()
  const listRef = useRef(null)
  const active = tabs.find((tab) => tab.value === value) ?? tabs[0]

  const onKeyDown = (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key]
    const edge = { Home: 0, End: tabs.length - 1 }[event.key]
    if (step == null && edge == null) return
    event.preventDefault()
    const current = tabs.findIndex((tab) => tab.value === active.value)
    const next = edge ?? (current + step + tabs.length) % tabs.length
    onChange(tabs[next].value)
    listRef.current.querySelectorAll('[role="tab"]')[next]?.focus()
  }

  return (
    <div className={className}>
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="flex gap-1 overflow-x-auto border-b border-line"
      >
        {tabs.map((tab) => {
          const selected = tab.value === active.value
          return (
            <button
              key={tab.value}
              id={`${baseId}-tab-${tab.value}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.value)}
              className={cx(
                '-mb-px shrink-0 border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                selected ? 'border-primary text-ink' : 'border-transparent text-ink-soft hover:text-ink',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active.value}`}
        tabIndex={0}
        className="pt-4"
      >
        {active.content}
      </div>
    </div>
  )
}
