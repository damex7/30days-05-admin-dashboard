# Kasuwa Admin Dashboard

Day 5 of my 30-day development challenge. **Kasuwa** (Hausa for "market") is a fictional Nigerian online store, and this is its admin dashboard: sales at a glance, plus searchable tables of orders, customers and products.

Today's focus: **reusable components** and **data visualisation**. Every screen is built from a small component library in `src/components/ui/`, and one generic `DataTable` powers all three tables.

## What it does

- **Overview:** four KPI cards (revenue, orders, average order value, new customers), each with the change vs the previous period and a sparkline. Also a revenue chart with a previous-period comparison, orders by category, a payment-method breakdown (card, bank transfer, cash on delivery), top products and recent orders.
- **Date range:** 7 days, 30 days, 90 days or 12 months. It updates every number and chart.
- **Orders:** search, status filter, sorting, pagination, an order-details drawer, and **CSV export** of the current filtered view.
- **Customers:** total spent and order count per customer, and a details drawer with their order history.
- **Products:** prices, stock levels with **low / out of stock** badges, and units sold in the last 30 days.
- **UI kit** (`/ui`): every reusable component in its variants and sizes, like a mini Storybook.

Range, filters, search, sort, page and the open drawer are all kept **in the URL**. You can share a link to an exact view, and it survives a refresh.

