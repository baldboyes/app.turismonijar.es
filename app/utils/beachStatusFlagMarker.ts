import { getBeachStatusCssColor } from './beachStatusStyles'

export const BEACH_STATUS_FLAG_PATH = 'M19.27,4.68a1.79,1.79,0,0,0-1.6-.25,7.53,7.53,0,0,1-2.17.28,8.54,8.54,0,0,1-3.13-.78A10.15,10.15,0,0,0,8.5,3c-2.89,0-4,1-4.2,1.14a1,1,0,0,0-.3.72V20a1,1,0,0,0,2,0V15.7a6.28,6.28,0,0,1,2.5-.41,8.54,8.54,0,0,1,3.13.78A10.15,10.15,0,0,0,15.5,17,7.66,7.66,0,0,0,19,16.3a1.74,1.74,0,0,0,1-1.55V6.11A1.77,1.77,0,0,0,19.27,4.68Z'
export const BEACH_STATUS_JELLYFISH_MARKER_SRC = '/banderas/estados/jellyfish.svg'

export function buildBeachStatusFlagMarkerSvg(status?: string, size = 30) {
  if (status === 'amarilla_por_medusa') {
    return `<img src="${BEACH_STATUS_JELLYFISH_MARKER_SRC}" width="${size}" height="${size}" alt="" aria-hidden="true" style="display:block;width:${size}px;height:${size}px;object-fit:contain"/>`
  }

  const color = getBeachStatusCssColor(status)

  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" style="display:block;color:${color}"><path fill="none" stroke="white" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" d="${BEACH_STATUS_FLAG_PATH}"/><path fill="currentColor" d="${BEACH_STATUS_FLAG_PATH}"/></svg>`
}

export function buildBeachStatusFlagMarkerOptions(element: HTMLElement) {
  return {
    element,
    anchor: 'bottom' as const,
    offset: [9, 5] as [number, number]
  }
}

export function buildBeachCircleMarkerOptions(element: HTMLElement) {
  return {
    element,
    anchor: 'center' as const
  }
}
