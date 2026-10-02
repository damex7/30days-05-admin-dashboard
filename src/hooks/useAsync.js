import { useCallback, useEffect, useState } from 'react'

/*
  Runs an async loader whenever deps change and tracks its state:
  status is 'loading' | 'success' | 'error'.

  While a new request is in flight, the previous data is kept, so a table
  can stay on screen (dimmed) instead of flashing back to skeletons.
  The `active` flag drops responses that arrive after a newer request
  started, so quick filter changes can't show stale results.
*/
export function useAsync(load, deps) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setState((previous) => ({ status: 'loading', data: previous.data, error: null }))
    load().then(
      (data) => active && setState({ status: 'success', data, error: null }),
      (error) => active && setState({ status: 'error', data: null, error }),
    )
    return () => {
      active = false
    }
  }, [...deps, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  return { ...state, retry, isRefreshing: state.status === 'loading' && state.data != null }
}
