import { useId, useMemo, useState } from 'react'
import { cx } from '../../lib/cx.js'
import EmptyState from './EmptyState.jsx'
import ErrorState from './ErrorState.jsx'
import { ArrowDownIcon, ArrowUpIcon, SortIcon } from './Icons.jsx'
import Skeleton from './Skeleton.jsx'

/*
  One table for every list in the app, driven by a columns config:

  {
    key: 'total',                  // unique id, also the sort field name
    header: 'Total',               // column heading
    accessor: (row) => row.total,  // raw value: used for sorting and CSV export
    cell: (row) => formatNaira(row.total), // how it looks (defaults to the raw value)
    sortable: true,
    align: 'right',                // 'left' | 'right' | 'center'
    hideBelow: 'md',               // hide on small screens: 'sm' | 'md' | 'lg'
    firstSort: 'desc',             // direction of the first click (numbers default to desc)
  }

  Sorting has two modes:
  - controlled: pass `sort` ("total:desc") + `onSortChange`; the parent (the API)
    sorts. Needed with pagination, because only the server sees every page.
  - uncontrolled: leave them out and the table sorts its own rows by accessor.

  The table also owns the loading (skeleton), error (retry) and empty states,
  so every page gets all three without writing them again.
*/

const ALIGN = { left: 'text-left', right: 'text-right', center: 'text-center' }
const JUSTIFY = { left: 'justify-start', right: 'justify-end', center: 'justify-center' }
const HIDE = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell' }

export function parseSort(sort) {
  if (!sort) return { key: null, dir: null }
  const [key, dir = 'asc'] = sort.split(':')
  return { key, dir }
}

const valueOf = (column, row) => (column.accessor ? column.accessor(row) : row[column.key])

function compare(a, b) {
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'string') return a.localeCompare(b)
  return a - b
}

