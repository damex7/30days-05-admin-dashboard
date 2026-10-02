import { useId } from 'react'
import Card from '../ui/Card.jsx'
import DataTable from '../ui/DataTable.jsx'
import ErrorState from '../ui/ErrorState.jsx'
import Skeleton from '../ui/Skeleton.jsx'

/*
  The accessible wrapper every chart sits in:
  - the heading names the chart (aria-labelledby),
  - the SVG itself is hidden from screen readers (it's just shapes to them),
  - a plain-text summary says what the chart shows,
  - "View as table" exposes the exact numbers, reusing DataTable.
  It also handles the loading and error states for the chart.
*/
export default function ChartFigure({
  title,
  description,
  summary,
  legend,
  table,
  status = 'success',
  error,
  onRetry,
  height = 280,
  actions,
  className,
  children,
}) {
  const titleId = useId()
  const summaryId = useId()

  return (
    <Card
      as="figure"
      title={title}
      titleAs="h2"
      titleId={titleId}
      description={description}
      actions={actions}
      aria-describedby={status === 'success' ? summaryId : undefined}
      className={className}
    >
      {status === 'error' ? (
        <ErrorState compact error={error} onRetry={onRetry} />
      ) : status === 'loading' ? (
        <div aria-busy="true">
          <span className="sr-only">Loading chart</span>
          <Skeleton variant="rect" height={height} />
          <Skeleton width="80%" className="mt-4" />
        </div>
      ) : (
        <>
          {legend}
          <div aria-hidden="true" style={{ height }} className="w-full">
            {children}
          </div>
          <p id={summaryId} className="mt-4 text-sm leading-relaxed text-ink-soft">
            {summary}
          </p>
          {table && (
            <details className="group mt-3">
              <summary className="cursor-pointer text-sm font-medium text-primary select-none hover:underline">
                View as table
              </summary>
              <div className="mt-3 overflow-hidden rounded-lg border border-line">
                <DataTable caption={`${title}: data`} columns={table.columns} rows={table.rows} rowKey={table.rowKey ?? 'key'} dense />
              </div>
            </details>
          )}
        </>
      )}
    </Card>
  )
}

/** A legend row of swatches. Text stays in ink colours; only the swatch is coloured. */
export function ChartLegend({ items }) {
  return (
    <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block h-0.5 w-4"
            style={{
              background: item.dashed ? 'none' : item.color,
              borderTop: item.dashed ? `2px dashed ${item.color}` : undefined,
            }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  )
}
