import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader.jsx'
import {
  Badge,
  Button,
  Card,
  DataTable,
  DownloadIcon,
  Drawer,
  EmptyState,
  ErrorState,
  Modal,
  Pagination,
  PlusIcon,
  SearchInput,
  SegmentedControl,
  Select,
  Skeleton,
  Sparkline,
  StatCard,
  StatusBadge,
  StockBadge,
  Tabs,
} from '../components/ui'
import { formatNaira, formatNumber } from '../lib/format.js'

/*
  A mini Storybook: every reusable component in its variants, built from
  the real components (so this page can never drift out of date).
*/

const SECTIONS = [
  ['tokens', 'Colour tokens'],
  ['type', 'Typography'],
  ['buttons', 'Button'],
  ['badges', 'Badge'],
  ['inputs', 'Inputs'],
  ['tabs', 'Tabs'],
  ['cards', 'Card & StatCard'],
  ['feedback', 'Skeleton, Empty, Error'],
  ['table', 'DataTable'],
  ['overlays', 'Drawer & Modal'],
]

const TOKENS = [
  ['paper', 'bg-paper'],
  ['panel', 'bg-panel'],
  ['panel-2', 'bg-panel-2'],
  ['ink', 'bg-ink'],
  ['ink-soft', 'bg-ink-soft'],
  ['line', 'bg-line'],
  ['primary', 'bg-primary'],
  ['accent', 'bg-accent'],
  ['sidebar', 'bg-sidebar'],
  ['success', 'bg-success'],
  ['warning', 'bg-warning'],
  ['danger', 'bg-danger'],
  ['info', 'bg-info'],
  ['chart-1', 'bg-[var(--color-chart-1)]'],
  ['chart-2', 'bg-[var(--color-chart-2)]'],
  ['chart-3', 'bg-[var(--color-chart-3)]'],
  ['chart-muted', 'bg-[var(--color-chart-muted)]'],
]

const DEMO_ROWS = [
  { id: 'P-101', name: 'Ankara Print Midi Dress', category: 'Fashion', price: 34_500, stock: 42 },
  { id: 'P-102', name: 'Wireless Earbuds Pro', category: 'Electronics', price: 29_900, stock: 0 },
  { id: 'P-103', name: 'Shea Butter Body Cream', category: 'Beauty', price: 7_800, stock: 6 },
  { id: 'P-104', name: 'Rice Cooker 1.8L', category: 'Home', price: 41_000, stock: 88 },
  { id: 'P-105', name: 'Senator Kaftan', category: 'Fashion', price: 46_000, stock: 15 },
]
const stockOf = (r) => (r.stock === 0 ? 'out' : r.stock <= 10 ? 'low' : 'ok')

// Uncontrolled DataTable: no sort/onSortChange props, so it sorts these rows itself
const DEMO_COLUMNS = [
  { key: 'name', header: 'Product', sortable: true },
  { key: 'category', header: 'Category', sortable: true, hideBelow: 'sm' },
  { key: 'price', header: 'Price', accessor: (r) => r.price, cell: (r) => formatNaira(r.price), align: 'right', sortable: true },
  { key: 'stock', header: 'Stock', accessor: (r) => r.stock, cell: (r) => <StockBadge status={stockOf(r)} size="sm" />, sortable: true, firstSort: 'asc' },
]

