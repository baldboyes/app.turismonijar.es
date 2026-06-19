import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import BeachCard from './BeachCard.vue'
import type { Beach } from '~/types/beach'
import type { BeachWeatherItem } from '~/types/beachWeather'

const beach: Beach = {
  id: 'playa-test',
  title: 'Test Beach',
  state: 'available',
  lat: 36.8,
  lng: -2.1,
  description: 'Clean beach description',
  caracteristicas: 'Arena: Fine sand<br />Longitud: 200 m'
}

const weather: BeachWeatherItem = {
  id: 'playa-test',
  nombre: 'Test Beach',
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
    weather_code: 0,
    wind_speed_10m: 14.2,
    wind_direction_10m: 90
  },
  hourly: {
    time: ['2026-06-14T10:00'],
    temperature_2m: [25.6],
    relative_humidity_2m: [60],
    precipitation_probability: [0],
    rain: [0],
    weather_code: [0],
    wind_speed_10m: [14.2],
    wind_direction_10m: [90],
    uv_index: [6.6],
    is_day: [1]
  },
  daily: {
    time: ['2026-06-14'],
    weather_code: [0],
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

async function renderBeachCard(props: { beach: Beach; weather?: BeachWeatherItem }) {
  const app = createSSRApp({
    render: () => h(BeachCard, props)
  })

  app.config.globalProperties.$t = (key: string) => key
  app.component('NuxtImg', {
    props: ['src', 'alt'],
    template: '<img :src="src" :alt="alt" />'
  })

  return renderToString(app)
}

describe('BeachCard', () => {
  it('renders the compact per-beach weather row values', async () => {
    const html = await renderBeachCard({ beach, weather })

    expect(html).toContain('aria-label="weather.beach_summary"')
    expect(html).toContain('26°')
    expect(html).toContain('14 km/h')
    expect(html).toContain('21°')
    expect(html).toContain('7 UV')
  })

  it('renders the parking full badge with the approved white icon on red background', async () => {
    const html = await renderBeachCard({
      beach: { ...beach, ocupacion: { state: 'red' } }
    })

    expect(html).toContain('playas_page.parking_full')
    expect(html).toContain('bg-red-600/95')
    expect(html).toContain('viewbox="0 0 14 14"')
    expect(html).toContain('text-white')
  })
})
