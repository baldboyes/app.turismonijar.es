<template>
  <div class="w-full h-full">
    <div ref="mapContainer" class="w-full h-full"></div>
  </div>

  <Teleport to="body">
    <div
      v-if="selectedWeather"
      class="fixed inset-0 z-[20000] h-screen w-screen overflow-y-auto text-white"
      @click="closeWeather"
    >
      <WeatherBackground
        :weather-state="selectedWeatherState"
        :is-day="selectedWeather.current.is_day === 1"
        :is-fixed="true"
      />
      <TiempoDetalleModal
        :weather-data="selectedWeather"
        :title="selectedWeather.nombre"
        class="relative z-10"
        @close="closeWeather"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useI18n, useLocalePath, useRouter } from '#imports'

import type { Beach } from '~/types/beach'
import type { BeachWeatherItem } from '~/types/beachWeather'
import { useBeachWeather } from '~/composables/useBeachWeather'
import type { WeatherState } from '~/composables/useWeather'
import TiempoDetalleModal from './TiempoDetalleModal.vue'
import { buildBeachPopupHtml, shouldFitBoundsForWeatherRefresh } from './BeachMap.popup'

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()

const props = withDefaults(defineProps<{
  beaches: Beach[]
  selectedBeachId?: number | string | null
  drawerState?: 'peek' | 'mid' | 'full'
  isProvisional?: boolean
}>(), {
  drawerState: 'peek',
  isProvisional: false
})

const emit = defineEmits(['marker-click', 'deselect'])

const mapContainer = ref<HTMLElement | null>(null)
const selectedWeather = ref<BeachWeatherItem | null>(null)
const { fetchBeachWeather, getBeachWeather, beachesWeather } = useBeachWeather()
let map: mapboxgl.Map | null = null
const markers = new Map<number | string, mapboxgl.Marker>()
let animationFrameId: number | null = null
const timeoutIds = new Set<any>()

const selectedWeatherState = computed<WeatherState>(() => {
  const code = selectedWeather.value?.current.weather_code
  if (code === undefined || code === null) return 'sunny'

  if (code === 0 || code === 1) return 'sunny'
  if (code === 2 || code === 3 || code === 45 || code === 48) return 'cloudy'
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) return 'rainy'
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'snowy'
  return 'sunny'
})

function safeSetTimeout(fn: () => void, delay: number) {
  const id = setTimeout(() => {
    timeoutIds.delete(id)
    fn()
  }, delay)
  timeoutIds.add(id)
  return id
}

mapboxgl.accessToken = 'pk.eyJ1IjoiYmFsZGJveSIsImEiOiJhMzBzeklzIn0.buJ1PP9-a9JkqNWGHW-H0g'

// Helper to get color hex
function getColorByState(state: string) {
  switch (state.toLowerCase()) {
    case 'verde': return '#28a745'
    case 'amarilla': return '#ffc107'
    case 'amarilla_por_medusa': return '#ff8c00'
    case 'roja': return '#dc3545'
    default: return '#6c757d'
  }
}

// Helper to create custom HTML element for marker
function createFlagMarker(state: string, isFull?: boolean) {
  const el = document.createElement('div')
  const stateLower = state.toLowerCase()
  let svgPath = ''

  switch (stateLower) {
    case 'verde':
      svgPath = '/banderas/estados/verde_.svg'
      break
    case 'amarilla':
      svgPath = '/banderas/estados/amarilla_.svg'
      break
    case 'amarilla_por_medusa':
      svgPath = '/banderas/estados/amarilla_por_medusa_.svg'
      break
    case 'roja':
      svgPath = '/banderas/estados/roja_.svg'
      break
    default:
      const color = getColorByState(state)
      el.innerHTML = `
        <svg width="30" height="30" viewBox="0 0 30 30">
          <circle cx="15" cy="15" r="12" fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="15" cy="15" r="8" fill="${color}" opacity="0.8"/>
        </svg>
      `
      el.style.cursor = 'pointer'
      if (isFull) {
        appendRedDot(el)
      }
      return el
  }

  el.style.width = '30px'
  el.style.height = '30px'
  el.style.backgroundImage = `url('${svgPath}')`
  el.style.backgroundSize = 'contain'
  el.style.backgroundRepeat = 'no-repeat'
  el.style.cursor = 'pointer'

  if (isFull) {
    appendRedDot(el)
  }

  return el
}

