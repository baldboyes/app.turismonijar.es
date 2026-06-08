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
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: mapboxgl.Map | null = null
let marker: mapboxgl.Marker | null = null

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

function createFlagMarker(state?: string) {
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
      return el
  }

  el.style.width = '30px'
  el.style.height = '30px'
  el.style.backgroundImage = `url('${svgPath}')`
  el.style.backgroundSize = 'contain'
  el.style.backgroundRepeat = 'no-repeat'
  el.style.cursor = 'pointer'

  return el
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
    const markerElement = createFlagMarker(props.bandera)
    
    marker = new mapboxgl.Marker(markerElement)
      .setLngLat([props.lng, props.lat])
      .addTo(map)

    // Trigger map resize immediately and after animations/transitions
    map.resize()
    setTimeout(() => {
      map?.resize()
    }, 100)
    setTimeout(() => {
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
  window.removeEventListener('resize', onResize)
  if (marker) {
    marker.remove()
  }
  if (map) {
    map.remove()
  }
})

// Watch for coordinate changes and fly to new location
watch(() => [props.lat, props.lng], ([newLat, newLng]) => {
  if (map) {
    map.flyTo({
      center: [newLng, newLat],
      zoom: 14,
      duration: 1000
    })
    
    if (marker) {
      marker.setLngLat([newLng, newLat])
    }
  }
})
</script>
