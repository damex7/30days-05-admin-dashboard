import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

/*
  Keeps page state (range, filters, search, sort, page) in the URL, so a view
  can be shared as a link and survives a refresh.

  `defaults` must be a constant defined outside the component. Values equal
  to their default are removed from the URL to keep links short, and other
  params (like ?fail or ?order) are left alone.
*/
export function useUrlState(defaults) {
  const [params, setParams] = useSearchParams()

  const values = useMemo(() => {
    const result = {}
    for (const [key, fallback] of Object.entries(defaults)) {
      const raw = params.get(key)
      if (raw == null) result[key] = fallback
      else if (typeof fallback === 'number') result[key] = Number.isFinite(Number(raw)) ? Number(raw) : fallback
      else result[key] = raw
    }
    return result
  }, [params, defaults])

  /** update({ status: 'paid', page: 1 }); pass { replace: true } for typing. */
  const update = useCallback(
    (changes, { replace = false } = {}) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          for (const [key, value] of Object.entries(changes)) {
            if (value == null || value === '' || value === defaults[key]) next.delete(key)
            else next.set(key, String(value))
          }
          return next
        },
        { replace },
      )
    },
    [setParams, defaults],
  )

  return [values, update]
}
