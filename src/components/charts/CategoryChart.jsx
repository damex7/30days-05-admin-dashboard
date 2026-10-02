import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNaira, formatNairaCompact, formatNumber } from '../../lib/format.js'
import ChartFigure from './ChartFigure.jsx'
import ChartTooltip, { TooltipRow } from './ChartTooltip.jsx'
import { usePrefersReducedMotion } from './chartTheme.js'

// Categories are names, not a scale, and bar length already shows the size,
// so every bar uses the same colour (no legend needed for one series).
const COLOR = 'var(--color-chart-1)'

const TABLE_COLUMNS = [
  { key: 'category', header: 'Category', sortable: true },
  { key: 'orders', header: 'Orders', cell: (r) => formatNumber(r.orders), align: 'right', sortable: true },
  { key: 'revenue', header: 'Revenue', cell: (r) => formatNaira(r.revenue), align: 'right', sortable: true },
]

function summarise(data) {
  const [top] = data
  const byRevenue = [...data].sort((a, b) => b.revenue - a.revenue)[0]
  const same = top.category === byRevenue.category
  return `${top.category} appeared in the most orders (${formatNumber(top.orders)}). ${
    same ? 'It also' : `${byRevenue.category}`
  } brought in the most revenue (${formatNairaCompact(byRevenue.revenue)}). One order can include items from several categories, so it may count more than once.`
}

/** Number of orders containing each category, as horizontal bars. */
export default function CategoryChart({ data, status, error, onRetry, className }) {
  const reduceMotion = usePrefersReducedMotion()
  const ready = status === 'success' && data

  return (
    <ChartFigure
      title="Orders by category"
      description="Orders that include at least one item from each category"
      status={ready ? 'success' : status === 'error' ? 'error' : 'loading'}
      error={error}
      onRetry={onRetry}
      height={200}
      className={className}
      summary={ready ? summarise(data) : null}
      table={ready ? { columns: TABLE_COLUMNS, rows: data, rowKey: 'category' } : null}
    >
      {ready && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 44, left: 0, bottom: 0 }} barCategoryGap={12}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="category"
              width={92}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--color-ink-soft)', fontSize: 13 }}
            />
            <Tooltip
              cursor={{ fill: 'var(--color-panel-2)' }}
              content={(props) => (
                <ChartTooltip
                  {...props}
                  render={(row) => (
                    <>
                      <p className="mb-1 font-semibold">{row.category}</p>
                      <TooltipRow color={COLOR} label="Orders" value={formatNumber(row.orders)} />
                      <TooltipRow color={COLOR} label="Revenue" value={formatNaira(row.revenue)} />
                    </>
                  )}
                />
              )}
            />
            <Bar dataKey="orders" fill={COLOR} barSize={22} radius={[0, 4, 4, 0]} isAnimationActive={!reduceMotion}>
              <LabelList
                dataKey="orders"
                position="right"
                formatter={formatNumber}
                fill="var(--color-ink-soft)"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFigure>
  )
}
