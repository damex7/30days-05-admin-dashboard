import { useId } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { safeId } from '../../lib/cx.js'
import { formatBucket, formatBucketLong, formatChange, formatNaira, formatNairaCompact } from '../../lib/format.js'
import ChartFigure, { ChartLegend } from './ChartFigure.jsx'
import ChartTooltip, { TooltipRow } from './ChartTooltip.jsx'
import { axisProps, gridProps, usePrefersReducedMotion } from './chartTheme.js'

const CURRENT = 'var(--color-chart-1)'
const PREVIOUS = 'var(--color-chart-muted)'

const TABLE_COLUMNS = [
  { key: 'key', header: 'Period', accessor: (r) => r.key, cell: (r) => formatBucketLong(r.key), sortable: true },
  { key: 'revenue', header: 'Revenue', accessor: (r) => r.revenue, cell: (r) => formatNaira(r.revenue), align: 'right', sortable: true },
  { key: 'previous', header: 'Previous period', accessor: (r) => r.previous, cell: (r) => formatNaira(r.previous), align: 'right', sortable: true },
]

function summarise(series, rangeLabel, unit) {
  const total = series.reduce((sum, d) => sum + d.revenue, 0)
  const previous = series.reduce((sum, d) => sum + d.previous, 0)
  const best = series.reduce((top, d) => (d.revenue > top.revenue ? d : top), series[0])
  const change = previous ? (total - previous) / previous : null
  const comparison = change == null ? '' : ` (${formatChange(change)} vs the previous ${rangeLabel})`
  return `${formatNairaCompact(total)} in revenue over the last ${rangeLabel}${comparison}. The strongest ${unit} was ${formatBucketLong(best.key)} at ${formatNairaCompact(best.revenue)}. Cancelled orders are not counted.`
}

/** Revenue per day (or month), with the previous period as a dashed comparison line. */
export default function RevenueChart({ data, rangeLabel, unit, status, error, onRetry, className }) {
  const gradientId = safeId(useId())
  const reduceMotion = usePrefersReducedMotion()
  const ready = status === 'success' && data

  return (
    <ChartFigure
      title="Revenue over time"
      description={ready ? `${unit === 'month' ? 'Monthly' : 'Daily'} revenue, last ${rangeLabel}` : 'Revenue for the selected range'}
      status={ready ? 'success' : status === 'error' ? 'error' : 'loading'}
      error={error}
      onRetry={onRetry}
      height={280}
      className={className}
      legend={
        <ChartLegend
          items={[
            { label: 'This period', color: CURRENT },
            { label: 'Previous period', color: PREVIOUS, dashed: true },
          ]}
        />
      }
      summary={ready ? summarise(data, rangeLabel, unit) : null}
      table={ready ? { columns: TABLE_COLUMNS, rows: data } : null}
    >
      {ready && (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CURRENT} stopOpacity={0.16} />
                <stop offset="100%" stopColor={CURRENT} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="key" tickFormatter={formatBucket} minTickGap={28} tickMargin={8} {...axisProps} />
            <YAxis tickFormatter={formatNairaCompact} width={56} {...axisProps} />
            <Tooltip
              cursor={{ stroke: 'var(--color-line-strong)', strokeWidth: 1 }}
              content={(props) => (
                <ChartTooltip
                  {...props}
                  render={(point) => (
                    <>
                      <p className="mb-1 font-semibold">{formatBucketLong(point.key)}</p>
                      <TooltipRow color={CURRENT} label="Revenue" value={formatNaira(point.revenue)} />
                      <TooltipRow
                        color={PREVIOUS}
                        dashed
                        label={formatBucket(point.previousKey)}
                        value={formatNaira(point.previous)}
                      />
                    </>
                  )}
                />
              )}
            />
            <Area
              type="monotone"
              dataKey="previous"
              stroke={PREVIOUS}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="none"
              dot={false}
              activeDot={false}
              isAnimationActive={!reduceMotion}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={CURRENT}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4.5, fill: CURRENT, stroke: 'var(--color-panel)', strokeWidth: 2 }}
              isAnimationActive={!reduceMotion}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartFigure>
  )
}
