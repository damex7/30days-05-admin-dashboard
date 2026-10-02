import { rng } from './random.js'
import { products, CATEGORIES } from './products.js'
import { customers } from './customers.js'
import { TODAY, addDays, daysBetween } from '../lib/dates.js'

export const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']

export const PAYMENT_METHODS = [
  { value: 'transfer', label: 'Bank transfer' },
  { value: 'card', label: 'Card' },
  { value: 'cod', label: 'Cash on delivery' },
]

// Two years of history, so even the 12-month view has a previous period.
const FIRST_DAY = '2024-10-01'

// Busy at Black Friday and Christmas, quiet in January.
const SEASON = [0.82, 0.9, 0.97, 1, 0.98, 0.95, 0.94, 0.97, 1.02, 1.06, 1.32, 1.55]

const CATEGORY_WEIGHTS = { Fashion: 32, Beauty: 26, Electronics: 22, Home: 20 }
const byCategory = Object.fromEntries(CATEGORIES.map((c) => [c, products.filter((p) => p.category === c)]))

const pad = (n) => String(n).padStart(2, '0')

function dailyOrderCount(day, progress) {
  const month = Number(day.slice(5, 7)) - 1
  const weekday = new Date(`${day}T12:00:00Z`).getUTCDay()
  const weekend = weekday === 0 || weekday === 6 ? 1.18 : 1
  const mean = (3.8 + 5.4 * progress) * SEASON[month] * weekend
  // Sum of three uniforms ≈ a bell curve: realistic day-to-day noise
  const noise = (rng.next() + rng.next() + rng.next() - 1.5) * Math.sqrt(mean) * 1.3
  return Math.max(0, Math.round(mean + noise))
}

function pickItems() {
  const lineCount = rng.weighted([
    [1, 60],
    [2, 30],
    [3, 10],
  ])
  const chosen = new Map()
  for (let i = 0; i < lineCount; i++) {
    const category = rng.weighted(Object.entries(CATEGORY_WEIGHTS))
    const product = rng.pick(byCategory[category])
    const qty =
      product.price > 100_000
        ? 1
        : rng.weighted([
            [1, 70],
            [2, 22],
            [3, 8],
          ])
    const existing = chosen.get(product.id)
    if (existing) existing.qty += qty
    else chosen.set(product.id, { productId: product.id, name: product.name, category, qty, unitPrice: product.price })
  }
  return [...chosen.values()]
}

function statusFor(age, paymentMethod) {
  if (rng.chance(paymentMethod === 'cod' ? 0.1 : 0.05)) return 'cancelled'
  if (age <= 1) return paymentMethod === 'cod' || rng.chance(0.5) ? 'pending' : 'paid'
  if (age <= 4) return paymentMethod !== 'cod' && rng.chance(0.3) ? 'paid' : 'shipped'
  if (age <= 7) return rng.chance(0.4) ? 'shipped' : 'delivered'
  return 'delivered'
}

function generateOrders() {
  const totalDays = daysBetween(FIRST_DAY, TODAY)
  const orders = []
  let eligible = 0 // customers are sorted by joinedAt, so this only moves forward

  for (let offset = 0; offset <= totalDays; offset++) {
    const day = addDays(FIRST_DAY, offset)
    while (eligible < customers.length && customers[eligible].joinedAt <= day) eligible++
    if (eligible === 0) continue

    const pool = customers.slice(0, eligible).map((c) => [c, c.loyalty])
    const count = dailyOrderCount(day, offset / totalDays)
    const age = totalDays - offset
    const dayOrders = []

    for (let i = 0; i < count; i++) {
      const customer = rng.weighted(pool)
      const items = pickItems()
      const subtotal = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0)
      const shipping = subtotal >= 150_000 ? 0 : customer.city === 'Lagos' ? 2_500 : 4_500
      const paymentMethod = rng.weighted([
        ['transfer', 42],
        ['card', 38],
        ['cod', 20],
      ])
      const hour = rng.weighted([
        [rng.int(7, 11), 25],
        [rng.int(12, 17), 40],
        [rng.int(18, 23), 35],
      ])
      dayOrders.push({
        customerId: customer.id,
        createdAt: `${day}T${pad(hour)}:${pad(rng.int(0, 59))}:00+01:00`,
        status: statusFor(age, paymentMethod),
        paymentMethod,
        items,
        subtotal,
        shipping,
        total: subtotal + shipping,
        city: customer.city,
      })
    }

    dayOrders.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    orders.push(...dayOrders)
  }

  return orders.map((order, index) => ({ id: `KS-${10001 + index}`, ...order }))
}

export const orders = generateOrders()
