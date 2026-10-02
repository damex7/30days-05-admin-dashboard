import { useEffect } from 'react'

/** Page title, one-line description and actions; also sets the browser tab title. */
export default function PageHeader({ title, description, actions }) {
  useEffect(() => {
    document.title = `${title} · Kasuwa Admin`
  }, [title])

  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
