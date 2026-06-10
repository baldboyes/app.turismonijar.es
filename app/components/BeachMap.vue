<template>
  <div class="w-full h-full">
    <div ref="mapContainer" class="w-full h-full"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useI18n, useLocalePath, useRouter } from '#imports'

import type { Beach } from '~/types/beach'

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
let map: mapboxgl.Map | null = null
const markers = new Map<number | string, mapboxgl.Marker>()
let animationFrameId: number | null = null

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

// Update or initialize markers
function updateMarkers() {
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
    const bgClass = getStatusBgClass(beach.state)
    const statusText = t(beach.state.toLowerCase())
    const popupStatus = t('map.flag_status', { status: statusText })
    
    const cleanDesc = beach.description
      ? beach.description.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
      : ''
    const truncateDesc = cleanDesc.length > 120 ? cleanDesc.slice(0, 120) + '...' : cleanDesc
    const linkUrl = localePath(`/playas/${beach.id}`)

    // Create popup matching popup styling in HTML
    const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(`
        <div class="beach-info p-1 text-left max-w-[200px]">
          <div class="beach-title font-bold text-gray-800 text-sm mb-1">${beach.title}</div>
          <div class="flex flex-wrap gap-1 mb-1.5">
            <div class="beach-status text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full text-white inline-block ${bgClass}">
              ${popupStatus}
            </div>
            ${isFull ? `
              <div class="parking-status text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-600 text-white inline-block shadow-sm">
                ${t('playas_page.parking_full')}
              </div>
            ` : ''}
          </div>
          ${truncateDesc ? `<p class="text-[11px] text-gray-500 leading-normal mb-2">${truncateDesc}</p>` : ''}
          <a href="${linkUrl}" class="beach-link inline-block text-[11px] font-bold text-emerald-600 hover:text-emerald-700 active:scale-[0.98] transition-all">
            ${t('map.view_beach')} →
          </a>
        </div>
      `)

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
  fitBounds()
}

function getStatusBgClass(state: string) {
  switch (state.toLowerCase()) {
    case 'verde': return 'bg-status-verde'
    case 'amarilla': return 'bg-status-amarilla text-gray-900' // Better contrast on bright yellow
    case 'amarilla_por_medusa': return 'bg-status-medusa'
    case 'roja': return 'bg-status-roja'
    default: return 'bg-gray-500'
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
  if (mapContainer.value) {
    map = new mapboxgl.Map({
      container: mapContainer.value,
      style: 'mapbox://styles/baldboy/cjuk2ftdd1n5g1gnvgmegm33a',
      center: [-2.0, 36.8],
      zoom: 11,
      attributionControl: false // Hide default attribution
    })



    map.on('load', () => {
      updateMarkers()
      // Force Mapbox resize immediately and after page transition (400ms)
      map?.resize()
      setTimeout(() => {
        map?.resize()
      }, 100)
      setTimeout(() => {
        map?.resize()
        fitBounds()
      }, 500)
    })

    window.addEventListener('resize', onResize)
    mapContainer.value.addEventListener('click', handlePopupLinkClick)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  if (mapContainer.value) {
    mapContainer.value.removeEventListener('click', handlePopupLinkClick)
  }
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
  if (map) {
    map.remove()
  }
})

function handlePopupLinkClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target && target.classList.contains('beach-link')) {
    e.preventDefault()
    const href = target.getAttribute('href')
    if (href) {
      router.push(href)
    }
  }
}

function onResize() {
  if (map) {
    setTimeout(() => {
      map?.resize()
    }, 100)
  }
}
</script>

<style>
/* Custom style for mapbox popups */
.mapboxgl-popup-content {
  padding: 12px 16px !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.12) !important;
  border: 1px solid #e5e7eb !important;
}

.mapboxgl-popup-close-button {
  top: 6px !important;
  right: 6px !important;
  color: #9ca3af !important;
  font-size: 16px !important;
  border-radius: 50% !important;
  width: 20px !important;
  height: 20px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border: none !important;
  background: transparent !important;
  cursor: pointer !important;
}

.mapboxgl-popup-close-button:hover {
  background-color: #f3f4f6 !important;
  color: #374151 !important;
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
