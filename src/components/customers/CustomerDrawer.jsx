import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, DataTable, Drawer, EmptyState, ErrorState, Skeleton, StatusBadge, Tabs } from '../ui'
import { useAsync } from '../../hooks/useAsync.js'
import { getCustomer } from '../../lib/api.js'
import { formatDate, formatNaira, formatNumber } from '../../lib/format.js'

// Uncontrolled DataTable: all of this customer's orders are loaded, so it sorts them itself
const ORDER_COLUMNS = [
  { key: 'id', header: 'Order', accessor: (r) => r.id, cell: (r) => <span className="font-mono text-xs">{r.id}</span>, sortable: true },
  { key: 'createdAt', header: 'Date', accessor: (r) => r.createdAt, cell: (r) => formatDate(r.createdAt), sortable: true, firstSort: 'desc' },
  { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} size="sm" /> },
  { key: 'total', header: 'Total', accessor: (r) => r.total, cell: (r) => formatNaira(r.total), align: 'right', sortable: true },
]

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-panel-2 p-3">
      <dt className="text-xs text-ink-soft">{label}</dt>
      <dd className="mt-1 font-display text-lg font-semibold tabular">{value}</dd>
    </div>
  )
}

/** Customer details: lifetime stats, contact details and order history. */
export default function CustomerDrawer({ customerId, onClose }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('orders')
  const { status, data, error, retry } = useAsync(
    () => (customerId ? getCustomer(customerId) : Promise.resolve(null)),
    [customerId],
  )
  const customer = data?.id === customerId ? data : null

  return (
    <Drawer
      open={Boolean(customerId)}
      onClose={onClose}
      width="lg"
      title={customer?.name ?? 'Customer'}
      description={customer ? `${customer.id} · customer since ${formatDate(customer.joinedAt)}` : ' '}
      footer={<Button onClick={onClose}>Close</Button>}
    >
      {status === 'error' ? (
        <ErrorState compact title="Couldn't load this customer" error={error} onRetry={error?.status === 404 ? undefined : retry} />
      ) : !customer ? (
        <div className="flex flex-col gap-6 p-5" aria-busy="true">
          <span className="sr-only">Loading customer</span>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} variant="rect" height={64} />
            ))}
          </div>
          <Skeleton lines={6} />
        </div>
      ) : (
        <div className="flex flex-col gap-6 p-5 text-sm">
          <dl className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-3">
            <Stat label="Total spent" value={formatNaira(customer.totalSpent)} />
            <Stat label="Orders" value={formatNumber(customer.orderCount)} />
            <Stat label="Average order" value={customer.averageOrder ? formatNaira(customer.averageOrder) : '—'} />
          </dl>

          <Tabs
            label="Customer details"
            value={tab}
            onChange={setTab}
            tabs={[
              {
                value: 'orders',
                label: `Orders (${customer.orders.length})`,
                content:
                  customer.orders.length === 0 ? (
                    <EmptyState compact title="No orders yet" message="This customer has an account but hasn't ordered anything." />
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-line">
                      <DataTable
                        caption={`Orders by ${customer.name}`}
                        columns={ORDER_COLUMNS}
                        rows={customer.orders}
                        defaultSort="createdAt:desc"
                        onRowClick={(row) => navigate(`/orders?order=${row.id}`)}
                        rowLabel={(row) => `Open order ${row.id}`}
                        dense
                      />
                    </div>
                  ),
              },
              {
                value: 'details',
                label: 'Contact',
                content: (
                  <dl className="grid gap-4 sm:grid-cols-2">
                    {[
                      ['Email', customer.email],
                      ['Phone', customer.phone],
                      ['City', `${customer.city}, ${customer.state}`],
                      ['Last order', customer.lastOrderAt ? formatDate(customer.lastOrderAt) : 'Never'],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs text-ink-soft">{label}</dt>
                        <dd className="mt-1 font-medium break-all">{value}</dd>
                      </div>
                    ))}
                  </dl>
                ),
              },
            ]}
          />
        </div>
      )}
    </Drawer>
  )
}
