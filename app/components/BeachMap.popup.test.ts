import { describe, expect, it } from 'vitest'
import {
  buildBeachPopupHtml,
  escapeCssUrl,
  getUvBadgeClass,
  shouldFitBoundsForWeatherRefresh
} from './BeachMap.popup'
import type { Beach } from '~/types/beach'
import type { BeachWeatherItem } from '~/types/beachWeather'

const beach: Beach = {
  id: 'playa-<test>&"',
  title: 'Cala <Test> & "Friends"',
  state: 'verde',
  lat: 36.8,
  lng: -2.1,
  src: '/images/playas/cala-test.jpg'
}

const weather: BeachWeatherItem = {
  id: 'playa-<test>&"',
  nombre: 'Cala Test',
  latitud: 36.8,
  longitud: -2.1,
  sea_surface_temperature: 21.4,
  current: {
    time: '2026-06-14T10:00',
    interval: 900,
    temperature_2m: 25.6,
    relative_humidity_2m: 60,
    is_day: 1,
    precipitation: 0,
    rain: 0,
    weather_code: 2,
    wind_speed_10m: 14.2,
    wind_direction_10m: 90
  },
  hourly: {
    time: ['2026-06-14T10:00'],
    temperature_2m: [25.6],
    relative_humidity_2m: [60],
    precipitation_probability: [0],
    rain: [0],
    weather_code: [2],
    wind_speed_10m: [14.2],
    wind_direction_10m: [90],
    uv_index: [6.6],
    is_day: [1]
  },
  daily: {
    time: ['2026-06-14'],
    weather_code: [2],
    temperature_2m_max: [28],
    sunrise: ['2026-06-14T06:00'],
    sunset: ['2026-06-14T21:00'],
    uv_index_max: [8],
    precipitation_probability_max: [0],
    wind_speed_10m_max: [18]
  },
  marine: {
    hourly: {
      time: ['2026-06-14T10:00'],
      sea_surface_temperature: [21.4],
      wave_height: [0.5],
      wave_direction: [90],
      wave_period: [4]
    }
  }
}

function renderPopup(overrides: Partial<Parameters<typeof buildBeachPopupHtml>[0]> = {}) {
  return buildBeachPopupHtml({
    beach,
    beachWeather: weather,
    linkUrl: '/playas/playa-<test>&"',
    popupStatus: 'Green <safe> & "quoted"',
    viewBeachText: 'View beach',
    viewWeatherText: 'View weather',
    parkingFullText: 'Parking full',
    ...overrides
  })
}

describe('BeachMap popup helpers', () => {
  it('renders escaped beach title and escaped translated status text', () => {
    const html = renderPopup()

    expect(html).toContain('Cala &lt;Test&gt; &amp; &quot;Friends&quot;')
    expect(html).toContain('Green &lt;safe&gt; &amp; &quot;quoted&quot;')
    expect(html).not.toContain('Cala <Test>')
    expect(html).not.toContain('Green <safe>')
    expect(html).not.toContain('Flag:')
  })

  it('renders the beach image as card background with a white border', () => {
    const html = renderPopup()

    expect(html).toContain('border-white')
    expect(html).toContain('bg-cover bg-center')
    expect(html).toContain("url('/images/playas/cala-test.jpg')")
    expect(html).toContain('linear-gradient')
  })

  it('keeps the beach status aligned left when there is no parking badge', () => {
    const html = renderPopup()

    expect(html).toContain('flex items-center justify-start gap-1 mb-1.5')
  })

  it('centers the beach status row when the parking badge is present', () => {
    const html = renderPopup({ beach: { ...beach, ocupacion: { state: 'red' } } })

    expect(html).toContain('flex items-center justify-center gap-1 mb-1.5')
    expect(html).toContain('Parking full')
  })

  it('renders the compact weather mini-line when weather is available', () => {
    const html = renderPopup()

    expect(html).toContain('rounded-xl')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('26°')
    expect(html).toContain('14 km/h')
    expect(html).toContain('rounded-full px-1.5 py-0.5 font-extrabold text-white bg-amber-500')
    expect(html).toContain('UV 7')
    expect(html).not.toContain('☀️')
    expect(html).not.toContain('💨')
  })

  it('does not render wind animation markup in the popup', () => {
    const html = renderPopup()

    expect(html).not.toContain('popup-wind-flow')
    expect(html).not.toContain('beach-marker-wind-indicator')
  })

  it('renders beach and weather actions with escaped navigation attributes and primary rounded styling', () => {
    const html = renderPopup()

    expect(html).toMatch(/<a href="\/playas\/playa-&lt;test&gt;&amp;&quot;" class="beach-link beach-popup-action[^"]*rounded-full[^"]*bg-primary/)
    expect(html).toMatch(/<button type="button" data-beach-id="playa-&lt;test&gt;&amp;&quot;" class="beach-weather-link beach-popup-action[^"]*rounded-full[^"]*bg-primary/)
  })

  it('renders weather action disabled and visually disabled when weather is unavailable', () => {
    const html = renderPopup({ beachWeather: undefined })

    expect(html).not.toContain('rounded-xl bg-sky-50')
    expect(html).toMatch(/class="beach-weather-link[^"]*opacity-50 cursor-not-allowed" disabled aria-disabled="true"/)
  })

  it('does not request fit-bounds for weather-only marker refreshes', () => {
    expect(shouldFitBoundsForWeatherRefresh()).toBe(false)
  })

  it('uses the same solid UV badge color scale as the rest of the app', () => {
    expect(getUvBadgeClass(null)).toBe('bg-slate-500')
    expect(getUvBadgeClass(2)).toBe('bg-emerald-600')
    expect(getUvBadgeClass(5)).toBe('bg-yellow-500')
    expect(getUvBadgeClass(7)).toBe('bg-amber-500')
    expect(getUvBadgeClass(10)).toBe('bg-red-600')
    expect(getUvBadgeClass(11)).toBe('bg-purple-700')
  })

  it('escapes CSS URL characters used in popup background images', () => {
    expect(escapeCssUrl(`a'b"c(d).jpg`)).toBe('a\\27 b\\22 c\\28 d\\29 .jpg')
  })
})
