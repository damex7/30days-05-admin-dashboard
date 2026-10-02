import { useCallback } from 'react'
import PageHeader from '../components/layout/PageHeader.jsx'
import TableCard from '../components/layout/TableCard.jsx'
import { Button, DataTable, EmptyState, Pagination, SearchInput, Select, StockBadge } from '../components/ui'
import { useAsync } from '../hooks/useAsync.js'
import { useUrlState } from '../hooks/useUrlState.js'
import { CATEGORIES, getProducts } from '../lib/api.js'
import { cx } from '../lib/cx.js'
import { formatNaira, formatNumber } from '../lib/format.js'

const URL_DEFAULTS = { q: '', category: 'all', stock: 'all', sort: 'name:asc', page: 1 }

const CATEGORY_OPTIONS = [{ value: 'all', label: 'All categories' }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]
const STOCK_OPTIONS = [
  { value: 'all', label: 'Any stock level' },
  { value: 'low', label: 'Low stock' },
  { value: 'out', label: 'Out of stock' },
  { value: 'ok', label: 'In stock' },
]

const STOCK_BAR = { ok: 'bg-success', low: 'bg-warning', out: 'bg-danger' }
const FULL_STOCK = 180 // the most a product is stocked with, for the bar scale

function StockLevel({ product }) {
  return (
    <span className="flex items-center gap-3">
      <span className="w-8 text-right tabular">{formatNumber(product.stock)}</span>
      <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-panel-2 sm:block" aria-hidden="true">
        <span
          className={cx('block h-full rounded-full', STOCK_BAR[product.stockStatus])}
          style={{ width: `${Math.min(100, (product.stock / FULL_STOCK) * 100)}%` }}
        />
      </span>
      {product.stockStatus !== 'ok' && <StockBadge status={product.stockStatus} size="sm" />}
    </span>
  )
}

const COLUMNS = [
  {
    key: 'name',
    header: 'Product',
    accessor: (r) => r.name,
    cell: (r) => (
      <span className="flex flex-col items-start">
        <span>{r.name}</span>
        <span className="font-mono text-xs font-normal text-ink-soft">{r.sku}</span>
      </span>
    ),
    sortable: true,
  },
  { key: 'category', header: 'Category', accessor: (r) => r.category, sortable: true, hideBelow: 'sm' },
  { key: 'price', header: 'Price', accessor: (r) => r.price, cell: (r) => formatNaira(r.price), align: 'right', sortable: true },
  { key: 'stock', header: 'Stock', accessor: (r) => r.stock, cell: (r) => <StockLevel product={r} />, sortable: true, firstSort: 'asc' },
  { key: 'sold30d', header: 'Sold (30 days)', accessor: (r) => r.sold30d, cell: (r) => formatNumber(r.sold30d), align: 'right', sortable: true, hideBelow: 'md' },
]

export default function Products() {
  const [params, setUrl] = useUrlState(URL_DEFAULTS)
  const { status, data, error, retry } = useAsync(
    () => getProducts({ query: params.q, category: params.category, stock: params.stock, sort: params.sort, page: params.page }),
    [params.q, params.category, params.stock, params.sort, params.page],
  )
  const setSearch = useCallback((q) => setUrl({ q, page: 1 }, { replace: true }), [setUrl])

  return (
    <>
      <PageHeader
        title="Products"
        description="Prices, stock levels and recent sales. Items at or below their reorder level are marked low stock."
        actions={
          params.stock !== 'low' && (
            <Button size="sm" onClick={() => setUrl({ stock: 'low', page: 1 })}>
              Show low stock
            </Button>
          )
        }
      />

      <TableCard
        toolbar={
          <>
            <SearchInput
              className="w-full sm:w-64"
              label="Search products"
              placeholder="Product name or SKU"
              value={params.q}
              onChange={setSearch}
            />
            <Select
              label="Category"
              hideLabel
              className="w-full min-[420px]:w-44"
              options={CATEGORY_OPTIONS}
              value={params.category}
              onChange={(value) => setUrl({ category: value, page: 1 })}
            />
            <Select
              label="Stock level"
              hideLabel
              className="w-full min-[420px]:w-44"
              options={STOCK_OPTIONS}
              value={params.stock}
              onChange={(value) => setUrl({ stock: value, page: 1 })}
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
          caption="Products"
          columns={COLUMNS}
          rows={data?.rows ?? []}
          sort={params.sort}
          defaultSort={URL_DEFAULTS.sort}
          onSortChange={(sort) => setUrl({ sort, page: 1 })}
          status={status}
          error={error}
          onRetry={retry}
          skeletonRows={10}
          emptyState={
            <EmptyState
              title="No products match"
              message="Try another search, category or stock level."
              action={
                <Button size="sm" onClick={() => setUrl({ q: '', category: 'all', stock: 'all', page: 1 })}>
                  Clear filters
                </Button>
              }
            />
          }
        />
      </TableCard>
    </>
  )
}
