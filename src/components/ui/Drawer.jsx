import { useId } from 'react'
import { cx } from '../../lib/cx.js'
import Button from './Button.jsx'
import { CloseIcon } from './Icons.jsx'
import { useDialog } from './useDialog.js'

const WIDTHS = { sm: 'w-[min(20rem,100vw)]', md: 'w-[min(28rem,100vw)]', lg: 'w-[min(36rem,100vw)]' }

/*
  A panel that slides in from the side, for details (an order, a customer)
  and the phone navigation menu. Content only renders while open.
*/
export default function Drawer({
  open,
  onClose,
  title,
  description,
  side = 'right',
  width = 'md',
  footer,
  hideHeader = false,
  label,
  className,
  children,
}) {
  const titleId = useId()
  const dialogProps = useDialog(open, onClose)

  return (
    <dialog
      {...dialogProps}
      aria-labelledby={hideHeader ? undefined : titleId}
      aria-label={hideHeader ? label : undefined}
      className={cx(
        'fixed inset-y-0 m-0 h-dvh max-h-none max-w-none bg-panel text-ink shadow-pop',
        side === 'right' ? 'right-0 left-auto border-l border-line open:animate-drawer-right' : 'right-auto left-0 border-r border-line open:animate-drawer-left',
        WIDTHS[width],
        className,
      )}
    >
      {open && (
        <div className="flex h-full flex-col">
          {!hideHeader && (
            <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div className="min-w-0">
                <h2 id={titleId} className="truncate text-lg font-semibold">
                  {title}
                </h2>
                {description && <p className="mt-0.5 text-sm text-ink-soft">{description}</p>}
              </div>
              <Button variant="ghost" size="sm" iconOnly icon={<CloseIcon />} aria-label="Close" onClick={onClose} />
            </header>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">{footer}</footer>}
        </div>
      )}
    </dialog>
  )
}
