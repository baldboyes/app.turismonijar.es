type HomeBeachFetch = (options?: { force?: boolean; silent?: boolean }) => Promise<unknown>

type HomeBeachPollingScheduler = (callback: () => void, ms: number) => unknown

export const HOME_BEACH_POLL_INTERVAL_MS = 30_000

export async function startHomeBeachPollingAfterInitialFetch(options: {
  fetchBeaches: HomeBeachFetch
  isMounted: () => boolean
  setInterval: HomeBeachPollingScheduler
}): Promise<unknown | undefined> {
  await options.fetchBeaches()

  if (!options.isMounted()) {
    return undefined
  }

  return options.setInterval(() => {
    void options.fetchBeaches({ force: true, silent: true })
  }, HOME_BEACH_POLL_INTERVAL_MS)
}
