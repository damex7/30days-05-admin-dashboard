import { Link, useNavigate } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import CategoryChart from '../components/charts/CategoryChart.jsx'
import PaymentChart from '../components/charts/PaymentChart.jsx'
import RevenueChart from '../components/charts/RevenueChart.jsx'
import { Card, DataTable, ErrorState, SegmentedControl, Skeleton, StatCard, StatusBadge } from '../components/ui'
import { useAsync } from '../hooks/useAsync.js'
import { useUrlState } from '../hooks/useUrlState.js'
import { getOverview } from '../lib/api.js'
import { DEFAULT_RANGE, getRange, RANGES } from '../lib/dates.js'
import { formatDateTime, formatNaira, formatNairaCompact, formatNumber } from '../lib/format.js'

const URL_DEFAULTS = { range: DEFAULT_RANGE }

const RANGE_OPTIONS = RANGES.map((r) => ({ value: r.value, label: r.short, ariaLabel: `Last ${r.label}` }))

const KPI_FORMATS = {
  revenue: formatNairaCompact,
  orders: formatNumber,
  aov: formatNaira,
  newCustomers: formatNumber,
}

const RECENT_COLUMNS = [
  { key: 'id', header: 'Order', cell: (r) => <span className="font-mono text-xs">{r.id}</span> },
  { key: 'customer', header: 'Customer', accessor: (r) => r.customerName },
  { key: 'createdAt', header: 'Placed', cell: (r) => formatDateTime(r.createdAt), hideBelow: 'md' },
  { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} size="sm" /> },
  { key: 'total', header: 'Total', accessor: (r) => r.total, cell: (r) => formatNaira(r.total), align: 'right' },
]

export default function Overview() {
  const navigate = useNavigate()
  const [{ range }, setUrl] = useUrlState(URL_DEFAULTS)
  const rangeInfo = getRange(range)
  const { status, data, error, retry } = useAsync(() => getOverview({ range: rangeInfo.value }), [rangeInfo.value])

  // While a new range loads, keep showing the old numbers (dimmed) rather than skeletons
  const loading = status === 'loading' && !data
  const refreshing = status === 'loading' && data
  const sectionStatus = loading ? 'loading' : 'success'

  return (
    <>
      <PageHeader
        title="Overview"
        description={`How the store is doing over the last ${rangeInfo.label}, compared with the ${rangeInfo.label} before.`}
        actions={
          <SegmentedControl
            label="Date range"
            options={RANGE_OPTIONS}
            value={rangeInfo.value}
            onChange={(value) => setUrl({ range: value })}
          />
        }
      />

      {status === 'error' ? (
        <Card>
          <ErrorState title="Couldn't load the overview" error={error} onRetry={retry} />
        </Card>
      ) : (
        <div className={refreshing ? 'opacity-60 transition-opacity' : 'transition-opacity'} aria-busy={status === 'loading'}>
          <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }, (_, i) => <StatCard key={i} loading />)
              : data.kpis.map((kpi) => (
                  <StatCard
                    key={kpi.key}
                    label={kpi.label}
                    value={kpi.value}
                    format={KPI_FORMATS[kpi.key]}
                    change={kpi.change}
                    comparisonLabel={`vs previous ${data.rangeLabel}`}
                    trendData={kpi.series}
                  />
                ))}
          </section>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <RevenueChart
              className="lg:col-span-2"
              status={sectionStatus}
              data={data?.revenueSeries}
              rangeLabel={data?.rangeLabel}
              unit={data?.unit}
            />
            <PaymentChart status={sectionStatus} data={data?.byPayment} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <CategoryChart status={sectionStatus} data={data?.byCategory} />
            <TopProducts loading={loading} products={data?.topProducts} />
          </div>

          <Card
            className="mt-4"
            padding="none"
            title="Recent orders"
            titleId="recent-orders"
            description="The latest orders in this range"
            actions={
              <Link to={`/orders?range=${rangeInfo.value}`} className="text-sm font-medium text-primary hover:underline">
                View all orders
              </Link>
            }
          >
            <DataTable
              caption="Recent orders"
              columns={RECENT_COLUMNS}
              rows={data?.recentOrders ?? []}
              status={loading ? 'loading' : 'success'}
              skeletonRows={6}
              onRowClick={(row) => navigate(`/orders?order=${row.id}`)}
              rowLabel={(row) => `Open order ${row.id}`}
            />
          </Card>
        </div>
      )}
    </>
  )
}

function TopProducts({ loading, products }) {
  const top = products?.[0]?.revenue || 1
  return (
    <Card title="Top products" description="Best sellers by revenue in this range">
      {loading ? (
        <div className="flex flex-col gap-5" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i}>
              <Skeleton width="60%" />
              <Skeleton height={6} className="mt-2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-soft">No sales in this range.</p>
      ) : (
        <ol className="flex flex-col gap-4">
          {products.map((product, index) => (
            <li key={product.id} className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-baseline gap-x-3">
              <span className="font-display text-sm font-semibold text-ink-faint tabular">{index + 1}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink">{product.name}</span>
                <span className="text-xs text-ink-soft">
                  {product.category} · {formatNumber(product.units)} sold
                </span>
              </span>
              <span className="text-sm font-semibold tabular text-ink">{formatNairaCompact(product.revenue)}</span>
              {/* A meter: the bar shows revenue relative to the best seller */}
              <span className="col-start-2 col-end-4 mt-1.5 h-1.5 overflow-hidden rounded-full bg-primary-soft" aria-hidden="true">
                <span
                  className="block h-full rounded-full bg-[var(--color-chart-1)]"
                  style={{ width: `${(product.revenue / top) * 100}%` }}
                />
              </span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}