export default function DataTable({
  columns,
  rows = [],
  rowKey = 'id',
  caption,
  showCaption = false,
  sort,
  defaultSort = null,
  onSortChange,
  onRowClick,
  rowLabel,
  status = 'success',
  error,
  onRetry,
  emptyState,
  skeletonRows = 8,
  stickyFirstColumn = true,
  dense = false,
  className,
}) {
  const captionId = useId()
  const controlled = typeof onSortChange === 'function'
  const [localSort, setLocalSort] = useState(defaultSort)
  const activeSort = controlled ? (sort ?? defaultSort) : localSort
  const { key: sortKey, dir: sortDir } = parseSort(activeSort)

  const displayRows = useMemo(() => {
    if (controlled || !sortKey) return rows
    const column = columns.find((c) => c.key === sortKey)
    if (!column) return rows
    const factor = sortDir === 'desc' ? -1 : 1
    return [...rows].sort((a, b) => compare(valueOf(column, a), valueOf(column, b)) * factor)
  }, [controlled, rows, columns, sortKey, sortDir])

  // Click cycle: first direction → opposite → back to the default order
  const handleSort = (column) => {
    const first = column.firstSort ?? (column.align === 'right' ? 'desc' : 'asc')
    const opposite = first === 'asc' ? 'desc' : 'asc'
    let next
    if (sortKey !== column.key) next = `${column.key}:${first}`
    else if (sortDir === first) next = `${column.key}:${opposite}`
    else next = defaultSort
    if (controlled) onSortChange(next)
    else setLocalSort(next)
  }

  const getKey = (row) => (typeof rowKey === 'function' ? rowKey(row) : row[rowKey])
  const loading = status === 'loading'
  const showSkeleton = loading && rows.length === 0
  const padX = 'px-4 first:pl-5 last:pr-5'
  const padY = dense ? 'py-2' : 'py-3'
  const sticky = (index, extra) =>
    stickyFirstColumn && index === 0 && cx('sticky left-0 z-[1] max-md:shadow-[1px_0_0_var(--color-line)]', extra)

  let body
  if (status === 'error') {
    body = (
      <tr>
        <td colSpan={columns.length}>
          <ErrorState compact title={caption ? `Couldn't load ${caption.toLowerCase()}` : undefined} error={error} onRetry={onRetry} />
        </td>
      </tr>
    )
  } else if (showSkeleton) {
    body = Array.from({ length: skeletonRows }, (_, r) => (
      <tr key={r}>
        {columns.map((column, c) => (
          <td key={column.key} className={cx(padX, padY, column.hideBelow && HIDE[column.hideBelow])}>
            <Skeleton
              width={`${45 + ((r * 37 + c * 17) % 40)}%`}
              className={column.align === 'right' ? 'ml-auto' : undefined}
            />
          </td>
        ))}
      </tr>
    ))
  } else if (displayRows.length === 0) {
    body = (
      <tr>
        <td colSpan={columns.length}>{emptyState ?? <EmptyState compact title="No results" />}</td>
      </tr>
    )
  } else {
    body = displayRows.map((row) => (
      <tr
        key={getKey(row)}
        onClick={onRowClick ? () => onRowClick(row) : undefined}
        className={cx('group transition-colors', onRowClick && 'cursor-pointer hover:bg-panel-2')}
      >
        {columns.map((column, index) => {
          const content = column.cell ? column.cell(row) : valueOf(column, row)
          const isPrimary = onRowClick && (column.primary ?? index === 0)
          return (
            <td
              key={column.key}
              className={cx(
                padX,
                padY,
                'whitespace-nowrap',
                ALIGN[column.align ?? 'left'],
                column.hideBelow && HIDE[column.hideBelow],
                column.align === 'right' && 'tabular',
                sticky(index, onRowClick ? 'bg-panel group-hover:bg-panel-2' : 'bg-panel'),
                column.className,
              )}
            >
              {isPrimary ? (
                // A real button so keyboard and screen reader users can open the row too
                <button
                  type="button"
                  aria-label={rowLabel ? rowLabel(row) : undefined}
                  onClick={(event) => {
                    event.stopPropagation()
                    onRowClick(row)
                  }}
                  className="font-medium text-ink underline-offset-4 hover:underline"
                >
                  {content}
                </button>
              ) : (
                content
              )}
            </td>
          )
        })}
      </tr>
    ))
  }

  return (
    <div className={cx('min-w-0', className)}>
      {/* The table scrolls inside this box on narrow screens, not the whole page */}
      <div role="region" aria-labelledby={captionId} tabIndex={0} className="overflow-x-auto rounded-[inherit]">
        <table className="min-w-full border-collapse text-sm" aria-busy={loading || undefined}>
          <caption id={captionId} className={showCaption ? 'px-5 py-3 text-left font-semibold' : 'sr-only'}>
            {caption}
          </caption>
          <thead>
            <tr className="border-b border-line bg-panel-2">
              {columns.map((column, index) => {
                const sorted = sortKey === column.key
                const align = column.align ?? 'left'
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={sorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                    className={cx(
                      padX,
                      'py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap text-ink-soft uppercase',
                      ALIGN[align],
                      column.hideBelow && HIDE[column.hideBelow],
                      sticky(index, 'bg-panel-2'),
                      column.headerClassName,
                    )}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(column)}
                        className={cx(
                          'inline-flex items-center gap-1 uppercase hover:text-ink',
                          JUSTIFY[align],
                          sorted && 'text-ink',
                        )}
                      >
                        {column.header}
                        {sorted ? (
                          sortDir === 'asc' ? (
                            <ArrowUpIcon size={13} />
                          ) : (
                            <ArrowDownIcon size={13} />
                          )
                        ) : (
                          <SortIcon size={13} className="opacity-50" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className={cx('divide-y divide-line transition-opacity', loading && rows.length > 0 && 'opacity-55')}>
            {body}
          </tbody>
        </table>
      </div>
    </div>
  )
}
