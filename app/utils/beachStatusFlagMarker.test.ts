import { describe, expect, it } from 'vitest'
import {
  BEACH_STATUS_FLAG_PATH,
  BEACH_STATUS_JELLYFISH_MARKER_SRC,
  buildBeachCircleMarkerOptions,
  buildBeachStatusFlagMarkerOptions,
  buildBeachStatusFlagMarkerSvg
} from './beachStatusFlagMarker'

describe('buildBeachStatusFlagMarkerSvg', () => {
  it('renders the approved two-path flag marker using the status color', () => {
    const html = buildBeachStatusFlagMarkerSvg('amarilla')

    expect(html).toContain('width="30"')
    expect(html).toContain('height="30"')
    expect(html).toContain('viewBox="0 0 24 24"')
    expect(html).toContain('style="display:block;color:var(--color-status-amarilla)"')
    expect(html).toContain('stroke="white"')
    expect(html).toContain('stroke-width="2.5"')
    expect(html).toContain('fill="currentColor"')
    expect(html.match(new RegExp(BEACH_STATUS_FLAG_PATH.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))?.length).toBe(2)
  })

  it('renders the jellyfish asset for jellyfish warning markers', () => {
    const html = buildBeachStatusFlagMarkerSvg('amarilla_por_medusa')

    expect(html).toContain(`<img src="${BEACH_STATUS_JELLYFISH_MARKER_SRC}"`)
    expect(html).toContain('width="30"')
    expect(html).toContain('height="30"')
    expect(html).toContain('alt=""')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('object-fit:contain')
    expect(html).not.toContain(BEACH_STATUS_FLAG_PATH)
  })

  it('returns a tight svg element without leading or trailing whitespace', () => {
    const html = buildBeachStatusFlagMarkerSvg('verde')

    expect(html).toBe(html.trim())
    expect(html.startsWith('<svg')).toBe(true)
    expect(html.endsWith('</svg>')).toBe(true)
  })

  it('keeps Mapbox flag markers anchored outside normal document flow', () => {
    const element = {} as HTMLElement

    expect(buildBeachStatusFlagMarkerOptions(element)).toEqual({
      element,
      anchor: 'bottom',
      offset: [9, 5]
    })
  })

  it('keeps circular fallback markers center anchored', () => {
    const element = {} as HTMLElement

    expect(buildBeachCircleMarkerOptions(element)).toEqual({
      element,
      anchor: 'center'
    })
  })
})
