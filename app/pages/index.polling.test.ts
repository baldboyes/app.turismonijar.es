import { describe, expect, it, vi } from 'vitest'
import { HOME_BEACH_POLL_INTERVAL_MS, startHomeBeachPollingAfterInitialFetch } from './index.polling'

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })

  return { promise, resolve }
}

describe('home beach polling', () => {
  it('does not create a polling interval when unmounted before the initial fetch resolves', async () => {
    let mounted = true
    const initialFetch = createDeferred<void>()
    const fetchBeaches = vi.fn().mockReturnValueOnce(initialFetch.promise)
    const setInterval = vi.fn()

    const startPolling = startHomeBeachPollingAfterInitialFetch({
      fetchBeaches,
      isMounted: () => mounted,
      setInterval
    })

    mounted = false
    initialFetch.resolve()

    await expect(startPolling).resolves.toBeUndefined()
    expect(setInterval).not.toHaveBeenCalled()
  })

  it('polls every 30 seconds with a silent forced refresh while mounted', async () => {
    const fetchBeaches = vi.fn().mockResolvedValue(undefined)
    const setInterval = vi.fn((_callback: () => void, _ms: number) => 123)

    await expect(startHomeBeachPollingAfterInitialFetch({
      fetchBeaches,
      isMounted: () => true,
      setInterval
    })).resolves.toBe(123)

    expect(setInterval).toHaveBeenCalledTimes(1)
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), HOME_BEACH_POLL_INTERVAL_MS)

    const firstSetIntervalCall = setInterval.mock.calls[0]
    expect(firstSetIntervalCall).toBeDefined()

    const [pollCallback] = firstSetIntervalCall!
    pollCallback()

    expect(fetchBeaches).toHaveBeenLastCalledWith({ force: true, silent: true })
  })
})
