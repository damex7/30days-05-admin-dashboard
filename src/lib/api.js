/*
  The app's only door to the data. It behaves like a small REST API:
  every function is async, waits 300–700ms, filters/sorts/paginates on the
  "server", and returns fresh objects (never the generator's arrays).

  Simulate failures from the address bar:
    ?fail=1    every request fails (test error states)
    ?fail=0.5  about half fail (test that Retry recovers)
*/
import { products, CATEGORIES } from '../data/products.js'
import { customers } from '../data/customers.js'
import { orders, ORDER_STATUSES, PAYMENT_METHODS } from '../data/orders.js'
import { dayKeyOf, getRangeBounds, inWindow, TODAY } from './dates.js'

export { CATEGORIES, ORDER_STATUSES, PAYMENT_METHODS }

export const PAGE_SIZE = 10

/* ---------- fake network ---------- */

export class ApiError extends Error {
  constructor(message, status = 500) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(work) {
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 400))
  const failRate = Number(new URLSearchParams(window.location.search).get('fail'))
  if (failRate > 0 && Math.random() < failRate) {
    throw new ApiError('The server did not respond. This failure was simulated with ?fail in the URL.', 503)
  }
  // structuredClone: callers get a copy, so they can never mutate the "database"
  return structuredClone(work())
}

/* ---------- indexes, built once ---------- */

const productById = new Map(products.map((p) => [p.id, p]))
const customerById = new Map(customers.map((c) => [c.id, c]))
const orderById = new Map(orders.map((o) => [o.id, o]))

const counts = (order) => order.status !== 'cancelled' // cancelled orders earn nothing

// Per-customer totals are derived from orders, so they can never disagree.
const customerStats = new Map(customers.map((c) => [c.id, { orderCount: 0, totalSpent: 0, lastOrderAt: null }]))
for (const order of orders) {
  const stats = customerStats.get(order.customerId)
  stats.orderCount += 1
  if (counts(order)) stats.totalSpent += order.total
  stats.lastOrderAt = order.createdAt // orders are in date order, so the last one wins
}

/* ---------- shared helpers ---------- */

const matches = (query, ...fields) => {
  const q = query.trim().toLowerCase()
  return !q || fields.some((field) => String(field).toLowerCase().includes(q))
}

/** sort is "field:asc" or "field:desc"; getters maps field → value. */
function sortRows(rows, sort, getters) {
  const [field, dir] = sort.split(':')
  const get = getters[field]
  if (!get) return rows
  const factor = dir === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    const x = get(a)
    const y = get(b)
    if (typeof x === 'string') return x.localeCompare(y) * factor
    return (x - y) * factor
  })
}

function paginate(rows, page, pageSize = PAGE_SIZE) {
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const current = Math.min(Math.max(1, page), pageCount)
  return {
    rows: rows.slice((current - 1) * pageSize, current * pageSize),
    total: rows.length,
    page: current,
    pageSize,
    pageCount,
  }
}

const sumRevenue = (list) => list.reduce((sum, o) => (counts(o) ? sum + o.total : sum), 0)
const change = (value, previous) => (previous ? (value - previous) / previous : null)

const ordersBetween = (start, end) => orders.filter((o) => inWindow(dayKeyOf(o.createdAt), start, end))

/* ---------- overview ---------- */

