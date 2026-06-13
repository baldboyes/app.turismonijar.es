import { computed, ref } from 'vue'
import type { BeachWeatherItem, BeachWeatherResponse } from '~/types/beachWeather'

const BEACH_WEATHER_URL = 'https://baldboy.es/tiempo/cabo-de-gata.json'

const BEACH_WEATHER_CACHE_KEYS = {
  data: 'beach_weather_cached_data',
  lastUpdate: 'beach_weather_last_update_time'
} as const

const BEACH_WEATHER_REFRESH_INTERVAL_MS = 5 * 60 * 1000
const BEACH_WEATHER_RETRY_INTERVAL_MS = 30 * 1000

const beachWeatherData = ref<BeachWeatherResponse | null>(null)
const lastUpdate = ref<number | null>(null)
const isLoading = ref(false)
const isRefreshing = ref(false)
const isError = ref(false)

const beachWeatherRuntime = {
  cacheHydrated: false,
  refreshTimer: null as ReturnType<typeof setTimeout> | null,
  hasFetchedApi: false
}

function canUseBrowserRuntime() {
  return import.meta.client && typeof window !== 'undefined'
}

function isValidBeachWeatherPayload(data: unknown): data is BeachWeatherResponse {
  if (!data || typeof data !== 'object') return false

  const payload = data as Partial<BeachWeatherResponse>
  return typeof payload.actualizado === 'string'
    && typeof payload.total_playas === 'number'
    && !!payload.playas
    && typeof payload.playas === 'object'
}

function hydrateBeachWeatherCache() {
  if (beachWeatherRuntime.cacheHydrated || !canUseBrowserRuntime()) return
  beachWeatherRuntime.cacheHydrated = true

  try {
    const cached = localStorage.getItem(BEACH_WEATHER_CACHE_KEYS.data)
    const time = localStorage.getItem(BEACH_WEATHER_CACHE_KEYS.lastUpdate)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (isValidBeachWeatherPayload(parsed)) {
        beachWeatherData.value = parsed
      }
    }
    if (time) {
      lastUpdate.value = parseInt(time, 10)
    }
  } catch (err) {
    console.warn('Failed to load beach weather cache from localStorage:', err)
  }
}

function scheduleNext(success: boolean) {
  if (!canUseBrowserRuntime()) return
  if (beachWeatherRuntime.refreshTimer) clearTimeout(beachWeatherRuntime.refreshTimer)

  const delay = success ? BEACH_WEATHER_REFRESH_INTERVAL_MS : BEACH_WEATHER_RETRY_INTERVAL_MS
  beachWeatherRuntime.refreshTimer = setTimeout(() => {
    fetchBeachWeather(true)
  }, delay)
}

export async function fetchBeachWeather(force = false) {
  hydrateBeachWeatherCache()

  if (isRefreshing.value || isLoading.value) return
  if (beachWeatherData.value && !force && beachWeatherRuntime.hasFetchedApi) return

  if (!beachWeatherData.value) {
    isLoading.value = true
  } else {
    isRefreshing.value = true
  }

  try {
    const response = await fetch(BEACH_WEATHER_URL, { cache: 'no-store' })
    if (!response.ok) throw new Error('Beach weather API request failed')

    const data = await response.json()
    if (!isValidBeachWeatherPayload(data)) {
      throw new Error('Invalid beach weather API payload structure')
    }

    beachWeatherData.value = data
    lastUpdate.value = Date.now()
    isError.value = false
    beachWeatherRuntime.hasFetchedApi = true

    if (canUseBrowserRuntime()) {
      try {
        localStorage.setItem(BEACH_WEATHER_CACHE_KEYS.data, JSON.stringify(data))
        localStorage.setItem(BEACH_WEATHER_CACHE_KEYS.lastUpdate, lastUpdate.value.toString())
      } catch (err) {
        console.warn('Failed to save beach weather cache to localStorage:', err)
      }
    }

    scheduleNext(true)
  } catch (error) {
    console.warn('Error al obtener los datos meteorológicos de playas:', error)
    isError.value = true
    scheduleNext(false)
  } finally {
    isLoading.value = false
    isRefreshing.value = false
  }
}

export function useBeachWeather() {
  hydrateBeachWeatherCache()

  const beachesWeather = computed(() => beachWeatherData.value?.playas ?? {})
  const updatedAt = computed(() => beachWeatherData.value?.actualizado ?? '')

  function getBeachWeather(beachId: string | number): BeachWeatherItem | undefined {
    return beachesWeather.value[String(beachId)]
  }

  return {
    beachWeatherData,
    beachesWeather,
    isLoading,
    isRefreshing,
    isError,
    lastUpdate,
    updatedAt,
    fetchBeachWeather,
    getBeachWeather
  }
}
