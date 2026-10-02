import { useId } from 'react'
import { cx } from '../../lib/cx.js'
import Button from './Button.jsx'
import { CloseIcon } from './Icons.jsx'
import { useDialog } from './useDialog.js'

const SIZES = {
  sm: 'w-[min(24rem,calc(100vw-2rem))]',
  md: 'w-[min(32rem,calc(100vw-2rem))]',
  lg: 'w-[min(44rem,calc(100vw-2rem))]',
}

/** A centred dialog for confirmations and short forms. Same engine as Drawer. */
export default function Modal({ open, onClose, title, description, size = 'md', footer, className, children }) {
  const titleId = useId()
  const dialogProps = useDialog(open, onClose)

  return (
    <dialog
      {...dialogProps}
      aria-labelledby={titleId}
      className={cx(
        'm-auto max-h-[calc(100dvh-2rem)] max-w-none rounded-xl border border-line bg-panel text-ink shadow-pop open:animate-pop-in',
        SIZES[size],
        className,
      )}
    >
      {open && (
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
          <header className="flex items-start justify-between gap-4 px-5 pt-5">
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
            </div>
            <Button variant="ghost" size="sm" iconOnly icon={<CloseIcon />} aria-label="Close" onClick={onClose} />
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-sm text-ink-soft">{children}</div>
          {footer && <footer className="flex flex-wrap justify-end gap-2 px-5 pb-5">{footer}</footer>}
        </div>
      )}
    </dialog>
  )
}
