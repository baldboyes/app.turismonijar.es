<template>
  <div class="w-full h-56 rounded-3xl overflow-hidden relative">
    <div ref="mapContainer" class="w-full h-full"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const props = defineProps<{
  lat: number
  lng: number
  title: string
  bandera?: string
  ocupacionState?: string
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: mapboxgl.Map | null = null
let marker: mapboxgl.Marker | null = null
const timeoutIds = new Set<any>()

function safeSetTimeout(fn: () => void, delay: number) {
  const id = setTimeout(() => {
    timeoutIds.delete(id)
    fn()
  }, delay)
  timeoutIds.add(id)
  return id
}

mapboxgl.accessToken = 'pk.eyJ1IjoiYmFsZGJveSIsImEiOiJhMzBzeklzIn0.buJ1PP9-a9JkqNWGHW-H0g'

function getColorByState(state?: string) {
  if (!state) return '#6c757d'
  switch (state.toLowerCase()) {
    case 'verde': return '#28a745'
    case 'amarilla': return '#ffc107'
    case 'amarilla_por_medusa': return '#ff8c00'
    case 'roja': return '#dc3545'
    default: return '#6c757d'
  }
}

function createFlagMarker(state?: string, isFull?: boolean) {
  const el = document.createElement('div')
  if (!state) {
    // Return standard colored circle marker for beaches without a monitored flag
    el.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" fill="#059669" stroke="white" stroke-width="2" shadow="0 2px 4px rgba(0,0,0,0.2)"/>
        <circle cx="12" cy="12" r="5" fill="#ffffff"/>
      </svg>
    `
    el.style.cursor = 'pointer'
    if (isFull) {
      appendRedDot(el)
    }
    return el
  }

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

function initMap() {
  if (!mapContainer.value) return

  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/baldboy/cjuk2ftdd1n5g1gnvgmegm33a',
    center: [props.lng, props.lat],
    zoom: 14,
    attributionControl: false
  })

  // Add navigation controls (zoom only)
  map.addControl(new mapboxgl.NavigationControl({
    showCompass: false
  }), 'top-right')

  map.on('load', () => {
    if (!map) return

    // Create custom marker
    const isFull = props.ocupacionState === 'red'
    const markerElement = createFlagMarker(props.bandera, isFull)
    
    marker = new mapboxgl.Marker(markerElement)
      .setLngLat([props.lng, props.lat])
      .addTo(map)

    // Trigger map resize immediately and after animations/transitions
    map.resize()
    safeSetTimeout(() => {
      map?.resize()
    }, 100)
    safeSetTimeout(() => {
      map?.resize()
    }, 500)
  })
}

function onResize() {
  if (map) {
    map.resize()
  }
}

onMounted(() => {
  initMap()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  // Clear all pending timeouts to prevent memory leaks or errors
  timeoutIds.forEach(id => clearTimeout(id))
  timeoutIds.clear()

  window.removeEventListener('resize', onResize)
  if (marker) {
    marker.remove()
    marker = null
  }
  if (map) {
    map.remove()
    map = null
  }
})

// Watch for coordinate changes and fly to new location
watch(() => [props.lat, props.lng], () => {
  if (map) {
    map.flyTo({
      center: [props.lng, props.lat],
      zoom: 14,
      duration: 1000
    })
    
    if (marker) {
      marker.setLngLat([props.lng, props.lat])
    }
  }
})

// Watch for flag status or parking occupancy changes to update marker
watch(() => [props.bandera, props.ocupacionState], () => {
  if (map) {
    if (marker) {
      marker.remove()
    }
    const isFull = props.ocupacionState === 'red'
    const markerElement = createFlagMarker(props.bandera, isFull)
    marker = new mapboxgl.Marker(markerElement)
      .setLngLat([props.lng, props.lat])
      .addTo(map)
  }
})
</script>

<style scoped>
/* Parking full pulsing dot style */
:deep(.parking-full-dot) {
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
  z-index: 10;
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