Every data view has a **loading skeleton**, an **error state with Retry** and an **empty state**. The app has light and dark mode (it remembers your choice), works down to 360 px wide and can be used with the keyboard alone.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build
```

### Try the error states

The API is simulated in the browser. Add `fail` to the address bar to make requests fail:

| URL | Effect |
|---|---|
| `/orders?fail=1` | Every request fails, so you see the error state |
| `/orders?fail=0.5` | About half fail, so you can watch **Try again** recover |

Search for something like `zzz` to see an empty state.

## Stack

- **Vite + React 19** (JavaScript)
- **Tailwind CSS v4** via `@tailwindcss/vite`, with design tokens in an `@theme` block
- **react-router-dom** for pages and URL state
- **Recharts** for the revenue, category and payment charts

There are no UI kits, table libraries or date libraries. Formatting uses the built-in `Intl` APIs, and the KPI sparklines are drawn by hand in SVG.

## Where each concept lives

| Concept | File |
|---|---|
| Design tokens (colours, fonts) and dark mode | [src/index.css](src/index.css) |
| No-flash theme script | [index.html](index.html) |
| Theme toggle that remembers the choice | [src/hooks/useTheme.js](src/hooks/useTheme.js), [src/components/layout/ThemeToggle.jsx](src/components/layout/ThemeToggle.jsx) |
| Seeded random generator (same data every load) | [src/data/random.js](src/data/random.js) |
| Sample data: products, customers, orders | [src/data/](src/data/) |
| Mock API: async, delay, filter/sort/paginate, `?fail` | [src/lib/api.js](src/lib/api.js) |
| Date ranges and previous-period maths | [src/lib/dates.js](src/lib/dates.js) |
| Naira, number and date formatting with `Intl` | [src/lib/format.js](src/lib/format.js) |
| CSV export (no library) | [src/lib/csv.js](src/lib/csv.js), `exportCSV` in [src/pages/Orders.jsx](src/pages/Orders.jsx) |
| Loading / error / retry for async data | [src/hooks/useAsync.js](src/hooks/useAsync.js) |
| Page state in the URL | [src/hooks/useUrlState.js](src/hooks/useUrlState.js) |
| Generic table driven by a columns config | [src/components/ui/DataTable.jsx](src/components/ui/DataTable.jsx) |
| The same table with three different configs | [Orders.jsx](src/pages/Orders.jsx), [Customers.jsx](src/pages/Customers.jsx), [Products.jsx](src/pages/Products.jsx) |
| Variants and sizes as props | [src/components/ui/Button.jsx](src/components/ui/Button.jsx), [Badge.jsx](src/components/ui/Badge.jsx) |
| Drawer and Modal on the native `<dialog>` | [src/components/ui/useDialog.js](src/components/ui/useDialog.js), [Drawer.jsx](src/components/ui/Drawer.jsx), [Modal.jsx](src/components/ui/Modal.jsx) |
| Keyboard patterns (radio group, tabs) | [SegmentedControl.jsx](src/components/ui/SegmentedControl.jsx), [Tabs.jsx](src/components/ui/Tabs.jsx) |
| Debounced search | [src/components/ui/SearchInput.jsx](src/components/ui/SearchInput.jsx) |
| Sparkline drawn by hand in SVG | [src/components/ui/Sparkline.jsx](src/components/ui/Sparkline.jsx) |
| KPI card with change vs previous period | [src/components/ui/StatCard.jsx](src/components/ui/StatCard.jsx) |
| Recharts charts | [src/components/charts/](src/components/charts/) |
| Accessible chart wrapper (title, text summary, table view) | [src/components/charts/ChartFigure.jsx](src/components/charts/ChartFigure.jsx) |
| Responsive sidebar that becomes a drawer on phones | [src/components/layout/AppShell.jsx](src/components/layout/AppShell.jsx), [SidebarNav.jsx](src/components/layout/SidebarNav.jsx) |
| Code splitting with `React.lazy` | [src/App.jsx](src/App.jsx) |
| Component showcase | [src/pages/UiKit.jsx](src/pages/UiKit.jsx) |
| Refresh on any route works on Vercel | [vercel.json](vercel.json) |

## Decisions worth knowing

**One table, three configs.** `DataTable` knows nothing about orders or products. Each page passes a `columns` array:

```js
{ key: 'total', header: 'Total', accessor: (r) => r.total, cell: (r) => formatNaira(r.total), sortable: true, align: 'right' }
```

`accessor` is the raw value (used for sorting and the CSV export); `cell` is how it looks. With `sort` and `onSortChange` the table is *controlled* and the API sorts across every page. Without them it sorts its own rows (used in the customer drawer and the UI kit).

**The data is fake but stable.** A seeded generator (mulberry32) always produces the same 44 products, 520 customers and about 5,200 orders. "Today" is fixed at **30 September 2026**, so the numbers don't drift as real days pass; the top bar shows "Data as of 30 Sept 2026". There are two years of orders, so even the 12-month view has a previous 12 months to compare against.

**The API behaves like a server.** Pages never touch the data arrays directly. `api.js` waits 300–700 ms, filters, sorts and paginates, and returns copies. Swapping it for a real backend means changing the inside of those functions, not the pages.

**Charts are readable without the chart.** Each chart has a heading, a generated plain-language summary (e.g. "₦30.5M in revenue over the last 30 days (−2.4% vs the previous 30 days)…") and a "View as table" option. The SVG is hidden from screen readers, which read the summary instead.

**Chart colours were tested, not picked by eye.** The green, ochre and blue were checked for colour-blind separation and at least 3:1 contrast against the panel, in both themes. Terracotta was dropped because it collapses into green for red-green colour blindness.

**Dialogs use the platform.** `Drawer` and `Modal` are built on `<dialog>` with `showModal()`, which gives focus trapping, Escape to close and an inert background without a library. Closing a drawer replaces the history entry, so the Back button doesn't reopen it.

## Deploying to Vercel

Import the repo in Vercel. It detects Vite, and `vercel.json` sends every path to `index.html`, so refreshing `/orders?status=paid` works.

## Ideas for later

These are out of scope for today:
- Authentication and roles (admin vs support staff).
- A real backend and database, with caching (e.g. TanStack Query).
- Editing data: updating an order's status, restocking products.
- Custom date ranges with a date picker.
- Comparing any two periods.
- Virtualised rows for very large tables.
- Saved views (named filter presets).
- Tests: Vitest + Testing Library for the hooks and DataTable, Playwright for flows.
- TypeScript types for the data shapes and the columns config.

---

Kasuwa is a fictional store. All names, emails and phone numbers are generated sample data (emails use the reserved `example.com` domain).
