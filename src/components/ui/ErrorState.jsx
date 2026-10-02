import { cx } from '../../lib/cx.js'
import Button from './Button.jsx'
import { AlertIcon, RefreshIcon } from './Icons.jsx'

/*
  Shown when a request fails. role="alert" makes screen readers announce
  it as soon as it appears. Retry just calls the loader again.
*/
export default function ErrorState({
  title = "Couldn't load this",
  message = 'Something went wrong while fetching the data.',
  error,
  onRetry,
  compact = false,
  className,
}) {
  return (
    <div
      role="alert"
      className={cx('flex flex-col items-center text-center', compact ? 'px-4 py-6' : 'px-6 py-12', className)}
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertIcon size={22} />
      </div>
      <p className="mt-3 font-display text-base font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-ink-soft">{error?.message ?? message}</p>
      {onRetry && (
        <Button className="mt-4" size="sm" icon={<RefreshIcon size={15} />} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
