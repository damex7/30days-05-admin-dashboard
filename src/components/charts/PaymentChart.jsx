import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatNaira, formatNumber, formatPercent } from '../../lib/format.js'
import ChartFigure from './ChartFigure.jsx'
import ChartTooltip, { TooltipRow } from './ChartTooltip.jsx'
import { SERIES, usePrefersReducedMotion } from './chartTheme.js'

// Colour follows the payment method (fixed order), never its rank,
// so "Card" is the same colour in every range.
const COLOR_BY_METHOD = { transfer: SERIES[0], card: SERIES[1], cod: SERIES[2] }

const TABLE_COLUMNS = [
  { key: 'label', header: 'Method', sortable: true },
  { key: 'orders', header: 'Orders', cell: (r) => formatNumber(r.orders), align: 'right', sortable: true },
  { key: 'share', header: 'Share', cell: (r) => formatPercent(r.share), align: 'right', sortable: true },
  { key: 'revenue', header: 'Revenue', cell: (r) => formatNaira(r.revenue), align: 'right', sortable: true },
]

function summarise(data) {
  const ranked = [...data].sort((a, b) => b.orders - a.orders)
  const [first, ...rest] = ranked
  const others = rest.map((m) => `${m.label.toLowerCase()} (${formatPercent(m.share)})`).join(' and ')
  return `${first.label} was the most used payment method, at ${formatPercent(first.share)} of orders, followed by ${others}.`
}

/** Share of orders by payment method: a donut with a labelled legend beside it. */
export default function PaymentChart({ data, status, error, onRetry, className }) {
  const reduceMotion = usePrefersReducedMotion()
  const ready = status === 'success' && data
  const totalOrders = ready ? data.reduce((sum, m) => sum + m.orders, 0) : 0

  return (
    <ChartFigure
      title="Payment methods"
      description="Share of orders by how customers paid"
      status={ready ? 'success' : status === 'error' ? 'error' : 'loading'}
      error={error}
      onRetry={onRetry}
      height="auto"
      className={className}
      summary={ready ? summarise(data) : null}
      table={ready ? { columns: TABLE_COLUMNS, rows: data, rowKey: 'method' } : null}
    >
      {ready && (
        <div className="flex flex-col items-center gap-5 sm:flex-row lg:flex-col">
          <div className="relative size-44 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="orders"
                  nameKey="label"
                  innerRadius="64%"
                  outerRadius="100%"
                  startAngle={90}
                  endAngle={-270}
                  stroke="var(--color-panel)"
                  strokeWidth={2}
                  isAnimationActive={!reduceMotion}
                >
                  {data.map((m) => (
                    <Cell key={m.method} fill={COLOR_BY_METHOD[m.method]} />
                  ))}
                </Pie>
                <Tooltip
                  content={(props) => (
                    <ChartTooltip
                      {...props}
                      render={(m) => (
                        <>
                          <p className="mb-1 font-semibold">{m.label}</p>
                          <TooltipRow color={COLOR_BY_METHOD[m.method]} label="Orders" value={formatNumber(m.orders)} />
                          <TooltipRow color={COLOR_BY_METHOD[m.method]} label="Share" value={formatPercent(m.share)} />
                          <TooltipRow color={COLOR_BY_METHOD[m.method]} label="Revenue" value={formatNaira(m.revenue)} />
                        </>
                      )}
                    />
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl font-semibold text-ink">{formatNumber(totalOrders)}</span>
              <span className="text-xs text-ink-soft">orders</span>
            </div>
          </div>
          <ul className="w-full min-w-0 flex-1 divide-y divide-line text-sm">
            {data.map((m) => (
              <li key={m.method} className="flex items-center gap-3 py-2">
                <span aria-hidden="true" className="size-2.5 shrink-0 rounded-sm" style={{ background: COLOR_BY_METHOD[m.method] }} />
                <span className="min-w-0 flex-1 truncate text-ink">{m.label}</span>
                <span className="font-medium tabular text-ink">{formatPercent(m.share)}</span>
                <span className="w-12 text-right text-xs tabular text-ink-faint">{formatNumber(m.orders)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartFigure>
  )
}
