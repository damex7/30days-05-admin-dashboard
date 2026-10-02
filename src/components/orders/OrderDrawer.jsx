import { Link } from 'react-router-dom'
import { Button, Drawer, ErrorState, Skeleton, StatusBadge } from '../ui'
import { useAsync } from '../../hooks/useAsync.js'
import { getOrder, PAYMENT_METHODS } from '../../lib/api.js'
import { formatDateTime, formatNaira, formatNumber } from '../../lib/format.js'

const paymentLabel = (value) => PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value

/** Order details in a side drawer. Open when orderId is set (it comes from ?order= in the URL). */
export default function OrderDrawer({ orderId, onClose }) {
  const { status, data, error, retry } = useAsync(
    () => (orderId ? getOrder(orderId) : Promise.resolve(null)),
    [orderId],
  )
  const order = data?.id === orderId ? data : null

  return (
    <Drawer
      open={Boolean(orderId)}
      onClose={onClose}
      title={`Order ${orderId ?? ''}`}
      description={order ? `Placed ${formatDateTime(order.createdAt)}` : ' '}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {status === 'error' ? (
        <ErrorState compact title="Couldn't load this order" error={error} onRetry={error?.status === 404 ? undefined : retry} />
      ) : !order ? (
        <div className="flex flex-col gap-6 p-5" aria-busy="true">
          <span className="sr-only">Loading order</span>
          <Skeleton lines={3} />
          <Skeleton variant="rect" height={120} />
          <Skeleton lines={4} />
        </div>
      ) : (
        <div className="flex flex-col gap-6 p-5 text-sm">
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-ink-soft">Status</dt>
              <dd className="mt-1">
                <StatusBadge status={order.status} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft">Payment</dt>
              <dd className="mt-1 font-medium">{paymentLabel(order.paymentMethod)}</dd>
            </div>
          </dl>

          <section aria-labelledby="order-customer">
            <h3 id="order-customer" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
              Customer
            </h3>
            <div className="mt-2 rounded-lg border border-line p-3">
              <Link
                to={`/customers?customer=${order.customer.id}`}
                className="font-medium text-ink underline-offset-4 hover:underline"
              >
                {order.customer.name}
              </Link>
              <p className="mt-1 text-ink-soft">{order.customer.email}</p>
              <p className="text-ink-soft">{order.customer.phone}</p>
              <p className="mt-1 text-ink-soft">
                Deliver to {order.customer.city}, {order.customer.state}
              </p>
            </div>
          </section>

          <section aria-labelledby="order-items">
            <h3 id="order-items" className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
              Items ({formatNumber(order.items.reduce((sum, item) => sum + item.qty, 0))})
            </h3>
            <ul className="mt-2 divide-y divide-line rounded-lg border border-line">
              {order.items.map((item) => (
                <li key={item.productId} className="flex items-start justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{item.name}</p>
                    <p className="text-xs text-ink-soft">
                      <span className="font-mono">{item.sku}</span> · {item.qty} × {formatNaira(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-medium tabular">{formatNaira(item.qty * item.unitPrice)}</p>
                </li>
              ))}
            </ul>
          </section>

          <dl className="flex flex-col gap-2 border-t border-line pt-4 tabular">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Subtotal</dt>
              <dd>{formatNaira(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Delivery</dt>
              <dd>{order.shipping ? formatNaira(order.shipping) : 'Free'}</dd>
            </div>
            <div className="flex justify-between font-display text-lg font-semibold">
              <dt>Total</dt>
              <dd>{formatNaira(order.total)}</dd>
            </div>
          </dl>
        </div>
      )}
    </Drawer>
  )
}