function appendRedDot(parent: HTMLElement) {
  const dot = document.createElement('div')
  dot.className = 'parking-full-dot'
  parent.appendChild(dot)
}

function closeWeather() {
  selectedWeather.value = null
}

// Update or initialize markers
function updateMarkers(shouldFitBounds = true) {
  if (!map) return

  // Remove old markers
  markers.forEach(marker => marker.remove())
  markers.clear()

  // Add new markers
  props.beaches.forEach(beach => {
    const isFull = beach.ocupacion?.state === 'red'
    const markerElement = createFlagMarker(beach.state, isFull)
    if (props.isProvisional) {
      markerElement.style.opacity = '0.65'
      markerElement.style.transition = 'opacity 0.3s ease'
    }
    const statusText = t(beach.state.toLowerCase())
    const popupStatus = statusText
    const beachWeather = getBeachWeather(beach.id)
    const linkUrl = localePath(`/playas/${beach.id}`)

    // Create popup matching popup styling in HTML
    const popup = new mapboxgl.Popup({ offset: 25, maxWidth: '300px' })
      .setHTML(buildBeachPopupHtml({
        beach,
        beachWeather,
        linkUrl,
        popupStatus,
        viewBeachText: t('map.view_beach'),
        viewWeatherText: t('weather.view_weather'),
        parkingFullText: t('playas_page.parking_full')
      }))

    const marker = new mapboxgl.Marker(markerElement)
      .setLngLat([beach.lng, beach.lat])
      .setPopup(popup)
      .addTo(map!)

    popup.on('close', () => {
      if (props.selectedBeachId === beach.id) {
        emit('deselect')
      }
    })

    // Forward click events to parent
    markerElement.addEventListener('click', (e) => {
      e.stopPropagation()
      emit('marker-click', beach)
    })

    markers.set(beach.id, marker)
  })

  // Fit bounds to all markers if there are any
  if (shouldFitBounds) {
    fitBounds()
  }
}

function fitBounds() {
  if (!map || props.beaches.length === 0) return

  const bounds = new mapboxgl.LngLatBounds()
  props.beaches.forEach(beach => {
    bounds.extend([beach.lng, beach.lat])
  })

  let bottomPadding = 280
  if (props.drawerState === 'mid') {
    if (import.meta.client) {
      bottomPadding = window.innerHeight / 2 + 20
    } else {
      bottomPadding = 420
    }
  } else if (props.drawerState === 'full') {
    bottomPadding = 60
  }

  map.fitBounds(bounds, {
    padding: {
      top: 180,
      bottom: bottomPadding,
      left: 45,
      right: 45
    },
    animate: true,
    duration: 800
  })
}

// Expose zoom to method
function focusOnBeach(beach: Beach) {
  if (!map) return

  map.flyTo({
    center: [beach.lng, beach.lat],
    zoom: 14.5,
    duration: 1000
  })

  // Close all other popups
  markers.forEach((m, id) => {
    if (id !== beach.id) {
      const p = m.getPopup()
      if (p && p.isOpen()) {
        p.remove()
      }
    }
  })

  const marker = markers.get(beach.id)
  if (marker) {
    // Open the popup
    const popup = marker.getPopup()
    if (popup && !popup.isOpen()) {
      marker.togglePopup()
    }
  }
}

function updateBottomPadding(translateY: number) {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }

  animationFrameId = requestAnimationFrame(() => {
    if (!map || props.beaches.length === 0) return

    const windowHeight = window.innerHeight
    const midY = windowHeight / 2
    const maxT = windowHeight - 140

    let bottomPadding = 280

    if (translateY <= 0) {
      bottomPadding = 60
    } else if (translateY < midY) {
      const t = translateY / midY
      const startPadding = 60
      const endPadding = midY + 20
      bottomPadding = startPadding + (endPadding - startPadding) * t
    } else {
      const range = maxT - midY
      if (range > 0) {
        const t = (translateY - midY) / range
        const startPadding = midY + 20
        const endPadding = 280
        bottomPadding = startPadding + (endPadding - startPadding) * t
      } else {
        bottomPadding = 280
      }
    }

    map.setPadding({
      top: 180,
      bottom: bottomPadding,
      left: 45,
      right: 45
    })
  })
}

// Expose functions to parent
defineExpose({
  focusOnBeach,
  fitBounds,
  updateBottomPadding
})

watch(() => props.beaches, () => {
  updateMarkers()
}, { deep: true })

watch(beachesWeather, () => {
  updateMarkers(shouldFitBoundsForWeatherRefresh())
})

