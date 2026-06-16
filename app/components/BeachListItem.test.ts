import { readFileSync } from 'node:fs'
import * as Vue from 'vue'
import { createRenderer, createSSRApp, h, ssrContextKey } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import { afterEach, describe, expect, it, vi } from 'vitest'
import BeachListItem from './BeachListItem.vue'
import type { Beach } from '~/types/beach'
import type { BeachWeatherItem } from '~/types/beachWeather'

type TestNode = {
  type: string
  props: Record<string, unknown>
  children: Array<TestNode | string>
}

let clientRender: unknown

const translations: Record<string, string> = {
  'map.view_beach': 'View beach',
  'playas_page.parking_full': 'Parking full',
  'weather.open_beach_details': 'Open beach weather details',
  'weather.partly_cloudy': 'Partly cloudy',
  verde: 'Green flag',
  amarilla: 'Yellow flag',
  amarilla_por_medusa: 'Yellow flag due to jellyfish',
  roja: 'Red flag'
}

const beach: Beach = {
  id: 'playa-test',
  title: 'Test Beach',
  state: 'verde',
  lat: 36.8,
  lng: -2.1
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

function t(key: string, params?: Record<string, string>) {
  if (key === 'weather.open_beach_details' && params?.beach) {
    return `${translations[key]}: ${params.beach}`
  }

  return translations[key] ?? key
}

async function renderBeachListItem(props: { beach: Beach; weather?: BeachWeatherItem }) {
  vi.stubGlobal('useI18n', () => ({ t }))

  const app = createSSRApp({
    render: () => h(BeachListItem, props)
  })

  app.config.globalProperties.$t = t

  return renderToString(app)
}

function renderBeachListItemForInteraction(
  props: { beach: Beach; weather?: BeachWeatherItem },
  listeners: Record<string, (...args: unknown[]) => void> = {}
) {
  vi.stubGlobal('useI18n', () => ({ t }))
  const interactiveBeachListItem = { ...BeachListItem, render: getClientRender() }

  const renderer = createRenderer<TestNode, TestNode>({
    patchProp(el, key, _previousValue, nextValue) {
      el.props[key] = nextValue
    },
    insert(child, parent) {
      parent.children.push(child)
    },
    remove() {},
    createElement(type) {
      return { type, props: {}, children: [] }
    },
    createText(text) {
      return text as unknown as TestNode
    },
    createComment(text) {
      return `<!--${text}-->` as unknown as TestNode
    },
    setText() {},
    setElementText(el, text) {
      el.children = [text]
    },
    parentNode() {
      return null
    },
    nextSibling() {
      return null
    }
  })

  const root: TestNode = { type: 'root', props: {}, children: [] }
  const app = renderer.createApp({
    render: () => h(interactiveBeachListItem, { ...props, ...listeners })
  })
  app.provide(ssrContextKey, { modules: new Set<string>() })
  app.config.globalProperties.$t = t
  app.mount(root)

  return root
}

function getClientRender() {
  if (clientRender) return clientRender

  const filename = new URL('./BeachListItem.vue', import.meta.url)
  const source = readFileSync(filename, 'utf8')
  const { descriptor } = parse(source, { filename: filename.pathname })
  const script = compileScript(descriptor, { id: 'BeachListItem' })
  const template = compileTemplate({
    source: descriptor.template?.content ?? '',
    filename: filename.pathname,
    id: 'BeachListItem',
    compilerOptions: {
      bindingMetadata: script.bindings
    }
  })
  const code = template.code
    .replace(/import\s+\{([\s\S]*?)\}\s+from ['"]vue['"]/, (_match, imports: string) => {
      return `const {${imports.replace(/\s+as\s+/g, ': ')}} = Vue`
    })
    .replace('export function render', 'return function render')

  clientRender = new Function('Vue', code)({ ...Vue, ...Vue.ssrUtils })
  return clientRender
}

function findElement(node: TestNode, predicate: (node: TestNode) => boolean): TestNode | undefined {
  if (predicate(node)) return node

  for (const child of node.children) {
    if (typeof child === 'string') continue

    const match = findElement(child, predicate)
    if (match) return match
  }
}

function click(node: TestNode) {
  const handler = node.props.onClick
  const event = { stopPropagation: vi.fn(), preventDefault: vi.fn() }

  if (Array.isArray(handler)) {
    handler.forEach((callback) => callback(event))
    return
  }

  if (typeof handler === 'function') {
    handler(event)
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('BeachListItem', () => {
  it('renders a colored beach card with a beach-specific accessible label and status', async () => {
    const html = await renderBeachListItem({ beach, weather })

    expect(html).toContain('aria-label="View beach: Test Beach"')
    expect(html).toContain('bg-emerald-600')
    expect(html).toContain('Test Beach')
    expect(html).toContain('Green flag')
  })

  it('renders parking full as a red alert badge', async () => {
    const html = await renderBeachListItem({
      beach: { ...beach, ocupacion: { state: 'red' } },
      weather
    })

    expect(html).toContain('role="alert"')
    expect(html).toContain('bg-red-700')
    expect(html).toContain('Parking full')
  })

  it('renders the weather mini-card temperature, wind, UV, and OpenWeather image', async () => {
    const html = await renderBeachListItem({ beach, weather })

    expect(html).toContain('aria-label="Open beach weather details: Test Beach"')
    expect(html).toContain('src="https://openweathermap.org/img/wn/02d@2x.png"')
    expect(html).toContain('alt="Partly cloudy"')
    expect(html).toContain('26°')
    expect(html).toContain('14 km/h')
    expect(html).toContain('7 UV')
    expect(html).toContain('bg-amber-500')
  })

  it('disables the weather mini-card and renders fallback values without weather', async () => {
    const html = await renderBeachListItem({ beach })

    expect(html).toContain('disabled')
    expect(html).toContain('--°')
    expect(html).toContain('-- km/h')
    expect(html).toContain('0 UV')
  })

  it('emits the beach weather payload when clicking the weather mini-card button', () => {
    const onOpenWeather = vi.fn()
    const root = renderBeachListItemForInteraction(
      { beach, weather },
      { onOpenWeather }
    )
    const weatherButton = findElement(
      root,
      (node) => node.type === 'button' && node.props['aria-label'] === 'Open beach weather details: Test Beach'
    )

    expect(weatherButton).toBeDefined()

    click(weatherButton!)

    expect(onOpenWeather).toHaveBeenCalledOnce()
    expect(onOpenWeather).toHaveBeenCalledWith(weather)
  })
})
