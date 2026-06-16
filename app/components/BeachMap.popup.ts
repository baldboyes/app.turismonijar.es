import type { Beach } from '~/types/beach'
import type { BeachWeatherItem } from '~/types/beachWeather'

export function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function escapeCssUrl(value: unknown) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, '\\27 ')
    .replace(/"/g, '\\22 ')
    .replace(/\(/g, '\\28 ')
    .replace(/\)/g, '\\29 ')
    .replace(/\n|\r|\f/g, '')
}

export function getStatusBgClass(state: string) {
  switch (state.toLowerCase()) {
    case 'verde': return 'bg-status-verde'
    case 'amarilla': return 'bg-status-amarilla text-gray-900'
    case 'amarilla_por_medusa': return 'bg-status-medusa'
    case 'roja': return 'bg-status-roja'
    default: return 'bg-gray-500'
  }
}

export function getCurrentUv(weather?: BeachWeatherItem) {
  if (!weather) return null

  const currentHour = weather.current.time?.slice(0, 13)
  const hourlyIndex = currentHour
    ? weather.hourly.time.findIndex(time => time.slice(0, 13) === currentHour)
    : -1
  const value = hourlyIndex >= 0
    ? weather.hourly.uv_index?.[hourlyIndex]
    : weather.daily.uv_index_max?.[0]

  return typeof value === 'number' ? Math.round(value) : null
}

export function getUvBadgeClass(value: number | null) {
  if (value === null) return 'bg-slate-500'
  if (value <= 2) return 'bg-emerald-600'
  if (value <= 5) return 'bg-yellow-500'
  if (value <= 7) return 'bg-amber-500'
  if (value <= 10) return 'bg-red-600'
  return 'bg-purple-700'
}

export function formatPopupWeather(weather?: BeachWeatherItem) {
  if (!weather) return ''

  const temperature = `${weather.current.temperature_2m.toFixed(0)}°`
  const wind = `${weather.current.wind_speed_10m.toFixed(0)} km/h`
  const uv = getCurrentUv(weather)
  const uvBadgeClass = getUvBadgeClass(uv)

  return `
    <div class="mt-1.5 mb-2 flex items-center gap-3 rounded-xl px-2 py-1.5 text-[11px] font-bold text-white justify-between">
      <span class="inline-flex items-center gap-0.5">${lucideThermometerIcon()} ${escapeHtml(temperature)}</span>
      <span class="inline-flex items-center gap-0.5">${lucideWindIcon()} ${escapeHtml(wind)}</span>
      <span class="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-extrabold text-white ${uvBadgeClass}">${lucideSunIcon()} UV ${escapeHtml(uv ?? '--')}</span>
    </div>
  `
}

function lucideSunIcon() {
  return '<svg class="size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>'
}

function lucideThermometerIcon() {
  return '<svg class="size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg>'
}

function lucideWindIcon() {
  return '<svg class="size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/></svg>'
}

export function shouldFitBoundsForWeatherRefresh() {
  return false
}

export type BeachPopupHtmlInput = {
  beach: Pick<Beach, 'id' | 'title' | 'state' | 'src'> & { ocupacion?: Beach['ocupacion'] }
  beachWeather?: BeachWeatherItem
  linkUrl: string
  popupStatus: string
  viewBeachText: string
  viewWeatherText: string
  parkingFullText: string
}

export function buildBeachPopupHtml({
  beach,
  beachWeather,
  linkUrl,
  popupStatus,
  viewBeachText,
  viewWeatherText,
  parkingFullText
}: BeachPopupHtmlInput) {
  const isFull = beach.ocupacion?.state === 'red'
  const bgClass = getStatusBgClass(beach.state)
  const escapedBeachTitle = escapeHtml(beach.title)
  const escapedBeachId = escapeHtml(beach.id)
  const escapedLinkUrl = escapeHtml(linkUrl)
  const escapedViewBeachText = escapeHtml(viewBeachText)
  const escapedViewWeatherText = escapeHtml(viewWeatherText)
  const escapedParkingFullText = escapeHtml(parkingFullText)
  const weatherButtonState = beachWeather ? '' : ' disabled aria-disabled="true"'
  const weatherButtonClass = beachWeather ? '' : ' opacity-50 cursor-not-allowed'
  const statusAlignmentClass = isFull ? 'justify-center' : 'justify-start'
  const backgroundStyle = beach.src
    ? ` style="background-image: linear-gradient(180deg, rgba(15, 23, 42, 0.48), rgba(15, 23, 42, 0.74)), url('${escapeCssUrl(beach.src)}');"`
    : ''

  return `
        <div class="beach-info overflow-hidden rounded-4xl border-6 border-white bg-slate-800 bg-cover bg-center p-4 text-left text-white shadow-xl space-y-4 max-w-[300px]"${backgroundStyle}>
          <div class="beach-title pr-4 font-bold text-white text-lg leading-tight mb-4 drop-shadow">${escapedBeachTitle}</div>
          <div class="flex items-center ${statusAlignmentClass} gap-1 mb-1.5">
            <div class="beach-status text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full text-white inline-block ${bgClass}">
              ${escapeHtml(popupStatus)}
            </div>
            ${isFull ? `
              <div class="parking-status text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-600 text-white inline-block shadow-sm">
                ${escapedParkingFullText}
              </div>
            ` : ''}
          </div>
          ${formatPopupWeather(beachWeather)}
          <div class="flex items-center gap-1.5 justify-between mt-5">
            <a href="${escapedLinkUrl}" class="beach-link beach-popup-action inline-flex items-center justify-center rounded-full !bg-primary px-3 py-1.5 text-[11px] font-bold !text-primary-foreground active:scale-[0.98] transition-all">
              ${escapedViewBeachText}
            </a>
            <button type="button" data-beach-id="${escapedBeachId}" class="beach-weather-link beach-popup-action inline-flex items-center justify-center rounded-full !bg-primary px-3 py-1.5 text-[11px] font-bold !text-primary-foreground active:scale-[0.98] transition-all${weatherButtonClass}"${weatherButtonState}>
              ${escapedViewWeatherText}
            </button>
          </div>
        </div>
      `
}