watch(() => props.isProvisional, () => {
  updateMarkers()
})

watch(() => props.selectedBeachId, (newId) => {
  if (newId) {
    const beach = props.beaches.find(b => b.id === newId)
    if (beach) {
      focusOnBeach(beach)
    }
  }
})

watch(() => props.drawerState, () => {
  if (props.selectedBeachId) {
    const beach = props.beaches.find(b => b.id === props.selectedBeachId)
    if (beach) {
      focusOnBeach(beach)
      return
    }
  }
  fitBounds()
})

onMounted(() => {
  fetchBeachWeather()

  if (mapContainer.value) {
    map = new mapboxgl.Map({
      container: mapContainer.value,
      style: 'mapbox://styles/baldboy/cjuk2ftdd1n5g1gnvgmegm33a',
      center: [-2.0, 36.8],
      zoom: 11,
      attributionControl: false // Hide default attribution
    })



    map.on('load', () => {
      if (!map) return
      updateMarkers()
      // Force Mapbox resize immediately and after page transition (400ms)
      map.resize()
      safeSetTimeout(() => {
        map?.resize()
      }, 100)
      safeSetTimeout(() => {
        map?.resize()
        fitBounds()
      }, 500)
    })

    window.addEventListener('resize', onResize)
    mapContainer.value.addEventListener('click', handlePopupLinkClick)
  }
})

onUnmounted(() => {
  // Clear all pending timeouts to prevent memory leaks or errors
  timeoutIds.forEach(id => clearTimeout(id))
  timeoutIds.clear()

  window.removeEventListener('resize', onResize)
  if (mapContainer.value) {
    mapContainer.value.removeEventListener('click', handlePopupLinkClick)
  }
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }

  // Explicitly remove all markers to break references and event listeners
  markers.forEach(marker => marker.remove())
  markers.clear()

  if (map) {
    map.remove()
    map = null
  }
})

function handlePopupLinkClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  const beachLink = target.closest<HTMLAnchorElement>('.beach-link')
  if (beachLink) {
    e.preventDefault()
    const href = beachLink.getAttribute('href')
    if (href) {
      router.push(href)
    }
    return
  }

  const weatherLink = target.closest<HTMLButtonElement>('.beach-weather-link')
  if (weatherLink) {
    e.preventDefault()
    const beachId = weatherLink.dataset.beachId
    if (!beachId) return

    const weather = getBeachWeather(beachId)
    if (weather) {
      selectedWeather.value = weather
    }
  }
}

function onResize() {
  if (map) {
    safeSetTimeout(() => {
      map?.resize()
    }, 100)
  }
}
</script>

<style>
/* Custom style for mapbox popups */
.mapboxgl-popup-content {
  padding: 0 !important;
  border-radius: 30px !important;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.12) !important;
  border: 0 !important;
}

.mapboxgl-popup {
  max-width: 300px !important;
}

.mapboxgl-popup-close-button {
    top: -8px !important;
    right: -8px !important;
    margin: 0;
    padding: 0;
    color: #232323 !important;
    font-size: 20px !important;
    border-radius: 50% !important;
    width: 35px !important;
    height: 35px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border: none !important;
    background: #fff !important;
    cursor: pointer !important;
}

.mapboxgl-popup-close-button:hover {
  background-color: #f3f4f6 !important;
  color: #374151 !important;
}

@media (max-width: 767px) {
  .mapboxgl-popup-close-button {
    display: none !important;
  }
}

.mapboxgl-popup-content .beach-popup-action {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  border: 0 !important;
  border-radius: 9999px !important;
  background-color: hsl(var(--primary)) !important;
  color: hsl(var(--primary-foreground)) !important;
  padding: 0.375rem 0.75rem !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  line-height: 1 !important;
  text-decoration: none !important;
  appearance: none !important;
  box-shadow: none !important;
}

.mapboxgl-popup-content .beach-popup-action:disabled,
.mapboxgl-popup-content .beach-popup-action[aria-disabled="true"] {
  cursor: not-allowed !important;
  opacity: 0.5 !important;
}

/* Parking full pulsing dot style */
.parking-full-dot {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 15px;
  height: 15px;
  background-color: #ef4444;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  animation: pulse-dot 1.8s infinite ease-in-out;
}

@keyframes pulse-dot {
  0% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  70% {
    transform: scale(1.15);
    box-shadow: 0 0 0 5px rgba(239, 68, 68, 0);
  }
  100% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}
</style>
