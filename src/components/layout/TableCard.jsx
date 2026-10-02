import { cx } from '../../lib/cx.js'

/** The frame shared by the Orders, Customers and Products tables: toolbar, table, footer. */
export default function TableCard({ toolbar, footer, className, children }) {
  return (
    <section className={cx('min-w-0 rounded-xl border border-line bg-panel shadow-card', className)}>
      {toolbar && <div className="flex flex-wrap items-end gap-3 border-b border-line p-4">{toolbar}</div>}
      {children}
      {footer && <div className="border-t border-line px-4 py-3 sm:px-5">{footer}</div>}
    </section>
  )
}
