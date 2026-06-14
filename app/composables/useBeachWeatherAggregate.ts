import { computed } from 'vue'
import type { BeachWeatherItem } from '~/types/beachWeather'

export type BeachWeatherState = 'sunny' | 'cloudy' | 'rainy' | 'snowy'

const WEATHER_STATE_PRIORITY: Record<BeachWeatherState, number> = {
  sunny: 1,
  cloudy: 2,
  snowy: 3,
  rainy: 4
}

const WEATHER_ICON_BY_CODE: Record<number, { day: string; night: string }> = {
  0: { day: '01d', night: '01n' },
  1: { day: '01d', night: '01n' },
  2: { day: '02d', night: '02n' },
  3: { day: '03d', night: '03n' },
  45: { day: '50d', night: '50n' },
  48: { day: '50d', night: '50n' },
  51: { day: '09d', night: '09n' },
  53: { day: '09d', night: '09n' },
  55: { day: '09d', night: '09n' },
  56: { day: '09d', night: '09n' },
  57: { day: '09d', night: '09n' },
  61: { day: '10d', night: '10n' },
  63: { day: '10d', night: '10n' },
  65: { day: '10d', night: '10n' },
  66: { day: '10d', night: '10n' },
  67: { day: '10d', night: '10n' },
  71: { day: '13d', night: '13n' },
  73: { day: '13d', night: '13n' },
  75: { day: '13d', night: '13n' },
  77: { day: '13d', night: '13n' },
  80: { day: '09d', night: '09n' },
  81: { day: '09d', night: '09n' },
  82: { day: '09d', night: '09n' },
  85: { day: '13d', night: '13n' },
  86: { day: '13d', night: '13n' },
  95: { day: '11d', night: '11n' },
  96: { day: '11d', night: '11n' },
  99: { day: '11d', night: '11n' }
}

const WEATHER_DESCRIPTION_KEY_BY_STATE: Record<BeachWeatherState, string> = {
  sunny: 'weather.sunny',
  cloudy: 'weather.cloudy',
  rainy: 'weather.rain',
  snowy: 'weather.snow'
}

function average(values: Array<number | undefined | null>) {
  const validValues = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
  if (!validValues.length) return 0
  return validValues.reduce((total, value) => total + value, 0) / validValues.length
}

function roundToMaxDecimals(value: number, decimals = 2) {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function roundDegreesToMaxDecimals(value: number, decimals = 2) {
  return roundToMaxDecimals(value, decimals) % 360
}

function circularMeanDegrees(values: Array<number | undefined | null>) {
  const validValues = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
  if (!validValues.length) return 0

  const vector = validValues.reduce(
    (total, value) => {
      const radians = (value * Math.PI) / 180
      total.sin += Math.sin(radians)
      total.cos += Math.cos(radians)
      return total
    },
    { sin: 0, cos: 0 }
  )

  if (Math.hypot(vector.sin, vector.cos) < Number.EPSILON) return 0

  const meanRadians = Math.atan2(vector.sin / validValues.length, vector.cos / validValues.length)
  return (meanRadians * 180 / Math.PI + 360) % 360
}

function averageSeries(items: BeachWeatherItem[], selector: (item: BeachWeatherItem) => number[] | undefined, index: number) {
  return average(items.map((item) => selector(item)?.[index]))
}

function roundedAverageSeries(items: BeachWeatherItem[], selector: (item: BeachWeatherItem) => number[] | undefined, index: number) {
  return roundToMaxDecimals(averageSeries(items, selector, index))
}

function circularMeanSeries(items: BeachWeatherItem[], selector: (item: BeachWeatherItem) => number[] | undefined, index: number) {
  return circularMeanDegrees(items.map((item) => selector(item)?.[index]))
}

function roundedCircularMeanSeries(items: BeachWeatherItem[], selector: (item: BeachWeatherItem) => number[] | undefined, index: number) {
  return roundDegreesToMaxDecimals(circularMeanSeries(items, selector, index))
}

export function getWeatherStateFromCode(code: number): BeachWeatherState {
  if (code === 0 || code === 1) return 'sunny'
  if (code === 2 || code === 3 || code === 45 || code === 48) return 'cloudy'
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'snowy'
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) return 'rainy'
  return 'sunny'
}

export function getRepresentativeWeatherCode(codes: Array<number | undefined | null>) {
  const stateCounts = new Map<BeachWeatherState, number>()
  const codeCounts = new Map<number, number>()

  for (const code of codes) {
    if (typeof code !== 'number' || !Number.isFinite(code)) continue
    const state = getWeatherStateFromCode(code)
    stateCounts.set(state, (stateCounts.get(state) ?? 0) + 1)
    codeCounts.set(code, (codeCounts.get(code) ?? 0) + 1)
  }

  const dominantState = [...stateCounts.entries()].sort((a, b) => {
    const countDelta = b[1] - a[1]
    if (countDelta !== 0) return countDelta
    return WEATHER_STATE_PRIORITY[b[0]] - WEATHER_STATE_PRIORITY[a[0]]
  })[0]?.[0] ?? 'sunny'

  return [...codeCounts.entries()]
    .filter(([code]) => getWeatherStateFromCode(code) === dominantState)
    .sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]?.[0] ?? 0
}

export function getWeatherIconFromCode(code: number, isDay: boolean) {
  const icon = WEATHER_ICON_BY_CODE[code]
  if (!icon) return ''
  return `https://openweathermap.org/img/wn/${isDay ? icon.day : icon.night}@2x.png`
}

