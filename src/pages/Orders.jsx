import { useCallback, useState } from 'react'
import PageHeader from '../components/layout/PageHeader.jsx'
import TableCard from '../components/layout/TableCard.jsx'
import OrderDrawer from '../components/orders/OrderDrawer.jsx'
import {
  Button,
  DataTable,
  DownloadIcon,
  EmptyState,
  ORDER_STATUS_META,
  Pagination,
  SearchInput,
  SegmentedControl,
  Select,
  StatusBadge,
} from '../components/ui'
import { useAsync } from '../hooks/useAsync.js'
import { useUrlState } from '../hooks/useUrlState.js'
import { getAllOrders, getOrders, ORDER_STATUSES, PAYMENT_METHODS } from '../lib/api.js'
import { downloadCSV, toCSV } from '../lib/csv.js'
import { DEFAULT_RANGE, getRange, RANGES, TODAY } from '../lib/dates.js'
import { formatDateTime, formatNaira, formatNumber } from '../lib/format.js'

const URL_DEFAULTS = { range: DEFAULT_RANGE, status: 'all', q: '', sort: 'createdAt:desc', page: 1, order: '' }

const RANGE_OPTIONS = RANGES.map((r) => ({ value: r.value, label: r.short, ariaLabel: `Last ${r.label}` }))
const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_META[s].label })),
]
const paymentLabel = (value) => PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value

// The columns config: the same shape drives the Customers and Products tables.
const COLUMNS = [
  { key: 'id', header: 'Order', accessor: (r) => r.id, cell: (r) => <span className="font-mono text-xs">{r.id}</span>, sortable: true },
  { key: 'customer', header: 'Customer', accessor: (r) => r.customerName, sortable: true },
  { key: 'createdAt', header: 'Placed', accessor: (r) => r.createdAt, cell: (r) => formatDateTime(r.createdAt), sortable: true, firstSort: 'desc', hideBelow: 'md' },
  { key: 'status', header: 'Status', accessor: (r) => r.status, cell: (r) => <StatusBadge status={r.status} size="sm" />, sortable: true },
  { key: 'payment', header: 'Payment', accessor: (r) => paymentLabel(r.paymentMethod), hideBelow: 'lg' },
  { key: 'items', header: 'Items', accessor: (r) => r.itemCount, align: 'right', sortable: true, hideBelow: 'lg' },
  { key: 'total', header: 'Total', accessor: (r) => r.total, cell: (r) => formatNaira(r.total), align: 'right', sortable: true },
]

// CSV uses each column's raw accessor value (ISO dates, plain numbers), plus the city
const CSV_COLUMNS = [
  ...COLUMNS.map((c) => ({ header: c.header, value: c.accessor })),
  { header: 'City', value: (r) => r.city },
]

export default function Orders() {
  const [params, setUrl] = useUrlState(URL_DEFAULTS)
  const range = getRange(params.range).value
  const filters = { range, status: params.status, query: params.q, sort: params.sort }
  const { status, data, error, retry } = useAsync(
    () => getOrders({ ...filters, page: params.page }),
    [range, params.status, params.q, params.sort, params.page],
  )
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState(null)

  // Any filter change goes back to page 1; typing replaces the history entry
  const setSearch = useCallback((q) => setUrl({ q, page: 1 }, { replace: true }), [setUrl])
  const filtered = params.status !== 'all' || params.q

  async function exportCSV() {
    setExporting(true)
    setExportError(null)
    try {
      const rows = await getAllOrders(filters)
      const name = ['kasuwa-orders', range, params.status !== 'all' && params.status, TODAY].filter(Boolean).join('-')
      downloadCSV(`${name}.csv`, toCSV(rows, CSV_COLUMNS))
    } catch (err) {
      setExportError(err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Orders"
        description={data ? `${formatNumber(data.total)} orders in the last ${getRange(range).label}` : 'Every order placed in the selected range'}
        actions={
          <Button icon={<DownloadIcon size={16} />} loading={exporting} disabled={!data?.total} onClick={exportCSV}>
            Export CSV
          </Button>
        }
      />

      {exportError && (
        <p role="alert" className="mb-4 rounded-lg border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
          Export failed: {exportError.message}
        </p>
      )}

      <TableCard
        toolbar={
          <>
            <SearchInput
              className="w-full sm:w-64"
              label="Search orders"
              placeholder="Order, customer or city"
              value={params.q}
              onChange={setSearch}
            />
            <Select
              label="Status"
              hideLabel
              className="w-full min-[420px]:w-44"
              options={STATUS_OPTIONS}
              value={params.status}
              onChange={(value) => setUrl({ status: value, page: 1 })}
            />
            <SegmentedControl
              className="sm:ml-auto"
              label="Date range"
              options={RANGE_OPTIONS}
              value={range}
              onChange={(value) => setUrl({ range: value, page: 1 })}
            />
          </>
        }
        footer={
          data && (
            <Pagination
              page={data.page}
              pageCount={data.pageCount}
              total={data.total}
              pageSize={data.pageSize}
              onPageChange={(page) => setUrl({ page })}
            />
          )
        }
      >
        <DataTable
          caption="Orders"
          columns={COLUMNS}
          rows={data?.rows ?? []}
          sort={params.sort}
          defaultSort={URL_DEFAULTS.sort}
          onSortChange={(sort) => setUrl({ sort, page: 1 })}
          onRowClick={(row) => setUrl({ order: row.id })}
          rowLabel={(row) => `Open order ${row.id}`}
          status={status}
          error={error}
          onRetry={retry}
          skeletonRows={10}
          emptyState={
            <EmptyState
              title="No orders match"
              message={filtered ? 'Try a different search or status, or a longer date range.' : 'No orders were placed in this range.'}
              action={
                filtered && (
                  <Button size="sm" onClick={() => setUrl({ q: '', status: 'all', page: 1 })}>
                    Clear filters
                  </Button>
                )
              }
            />
          }
        />
      </TableCard>

      <OrderDrawer orderId={params.order || null} onClose={() => setUrl({ order: '' }, { replace: true })} />
    </>
  )
}