function Section({ id, title, usage, children }) {
  return (
    <Card as="section" id={id} title={title} titleId={`${id}-title`} className="scroll-mt-24">
      {usage && (
        <pre className="mb-5 overflow-x-auto rounded-lg bg-panel-2 px-3 py-2 font-mono text-xs leading-relaxed text-ink-soft">
          {usage}
        </pre>
      )}
      {children}
    </Card>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex flex-col gap-2 border-t border-line py-4 first:border-t-0 first:pt-0 sm:flex-row sm:items-center">
      <p className="w-28 shrink-0 text-xs font-medium text-ink-soft">{label}</p>
      <div className="flex min-w-0 flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

export default function UiKit() {
  const [segment, setSegment] = useState('30d')
  const [select, setSelect] = useState('all')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('one')
  const [tableState, setTableState] = useState('success')
  const [page, setPage] = useState(3)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <PageHeader
        title="UI kit"
        description="Every reusable component in src/components/ui, in its variants and sizes."
      />

      <nav aria-label="UI kit sections" className="mb-6 flex flex-wrap gap-2">
        {SECTIONS.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="rounded-full border border-line bg-panel px-3 py-1 text-sm text-ink-soft hover:border-line-strong hover:text-ink"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-6">
        <Section id="tokens" title="Colour tokens" usage={'@theme { --color-primary: #0f4d3a; ... }  →  bg-primary, text-primary, border-primary'}>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {TOKENS.map(([name, className]) => (
              <li key={name} className="overflow-hidden rounded-lg border border-line">
                <div className={`h-12 ${className}`} />
                <p className="px-2 py-1.5 font-mono text-xs text-ink-soft">{name}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink-soft">
            Switch the theme to see the dark values. The three chart colours were checked for colour-blind separation and
            3:1 contrast against the panel in both themes.
          </p>
        </Section>

        <Section id="type" title="Typography" usage="font-display (Bricolage Grotesque) · font-sans (Instrument Sans) · font-mono (JetBrains Mono)">
          <div className="flex flex-col gap-3">
            <p className="font-display text-4xl font-semibold">₦30.5M revenue</p>
            <p className="font-display text-2xl font-semibold">Page heading</p>
            <p className="font-display text-base font-semibold">Card title</p>
            <p className="text-sm">Body text for descriptions, table cells and form labels.</p>
            <p className="text-sm text-ink-soft">Secondary text for supporting details.</p>
            <p className="font-mono text-xs">KS-15085 · ELE-007</p>
          </div>
        </Section>

        <Section id="buttons" title="Button" usage={'<Button variant="primary|secondary|ghost|danger" size="sm|md|lg" icon={…} iconOnly loading as={Link} />'}>
          <Row label="Variants">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </Row>
          <Row label="Sizes">
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="md">
              Medium
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
          </Row>
          <Row label="With icon">
            <Button icon={<DownloadIcon size={16} />}>Export CSV</Button>
            <Button variant="primary" icon={<PlusIcon size={16} />}>
              New product
            </Button>
            <Button iconOnly icon={<PlusIcon />} aria-label="Add" />
            <Button variant="ghost" iconOnly size="sm" icon={<PlusIcon size={16} />} aria-label="Add" />
          </Row>
          <Row label="States">
            <Button variant="primary" loading>
              Saving
            </Button>
            <Button disabled>Disabled</Button>
          </Row>
        </Section>

        <Section id="badges" title="Badge" usage={'<Badge tone="neutral|success|warning|danger|info|accent" size="sm|md" dot />   <StatusBadge status="paid" />'}>
          <Row label="Tones">
            {['neutral', 'success', 'warning', 'danger', 'info', 'accent'].map((tone) => (
              <Badge key={tone} tone={tone}>
                {tone}
              </Badge>
            ))}
          </Row>
          <Row label="Small, dot">
            {['neutral', 'success', 'warning', 'danger', 'info', 'accent'].map((tone) => (
              <Badge key={tone} tone={tone} size="sm" dot>
                {tone}
              </Badge>
            ))}
          </Row>
          <Row label="Order status">
            {['pending', 'paid', 'shipped', 'delivered', 'cancelled'].map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </Row>
          <Row label="Stock">
            {['ok', 'low', 'out'].map((s) => (
              <StockBadge key={s} status={s} />
            ))}
          </Row>
        </Section>

        <Section id="inputs" title="Inputs" usage={'<SearchInput value onChange delay={300} />  <Select label options value onChange />  <SegmentedControl label options value onChange />'}>
          <Row label="SearchInput">
            <SearchInput className="w-full sm:w-72" label="Demo search" value={search} onChange={setSearch} placeholder="Type, then pause…" />
            <span className="text-sm text-ink-soft">
              Debounced value: <span className="font-mono">{search || '—'}</span>
            </span>
          </Row>
          <Row label="Select">
            <Select
              label="Status"
              className="w-48"
              value={select}
              onChange={setSelect}
              options={[
                { value: 'all', label: 'All statuses' },
                { value: 'paid', label: 'Paid' },
                { value: 'shipped', label: 'Shipped' },
              ]}
            />
            <Select
              label="Small, hidden label"
              hideLabel
              size="sm"
              className="w-40"
              value={select}
              onChange={setSelect}
              options={[
                { value: 'all', label: 'All statuses' },
                { value: 'paid', label: 'Paid' },
                { value: 'shipped', label: 'Shipped' },
              ]}
            />
          </Row>
          <Row label="Segmented">
            <SegmentedControl
              label="Demo range"
              value={segment}
              onChange={setSegment}
              options={[
                { value: '7d', label: '7D' },
                { value: '30d', label: '30D' },
                { value: '90d', label: '90D' },
                { value: '12m', label: '12M' },
              ]}
            />
            <SegmentedControl
              label="Demo size"
              size="sm"
              value={segment}
              onChange={setSegment}
              options={[
                { value: '7d', label: 'Week' },
                { value: '30d', label: 'Month' },
                { value: '12m', label: 'Year' },
              ]}
            />
            <span className="text-xs text-ink-soft">Tab in, then use the arrow keys.</span>
          </Row>
          <Row label="Pagination">
            <Pagination className="w-full" page={page} pageCount={28} total={278} pageSize={10} onPageChange={setPage} />
          </Row>
        </Section>

        <Section id="tabs" title="Tabs" usage={'<Tabs label tabs={[{ value, label, content }]} value onChange />'}>
          <Tabs
            label="Demo tabs"
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'one', label: 'Orders', content: <p className="text-sm text-ink-soft">Arrow keys move between tabs.</p> },
              { value: 'two', label: 'Contact', content: <p className="text-sm text-ink-soft">Only the active panel is rendered.</p> },
              { value: 'three', label: 'Notes', content: <p className="text-sm text-ink-soft">Used in the customer drawer.</p> },
            ]}
          />
        </Section>

        <Section id="cards" title="Card & StatCard" usage={'<Card title description actions padding="none|sm|md" />   <StatCard label value format change trendData invertTrend loading />'}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Revenue (up)" value={30_531_900} format={formatNaira} change={0.124} trendData={[4, 6, 5, 8, 7, 9, 11, 10, 13]} />
            <StatCard label="Orders (down)" value={278} format={formatNumber} change={-0.045} trendData={[9, 8, 9, 7, 6, 7, 5, 6, 5]} />
            <StatCard label="Refunds (inverted)" value={12} format={formatNumber} change={-0.2} invertTrend comparisonLabel="lower is better" />
            <StatCard loading />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card title="Card with actions" description="Header, description and actions slot" actions={<Button size="sm">Action</Button>}>
              <p className="text-sm text-ink-soft">Body content goes here.</p>
            </Card>
            <Card padding="sm">
              <p className="text-sm text-ink-soft">A plain card with small padding and no header.</p>
              <Sparkline data={[3, 5, 4, 7, 6, 9, 8, 12]} className="mt-3" color="var(--color-chart-3)" />
            </Card>
          </div>
        </Section>

        <Section id="feedback" title="Skeleton, Empty, Error" usage={'<Skeleton variant="text|rect|circle" width height lines />  <EmptyState title message action />  <ErrorState error onRetry />'}>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-3 rounded-lg border border-line p-4">
              <div className="flex items-center gap-3">
                <Skeleton variant="circle" width={40} height={40} />
                <Skeleton width="50%" />
              </div>
              <Skeleton lines={3} />
              <Skeleton variant="rect" height={64} />
            </div>
            <div className="rounded-lg border border-line">
              <EmptyState compact title="No orders match" message="Try a different search." action={<Button size="sm">Clear filters</Button>} />
            </div>
            <div className="rounded-lg border border-line">
              <ErrorState compact error={{ message: 'The server did not respond.' }} onRetry={() => {}} />
            </div>
          </div>
        </Section>

        <Section id="table" title="DataTable" usage={"<DataTable columns={[{ key, header, accessor, cell, sortable, align, hideBelow }]} rows status error onRetry onRowClick emptyState />"}>
          <SegmentedControl
            label="Table state"
            size="sm"
            className="mb-4"
            value={tableState}
            onChange={setTableState}
            options={[
              { value: 'success', label: 'Data' },
              { value: 'loading', label: 'Loading' },
              { value: 'error', label: 'Error' },
              { value: 'empty', label: 'Empty' },
            ]}
          />
          <div className="overflow-hidden rounded-lg border border-line">
            <DataTable
              caption="Demo products"
              columns={DEMO_COLUMNS}
              rows={tableState === 'success' ? DEMO_ROWS : []}
              status={tableState === 'empty' ? 'success' : tableState}
              error={{ message: 'Simulated error for the UI kit.' }}
              onRetry={() => setTableState('success')}
              skeletonRows={5}
              defaultSort="name:asc"
            />
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            This one sorts its own rows (uncontrolled). The Orders, Customers and Products pages pass{' '}
            <code className="font-mono text-xs">sort</code> and <code className="font-mono text-xs">onSortChange</code> so the API sorts across every page.
          </p>
        </Section>

        <Section id="overlays" title="Drawer & Modal" usage={'<Drawer open onClose title side="right|left" width="sm|md|lg" footer />   <Modal open onClose title size="sm|md|lg" footer />'}>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setDrawerOpen(true)}>Open drawer</Button>
            <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            Both use the native &lt;dialog&gt;: focus moves inside and stays there, Escape or a backdrop click closes, and focus
            returns to the button.
          </p>
        </Section>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Drawer"
        description="Slides in from the side"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setDrawerOpen(false)}>
              Done
            </Button>
          </>
        }
      >
        <div className="p-5 text-sm text-ink-soft">Used for order and customer details, and for the phone menu.</div>
      </Drawer>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Cancel this order?"
        description="A modal for short confirmations."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Keep order
            </Button>
            <Button variant="danger" onClick={() => setModalOpen(false)}>
              Cancel order
            </Button>
          </>
        }
      >
        Editing is out of scope for this project, so nothing will change. This just shows the component.
      </Modal>
    </>
  )
}
