import { cx } from '../../lib/cx.js'
import { formatChange } from '../../lib/format.js'
import { ArrowDownIcon, ArrowUpIcon } from './Icons.jsx'
import Skeleton from './Skeleton.jsx'
import Sparkline from './Sparkline.jsx'

/*
  A KPI tile: label, big number, change vs the previous period, sparkline.
  `format` turns the raw number into text. `invertTrend` is for metrics
  where going down is good (e.g. refunds), so the colours flip.
*/
export default function StatCard({
  label,
  value,
  format = String,
  change,
  comparisonLabel = 'vs previous period',
  trendData,
  invertTrend = false,
  loading = false,
  className,
}) {
  if (loading) {
    return (
      <div className={cx('rounded-xl border border-line bg-panel p-5 shadow-card', className)} aria-hidden="true">
        <Skeleton width="45%" />
        <Skeleton height={32} width="70%" className="mt-3" />
        <Skeleton width="55%" className="mt-3" />
        <Skeleton height={32} className="mt-4" />
      </div>
    )
  }

  const direction = change == null || Math.abs(change) < 0.0005 ? 'flat' : change > 0 ? 'up' : 'down'
  const good = direction === 'flat' ? null : (direction === 'up') !== invertTrend
  const words = { up: 'Up', down: 'Down', flat: 'No change' }[direction]

  return (
    <div className={cx('flex min-w-0 flex-col rounded-xl border border-line bg-panel p-5 shadow-card', className)}>
      <p className="text-sm font-medium text-ink-soft">{label}</p>
      <p className="mt-1 truncate font-display text-[1.75rem] leading-tight font-semibold text-ink">
        {format(value)}
      </p>
      <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-ink-soft">
        <span
          className={cx(
            'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold tabular',
            good === true && 'bg-success-soft text-success',
            good === false && 'bg-danger-soft text-danger',
            good === null && 'bg-panel-2 text-ink-soft',
          )}
        >
          {direction === 'up' && <ArrowUpIcon size={12} />}
          {direction === 'down' && <ArrowDownIcon size={12} />}
          <span className="sr-only">{words} </span>
          {formatChange(change)}
        </span>
        <span>{comparisonLabel}</span>
      </p>
      {trendData && <Sparkline data={trendData} className="mt-4" />}
    </div>
  )
}
