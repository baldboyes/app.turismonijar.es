import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import BeachListItem from './BeachListItem.vue'
import type { Beach } from '~/types/beach'

const translations: Record<string, string> = {
  'map.view_beach': 'View beach',
  'playas_page.parking_full': 'Parking full'
}

const beach: Beach = {
  id: 'playa-test',
  title: 'Test Beach',
  state: 'verde',
  lat: 36.8,
  lng: -2.1
}

function t(key: string, params?: Record<string, string>) {
  return translations[key] ?? key
}

async function renderBeachListItem(props: { beach: Beach }) {
  vi.stubGlobal('useI18n', () => ({ t }))

  const app = createSSRApp({
    render: () => h(BeachListItem, props)
  })

  app.config.globalProperties.$t = t

  return renderToString(app)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('BeachListItem', () => {
  it('renders a neutral beach row with a beach-specific accessible label and flag icon', async () => {
    const html = await renderBeachListItem({ beach })

    expect(html).toContain('aria-label="View beach: Test Beach"')
    expect(html).toContain('fill="currentColor"')
    expect(html).toContain('stroke="white"')
    expect(html).toContain('var(--color-status-verde)')
    expect(html).toContain('Test Beach')
    expect(html).not.toContain('Green flag')
    expect(html).not.toContain('flagDotStyle')
  })

  it('renders parking full as alert text with the pulse dot', async () => {
    const html = await renderBeachListItem({
      beach: { ...beach, ocupacion: { state: 'red' } }
    })

    expect(html).toContain('role="alert"')
    expect(html).toContain('parking-alert-pulse')
    expect(html).toContain('Parking full')
    expect(html).toContain('viewbox="0 0 14 14"')
    expect(html).toContain('text-red-600')
  })

  it('does not render per-beach weather content', async () => {
    const html = await renderBeachListItem({ beach })

    expect(html).not.toContain('--°')
    expect(html).not.toContain('km/h')
    expect(html).not.toContain('UV')
  })
})
