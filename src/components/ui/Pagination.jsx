import { cx } from '../../lib/cx.js'
import { formatNumber } from '../../lib/format.js'
import Button from './Button.jsx'
import { ChevronLeftIcon, ChevronRightIcon } from './Icons.jsx'

/** "Showing 11–20 of 278" with Previous / Next. Simple enough to fit a phone. */
export default function Pagination({ page, pageCount, total, pageSize, onPageChange, label = 'Pagination', className }) {
  if (!total) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <nav aria-label={label} className={cx('flex flex-wrap items-center justify-between gap-3', className)}>
      <p className="text-sm text-ink-soft tabular" aria-live="polite">
        Showing <span className="font-medium text-ink">{formatNumber(from)}</span>–
        <span className="font-medium text-ink">{formatNumber(to)}</span> of{' '}
        <span className="font-medium text-ink">{formatNumber(total)}</span>
      </p>
      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-ink-soft tabular sm:inline">
          Page {page} of {pageCount}
        </span>
        <Button
          size="sm"
          icon={<ChevronLeftIcon size={16} />}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button size="sm" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
          Next
          <ChevronRightIcon size={16} />
        </Button>
      </div>
    </nav>
  )
}