export function getOverview({ range } = {}) {
  return request(() => {
    const bounds = getRangeBounds(range)
    const { start, end, prevStart, prevEnd, unit, buckets, prevBuckets } = bounds
    const current = ordersBetween(start, end)
    const previous = ordersBetween(prevStart, prevEnd)
    const bucketOf = (iso) => (unit === 'month' ? iso.slice(0, 7) : dayKeyOf(iso))

    // Per-bucket totals for the current and previous windows
    const tally = (list, keys) => {
      const map = new Map(keys.map((k) => [k, { revenue: 0, orders: 0, paid: 0, newCustomers: 0 }]))
      for (const o of list) {
        const b = map.get(bucketOf(o.createdAt))
        if (!b) continue
        b.orders += 1
        if (counts(o)) {
          b.revenue += o.total
          b.paid += 1
        }
      }
      return map
    }
    const now = tally(current, buckets)
    const before = tally(previous, prevBuckets)
    for (const c of customers) {
      const bucket = now.get(unit === 'month' ? c.joinedAt.slice(0, 7) : c.joinedAt)
      if (bucket && inWindow(c.joinedAt, start, end)) bucket.newCustomers += 1
    }

    const nowList = [...now.values()]
    const revenue = sumRevenue(current)
    const prevRevenue = sumRevenue(previous)
    const paid = current.filter(counts).length
    const prevPaid = previous.filter(counts).length
    const aov = paid ? revenue / paid : 0
    const prevAov = prevPaid ? prevRevenue / prevPaid : 0
    const newCustomers = customers.filter((c) => inWindow(c.joinedAt, start, end)).length
    const prevNewCustomers = customers.filter((c) => inWindow(c.joinedAt, prevStart, prevEnd)).length

    const kpis = [
      {
        key: 'revenue',
        label: 'Revenue',
        format: 'naira',
        value: revenue,
        previous: prevRevenue,
        change: change(revenue, prevRevenue),
        series: nowList.map((b) => b.revenue),
      },
      {
        key: 'orders',
        label: 'Orders',
        format: 'number',
        value: current.length,
        previous: previous.length,
        change: change(current.length, previous.length),
        series: nowList.map((b) => b.orders),
      },
      {
        key: 'aov',
        label: 'Average order value',
        format: 'naira',
        value: aov,
        previous: prevAov,
        change: change(aov, prevAov),
        series: nowList.map((b) => (b.paid ? b.revenue / b.paid : 0)),
      },
      {
        key: 'newCustomers',
        label: 'New customers',
        format: 'number',
        value: newCustomers,
        previous: prevNewCustomers,
        change: change(newCustomers, prevNewCustomers),
        series: nowList.map((b) => b.newCustomers),
      },
    ]

    // Revenue over time, with the previous window lined up bucket by bucket
    const beforeList = [...before.values()]
    const revenueSeries = buckets.map((key, i) => ({
      key,
      previousKey: prevBuckets[i],
      revenue: now.get(key).revenue,
      previous: beforeList[i]?.revenue ?? 0,
    }))

    // Orders that include at least one item from each category
    const byCategory = CATEGORIES.map((category) => {
      const inCategory = current.filter((o) => o.items.some((item) => item.category === category))
      const categoryRevenue = current
        .filter(counts)
        .flatMap((o) => o.items)
        .filter((item) => item.category === category)
        .reduce((sum, item) => sum + item.qty * item.unitPrice, 0)
      return { category, orders: inCategory.length, revenue: categoryRevenue }
    }).sort((a, b) => b.orders - a.orders)

    const byPayment = PAYMENT_METHODS.map(({ value, label }) => {
      const list = current.filter((o) => o.paymentMethod === value)
      return {
        method: value,
        label,
        orders: list.length,
        revenue: sumRevenue(list),
        share: current.length ? list.length / current.length : 0,
      }
    })

    const productTotals = new Map()
    for (const o of current.filter(counts)) {
      for (const item of o.items) {
        const entry = productTotals.get(item.productId) ?? { units: 0, revenue: 0 }
        entry.units += item.qty
        entry.revenue += item.qty * item.unitPrice
        productTotals.set(item.productId, entry)
      }
    }
    const topProducts = [...productTotals.entries()]
      .map(([id, totals]) => {
        const p = productById.get(id)
        return { id, name: p.name, category: p.category, ...totals }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    const recentOrders = current.slice(-6).reverse().map(toOrderRow)

    return {
      range: bounds.range.value,
      rangeLabel: bounds.range.label,
      start,
      end,
      unit,
      kpis,
      revenueSeries,
      byCategory,
      byPayment,
      topProducts,
      recentOrders,
    }
  })
}

/* ---------- orders ---------- */

function toOrderRow(o) {
  const customer = customerById.get(o.customerId)
  return {
    id: o.id,
    createdAt: o.createdAt,
    customerId: o.customerId,
    customerName: customer.name,
    city: o.city,
    status: o.status,
    paymentMethod: o.paymentMethod,
    itemCount: o.items.reduce((sum, item) => sum + item.qty, 0),
    total: o.total,
  }
}

const ORDER_SORTS = {
  id: (r) => r.id,
  customer: (r) => r.customerName,
  createdAt: (r) => r.createdAt,
  status: (r) => ORDER_STATUSES.indexOf(r.status),
  items: (r) => r.itemCount,
  total: (r) => r.total,
}

function filterOrders({ range, status = 'all', query = '', sort = 'createdAt:desc' }) {
  const { start, end } = getRangeBounds(range)
  const rows = ordersBetween(start, end)
    .filter((o) => status === 'all' || o.status === status)
    .map(toOrderRow)
    .filter((r) => matches(query, r.id, r.customerName, r.city))
  return sortRows(rows, sort, ORDER_SORTS)
}

export function getOrders({ page = 1, pageSize = PAGE_SIZE, ...filters } = {}) {
  return request(() => paginate(filterOrders(filters), page, pageSize))
}

/** Same filters as getOrders, every matching row (used for CSV export). */
export function getAllOrders(filters = {}) {
  return request(() => filterOrders(filters))
}

export function getOrder(id) {
  return request(() => {
    const order = orderById.get(id)
    if (!order) throw new ApiError(`Order ${id} was not found.`, 404)
    const customer = customerById.get(order.customerId)
    return {
      ...order,
      items: order.items.map((item) => ({ ...item, sku: productById.get(item.productId).sku })),
      customer: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, city: customer.city, state: customer.state },
    }
  })
}

/* ---------- customers ---------- */

const toCustomerRow = (c) => {
  const { loyalty, ...publicFields } = c // loyalty is only a generator detail
  return { ...publicFields, ...customerStats.get(c.id) }
}

const CUSTOMER_SORTS = {
  name: (r) => r.name,
  city: (r) => r.city,
  joinedAt: (r) => r.joinedAt,
  orderCount: (r) => r.orderCount,
  totalSpent: (r) => r.totalSpent,
  lastOrderAt: (r) => r.lastOrderAt ?? '',
}

export function getCustomers({ query = '', sort = 'totalSpent:desc', page = 1, pageSize = PAGE_SIZE } = {}) {
  return request(() => {
    const rows = customers.map(toCustomerRow).filter((r) => matches(query, r.name, r.email, r.city, r.id))
    return paginate(sortRows(rows, sort, CUSTOMER_SORTS), page, pageSize)
  })
}

export function getCustomer(id) {
  return request(() => {
    const customer = customerById.get(id)
    if (!customer) throw new ApiError(`Customer ${id} was not found.`, 404)
    const history = orders.filter((o) => o.customerId === id).reverse()
    const paidOrders = history.filter(counts)
    return {
      ...toCustomerRow(customer),
      averageOrder: paidOrders.length ? sumRevenue(paidOrders) / paidOrders.length : 0,
      orders: history.map(toOrderRow),
    }
  })
}

/* ---------- products ---------- */

export const stockStatus = (p) => (p.stock === 0 ? 'out' : p.stock <= p.reorderLevel ? 'low' : 'ok')

// Units sold in the last 30 days, for the products table
const { start: last30Start } = getRangeBounds('30d')
const unitsSold30d = new Map()
for (const o of ordersBetween(last30Start, TODAY).filter(counts)) {
  for (const item of o.items) unitsSold30d.set(item.productId, (unitsSold30d.get(item.productId) ?? 0) + item.qty)
}

const PRODUCT_SORTS = {
  name: (r) => r.name,
  sku: (r) => r.sku,
  category: (r) => r.category,
  price: (r) => r.price,
  stock: (r) => r.stock,
  sold30d: (r) => r.sold30d,
}

export function getProducts({ query = '', category = 'all', stock = 'all', sort = 'name:asc', page = 1, pageSize = PAGE_SIZE } = {}) {
  return request(() => {
    const rows = products
      .map((p) => ({ ...p, stockStatus: stockStatus(p), sold30d: unitsSold30d.get(p.id) ?? 0 }))
      .filter((r) => category === 'all' || r.category === category)
      .filter((r) => stock === 'all' || r.stockStatus === stock)
      .filter((r) => matches(query, r.name, r.sku))
    return paginate(sortRows(rows, sort, PRODUCT_SORTS), page, pageSize)
  })
}
