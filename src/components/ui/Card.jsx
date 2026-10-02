import { cx } from '../../lib/cx.js'

const PADDING = { none: '', sm: 'p-4', md: 'p-5' }

/** A panel with an optional header: title, description, and actions on the right. */
export default function Card({
  as: Component = 'section',
  title,
  titleAs: Title = 'h2',
  titleId,
  description,
  actions,
  padding = 'md',
  className,
  children,
  ...props
}) {
  const hasHeader = title || actions
  return (
    <Component
      aria-labelledby={title && titleId ? titleId : undefined}
      className={cx('min-w-0 rounded-xl border border-line bg-panel shadow-card', className)}
      {...props}
    >
      {hasHeader && (
        <header
          className={cx(
            'flex flex-wrap items-start justify-between gap-x-4 gap-y-2',
            padding === 'none' ? 'border-b border-line px-5 py-4' : cx(PADDING[padding], 'pb-0'),
          )}
        >
          <div className="min-w-0">
            {title && (
              <Title id={titleId} className="text-base font-semibold text-ink">
                {title}
              </Title>
            )}
            {description && <p className="mt-0.5 text-sm text-ink-soft">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cx(PADDING[padding], hasHeader && padding !== 'none' && 'pt-4')}>{children}</div>
    </Component>
  )
}
