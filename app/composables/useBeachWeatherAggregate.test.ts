import { describe, expect, it } from 'vitest'
import type { BeachWeatherItem } from '~/types/beachWeather'
import {
  buildBeachWeatherAggregate,
  getRepresentativeWeatherCode,
  getWeatherIconFromCode,
  getWeatherStateFromCode,
  useBeachWeatherAggregate
} from './useBeachWeatherAggregate'

const baseWeatherItem: BeachWeatherItem = {
  id: 'beach-1',
  nombre: 'Beach 1',
  latitud: 36.8,
  longitud: -2.1,
  sea_surface_temperature: 20,
  current: {
    time: '2026-06-14T10:00',
    interval: 900,
    temperature_2m: 20,
    relative_humidity_2m: 60,
    is_day: 1,
    precipitation: 0,
    rain: 0,
    weather_code: 0,
    wind_speed_10m: 10,
    wind_direction_10m: 0
  },
  hourly: {
    time: ['2026-06-14T10:00', '2026-06-14T11:00'],
    temperature_2m: [20, 22],
    relative_humidity_2m: [60, 62],
    precipitation_probability: [0, 10],
    rain: [0, 0],
    weather_code: [0, 0],
    wind_speed_10m: [10, 12],
    wind_direction_10m: [0, 90],
    uv_index: [5, 6],
    is_day: [1, 1]
  },
  daily: {
    time: ['2026-06-14'],
    weather_code: [0],
    temperature_2m_max: [24],
    sunrise: ['2026-06-14T06:00'],
    sunset: ['2026-06-14T21:00'],
    uv_index_max: [8],
    precipitation_probability_max: [10],
    wind_speed_10m_max: [18]
  },
  marine: {
    hourly: {
      time: ['2026-06-14T10:00'],
      sea_surface_temperature: [20],
      wave_height: [0.5],
      wave_direction: [90],
      wave_period: [4]
    }
  }
}

function weatherItem(overrides: Partial<BeachWeatherItem> = {}): BeachWeatherItem {
  return {
    ...baseWeatherItem,
    ...overrides,
    current: { ...baseWeatherItem.current, ...overrides.current },
    hourly: { ...baseWeatherItem.hourly, ...overrides.hourly },
    daily: { ...baseWeatherItem.daily, ...overrides.daily },
    marine: {
      hourly: {
        ...baseWeatherItem.marine.hourly,
        ...overrides.marine?.hourly
      }
    }
  }
}

describe('buildBeachWeatherAggregate', () => {
  it('averages numeric current, hourly, daily, and marine values', () => {
    const aggregate = buildBeachWeatherAggregate([
      weatherItem(),
      weatherItem({
        latitud: 37,
        longitud: -2.3,
        sea_surface_temperature: 22,
        current: {
          ...baseWeatherItem.current,
          temperature_2m: 24,
          relative_humidity_2m: 80,
          wind_speed_10m: 14
        },
        hourly: {
          ...baseWeatherItem.hourly,
          temperature_2m: [24, 26],
          uv_index: [7, 8]
        },
        daily: {
          ...baseWeatherItem.daily,
          temperature_2m_max: [28]
        },
        marine: {
          hourly: {
            ...baseWeatherItem.marine.hourly,
            wave_height: [1.5]
          }
        }
      })
    ])

    expect(aggregate?.latitud).toBe(36.9)
    expect(aggregate?.longitud).toBe(-2.2)
    expect(aggregate?.sea_surface_temperature).toBe(21)
    expect(aggregate?.current.temperature_2m).toBe(22)
    expect(aggregate?.current.relative_humidity_2m).toBe(70)
    expect(aggregate?.current.wind_speed_10m).toBe(12)
    expect(aggregate?.hourly.temperature_2m).toEqual([22, 24])
    expect(aggregate?.hourly.uv_index).toEqual([6, 7])
    expect(aggregate?.daily.temperature_2m_max).toEqual([26])
    expect(aggregate?.marine.hourly.wave_height).toEqual([1])
  })

  it('uses weather state majority and severity tie-breaks for representative weather', () => {
    expect(getRepresentativeWeatherCode([0, 1, 61])).toBe(1)
    expect(getRepresentativeWeatherCode([0, 61])).toBe(61)
    expect(getWeatherStateFromCode(getRepresentativeWeatherCode([2, 61]))).toBe('rainy')
    expect(getWeatherIconFromCode(getRepresentativeWeatherCode([2, 61]), true)).toContain('/10d@2x.png')
  })

  it('uses a circular mean for wind direction instead of an arithmetic mean', () => {
    const aggregate = buildBeachWeatherAggregate([
      weatherItem({ current: { ...baseWeatherItem.current, wind_direction_10m: 359 }, hourly: { ...baseWeatherItem.hourly, wind_direction_10m: [359, 90] } }),
      weatherItem({ current: { ...baseWeatherItem.current, wind_direction_10m: 1 }, hourly: { ...baseWeatherItem.hourly, wind_direction_10m: [1, 180] } })
    ])

    expect(aggregate?.current.wind_direction_10m).toBe(0)
    expect(aggregate?.hourly.wind_direction_10m[0]).toBe(0)
    expect(aggregate?.hourly.wind_direction_10m[1]).toBe(135)
  })

  it('returns no aggregate for an empty beach payload', () => {
    const aggregate = buildBeachWeatherAggregate([])
    const composable = useBeachWeatherAggregate(() => [])

    expect(aggregate).toBeNull()
    expect(composable.aggregateWeatherData.value).toBeNull()
    expect(composable.aggregateWeatherCode.value).toBeNull()
    expect(composable.aggregateWeatherState.value).toBeNull()
  })

  it('caps rain, precipitation probability, and wind direction to at most two decimals', () => {
    const aggregate = buildBeachWeatherAggregate([
      weatherItem({
        current: {
          ...baseWeatherItem.current,
          precipitation: 0.111,
          rain: 0.111,
          wind_direction_10m: 10
        },
        hourly: {
          ...baseWeatherItem.hourly,
          precipitation_probability: [10.111, 20.111],
          rain: [0.111, 0.222],
          wind_direction_10m: [10, 20]
        },
        daily: {
          ...baseWeatherItem.daily,
          precipitation_probability_max: [30.111]
        }
      }),
      weatherItem({
        current: {
          ...baseWeatherItem.current,
          precipitation: 0.222,
          rain: 0.222,
          wind_direction_10m: 20
        },
        hourly: {
          ...baseWeatherItem.hourly,
          precipitation_probability: [20.222, 30.222],
          rain: [0.222, 0.333],
          wind_direction_10m: [20, 30]
        },
        daily: {
          ...baseWeatherItem.daily,
          precipitation_probability_max: [40.222]
        }
      })
    ])

    expect(aggregate?.current.precipitation).toBe(0.17)
    expect(aggregate?.current.rain).toBe(0.17)
    expect(aggregate?.current.wind_direction_10m).toBe(15)
    expect(aggregate?.hourly.precipitation_probability).toEqual([15.17, 25.17])
    expect(aggregate?.hourly.rain).toEqual([0.17, 0.28])
    expect(aggregate?.hourly.wind_direction_10m).toEqual([15, 25])
    expect(aggregate?.daily.precipitation_probability_max).toEqual([35.17])
  })
})
