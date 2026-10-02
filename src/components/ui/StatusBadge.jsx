import Badge from './Badge.jsx'

// The one place that decides how each order status and stock level looks.
export const ORDER_STATUS_META = {
  pending: { label: 'Pending', tone: 'warning' },
  paid: { label: 'Paid', tone: 'info' },
  shipped: { label: 'Shipped', tone: 'accent' },
  delivered: { label: 'Delivered', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
}

export const STOCK_META = {
  ok: { label: 'In stock', tone: 'success' },
  low: { label: 'Low stock', tone: 'warning' },
  out: { label: 'Out of stock', tone: 'danger' },
}

export default function StatusBadge({ status, size }) {
  const meta = ORDER_STATUS_META[status] ?? { label: status, tone: 'neutral' }
  return (
    <Badge tone={meta.tone} size={size} dot>
      {meta.label}
    </Badge>
  )
}

export function StockBadge({ status, size }) {
  const meta = STOCK_META[status] ?? { label: status, tone: 'neutral' }
  return (
    <Badge tone={meta.tone} size={size} dot>
      {meta.label}
    </Badge>
  )
}