export function getWeatherDescriptionKeyFromCode(code: number) {
  return WEATHER_DESCRIPTION_KEY_BY_STATE[getWeatherStateFromCode(code)]
}

export function getHourlyValue(item: BeachWeatherItem, key: 'uv_index', fallback: number | undefined) {
  const currentHour = item.current?.time?.slice(0, 13)
  const hourlyIndex = currentHour && item.hourly?.time
    ? item.hourly.time.findIndex((time) => time.slice(0, 13) === currentHour)
    : -1
  const value = hourlyIndex >= 0 ? item.hourly?.[key]?.[hourlyIndex] : fallback
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export function buildBeachWeatherAggregate(items: BeachWeatherItem[]): BeachWeatherItem | null {
  if (!items.length) return null

  const reference = items[0]
  if (!reference) return null

  const hourlyTimes = reference.hourly?.time ?? []
  const dailyTimes = reference.daily?.time ?? []
  const marineTimes = reference.marine?.hourly?.time ?? []

  return {
    ...reference,
    id: 'beach-average',
    nombre: 'Beach average',
    latitud: average(items.map((item) => item.latitud)),
    longitud: average(items.map((item) => item.longitud)),
    sea_surface_temperature: average(items.map((item) => item.sea_surface_temperature)),
    current: {
      ...reference.current,
      temperature_2m: average(items.map((item) => item.current?.temperature_2m)),
      relative_humidity_2m: average(items.map((item) => item.current?.relative_humidity_2m)),
      is_day: average(items.map((item) => item.current?.is_day)) >= 0.5 ? 1 : 0,
      precipitation: roundToMaxDecimals(average(items.map((item) => item.current?.precipitation))),
      rain: roundToMaxDecimals(average(items.map((item) => item.current?.rain))),
      weather_code: getRepresentativeWeatherCode(items.map((item) => item.current?.weather_code)),
      wind_speed_10m: average(items.map((item) => item.current?.wind_speed_10m)),
      wind_direction_10m: roundDegreesToMaxDecimals(circularMeanDegrees(items.map((item) => item.current?.wind_direction_10m)))
    },
    hourly: {
      ...reference.hourly,
      time: hourlyTimes,
      temperature_2m: hourlyTimes.map((_, index) => averageSeries(items, (item) => item.hourly?.temperature_2m, index)),
      relative_humidity_2m: hourlyTimes.map((_, index) => averageSeries(items, (item) => item.hourly?.relative_humidity_2m, index)),
      precipitation_probability: hourlyTimes.map((_, index) => roundedAverageSeries(items, (item) => item.hourly?.precipitation_probability, index)),
      rain: hourlyTimes.map((_, index) => roundedAverageSeries(items, (item) => item.hourly?.rain, index)),
      weather_code: hourlyTimes.map((_, index) => getRepresentativeWeatherCode(items.map((item) => item.hourly?.weather_code?.[index]))),
      wind_speed_10m: hourlyTimes.map((_, index) => averageSeries(items, (item) => item.hourly?.wind_speed_10m, index)),
      wind_direction_10m: hourlyTimes.map((_, index) => roundedCircularMeanSeries(items, (item) => item.hourly?.wind_direction_10m, index)),
      uv_index: hourlyTimes.map((_, index) => averageSeries(items, (item) => item.hourly?.uv_index, index)),
      is_day: hourlyTimes.map((_, index) => average(items.map((item) => item.hourly?.is_day?.[index])) >= 0.5 ? 1 : 0)
    },
    daily: {
      ...reference.daily,
      time: dailyTimes,
      weather_code: dailyTimes.map((_, index) => getRepresentativeWeatherCode(items.map((item) => item.daily?.weather_code?.[index]))),
      temperature_2m_max: dailyTimes.map((_, index) => averageSeries(items, (item) => item.daily?.temperature_2m_max, index)),
      sunrise: reference.daily?.sunrise ?? [],
      sunset: reference.daily?.sunset ?? [],
      uv_index_max: dailyTimes.map((_, index) => averageSeries(items, (item) => item.daily?.uv_index_max, index)),
      precipitation_probability_max: dailyTimes.map((_, index) => roundedAverageSeries(items, (item) => item.daily?.precipitation_probability_max, index)),
      wind_speed_10m_max: dailyTimes.map((_, index) => averageSeries(items, (item) => item.daily?.wind_speed_10m_max, index))
    },
    marine: {
      hourly: {
        ...reference.marine?.hourly,
        time: marineTimes,
        sea_surface_temperature: marineTimes.map((_, index) => averageSeries(items, (item) => item.marine?.hourly?.sea_surface_temperature, index)),
        wave_height: marineTimes.map((_, index) => averageSeries(items, (item) => item.marine?.hourly?.wave_height, index)),
        wave_direction: marineTimes.map((_, index) => averageSeries(items, (item) => item.marine?.hourly?.wave_direction, index)),
        wave_period: marineTimes.map((_, index) => averageSeries(items, (item) => item.marine?.hourly?.wave_period, index))
      }
    }
  }
}

export function useBeachWeatherAggregate(items: () => BeachWeatherItem[]) {
  const aggregateWeatherData = computed(() => buildBeachWeatherAggregate(items()))
  const aggregateWeatherCode = computed(() => aggregateWeatherData.value?.current?.weather_code ?? null)
  const aggregateWeatherState = computed(() => aggregateWeatherCode.value === null ? null : getWeatherStateFromCode(aggregateWeatherCode.value))

  return {
    aggregateWeatherData,
    aggregateWeatherCode,
    aggregateWeatherState
  }
}
