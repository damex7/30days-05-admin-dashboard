import { useCallback } from 'react'
import CustomerDrawer from '../components/customers/CustomerDrawer.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import TableCard from '../components/layout/TableCard.jsx'
import { Button, DataTable, EmptyState, Pagination, SearchInput } from '../components/ui'
import { useAsync } from '../hooks/useAsync.js'
import { useUrlState } from '../hooks/useUrlState.js'
import { getCustomers } from '../lib/api.js'
import { formatDate, formatNaira, formatNumber } from '../lib/format.js'

const URL_DEFAULTS = { q: '', sort: 'totalSpent:desc', page: 1, customer: '' }

const COLUMNS = [
  {
    key: 'name',
    header: 'Customer',
    accessor: (r) => r.name,
    cell: (r) => (
      <span className="flex flex-col items-start">
        <span>{r.name}</span>
        <span className="text-xs font-normal text-ink-soft">{r.email}</span>
      </span>
    ),
    sortable: true,
  },
  { key: 'city', header: 'City', accessor: (r) => r.city, sortable: true, hideBelow: 'sm' },
  { key: 'joinedAt', header: 'Joined', accessor: (r) => r.joinedAt, cell: (r) => formatDate(r.joinedAt), sortable: true, firstSort: 'desc', hideBelow: 'lg' },
  { key: 'orderCount', header: 'Orders', accessor: (r) => r.orderCount, cell: (r) => formatNumber(r.orderCount), align: 'right', sortable: true },
  { key: 'totalSpent', header: 'Total spent', accessor: (r) => r.totalSpent, cell: (r) => formatNaira(r.totalSpent), align: 'right', sortable: true },
  {
    key: 'lastOrderAt',
    header: 'Last order',
    accessor: (r) => r.lastOrderAt,
    cell: (r) => (r.lastOrderAt ? formatDate(r.lastOrderAt) : <span className="text-ink-faint">Never</span>),
    sortable: true,
    firstSort: 'desc',
    hideBelow: 'md',
  },
]

export default function Customers() {
  const [params, setUrl] = useUrlState(URL_DEFAULTS)
  const { status, data, error, retry } = useAsync(
    () => getCustomers({ query: params.q, sort: params.sort, page: params.page }),
    [params.q, params.sort, params.page],
  )
  const setSearch = useCallback((q) => setUrl({ q, page: 1 }, { replace: true }), [setUrl])

  return (
    <>
      <PageHeader
        title="Customers"
        description={data ? `${formatNumber(data.total)} customers${params.q ? ' match your search' : ''}` : 'Everyone who has an account with the store'}
      />

      <TableCard
        toolbar={
          <SearchInput
            className="w-full sm:w-72"
            label="Search customers"
            placeholder="Name, email or city"
            value={params.q}
            onChange={setSearch}
          />
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
          caption="Customers"
          columns={COLUMNS}
          rows={data?.rows ?? []}
          sort={params.sort}
          defaultSort={URL_DEFAULTS.sort}
          onSortChange={(sort) => setUrl({ sort, page: 1 })}
          onRowClick={(row) => setUrl({ customer: row.id })}
          rowLabel={(row) => `Open customer ${row.name}`}
          status={status}
          error={error}
          onRetry={retry}
          skeletonRows={10}
          emptyState={
            <EmptyState
              title="No customers found"
              message={`Nobody matches “${params.q}”. Check the spelling or search by email.`}
              action={
                <Button size="sm" onClick={() => setUrl({ q: '', page: 1 })}>
                  Clear search
                </Button>
              }
            />
          }
        />
      </TableCard>

      <CustomerDrawer customerId={params.customer || null} onClose={() => setUrl({ customer: '' }, { replace: true })} />
    </>
  )
}
