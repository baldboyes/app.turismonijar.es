<template>
  <div
    @click="$emit('click')"
    class="w-full text-left bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md active:scale-[0.99] transition-all duration-300 flex flex-col group select-none cursor-pointer"
  >
    <!-- Card Image Header -->
    <div class="relative w-full h-44 overflow-hidden bg-gray-100 shrink-0">
      <NuxtImg
        v-if="beach.src"
        :src="beach.src"
        :alt="beach.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <!-- Fallback when image is not present -->
      <div v-else class="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-800">
        <Waves class="w-12 h-12 opacity-30 animate-pulse" />
      </div>

      <!-- Flag Badge Overlay -->
      <div 
        v-if="beach.bandera" 
        class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1.5 backdrop-blur-sm"
        :class="getBadgeClass(beach.bandera)"
      >
        <span class="size-2 rounded-full shrink-0" :class="getDotColorClass(beach.bandera)"></span>
        {{ $t(beach.bandera.toLowerCase()) }}
      </div>

      <!-- Parking Badge Overlay -->
      <div 
        v-if="beach.ocupacion?.state === 'red'" 
        class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1 bg-red-600/95 text-white backdrop-blur-sm"
      >
        <AlertTriangle class="w-3 h-3" />
        <span>{{ $t('playas_page.parking_full') }}</span>
      </div>
    </div>

    <!-- Card Content -->
    <div class="p-4 flex-1 flex flex-col justify-between min-w-0">
      <div class="mb-3">
        <h3 class="font-extrabold text-primary text-base mb-1 group-hover:text-primary transition-colors">
          {{ beach.title }}
        </h3>
        
        <!-- Clean Description Text (Strips HTML tags & limits to 2 lines)
        <p class="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {{ cleanDescription }}
        </p>
        -->
      </div>

      <!-- Compact weather summary -->
      <div
        v-if="weather"
        class="mb-3 grid grid-cols-4 gap-1.5 rounded-2xl bg-slate-50 p-2 text-[11px] font-bold text-slate-600"
        :aria-label="$t('weather.beach_summary')"
      >
        <span class="flex items-center justify-center gap-1 whitespace-nowrap" :title="$t('weather.temperature')">
          <Thermometer class="size-3.5 text-orange-500" />
          {{ weather.current.temperature_2m.toFixed(0) }}°
        </span>
        <span class="flex items-center justify-center gap-1 whitespace-nowrap" :title="$t('weather.wind')">
          <Wind class="size-3.5 text-sky-600" />
          {{ weather.current.wind_speed_10m.toFixed(0) }} km/h
        </span>
        <span class="flex items-center justify-center gap-1 whitespace-nowrap" :title="$t('weather.sea')">
          <Waves class="size-3.5 text-cyan-600" />
          {{ weather.sea_surface_temperature.toFixed(0) }}°
        </span>
        <span
          class="flex items-center justify-center gap-1 whitespace-nowrap rounded-full px-1.5 py-0.5 font-extrabold"
          :class="currentUvClass"
          :title="$t('weather.uv_index')"
        >
          <Sun class="size-3.5" />
          {{ currentUv }} UV
        </span>
      </div>

      <!-- Quick characteristics badges 
      <div class="pt-3 border-t border-gray-50 flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-gray-600">
        <div v-if="parsedCharacteristics.arena" class="flex items-center gap-1">
          <span class="font-semibold text-gray-800">{{ $t('playas_page.sand') }}:</span>
          <span class="truncate max-w-[120px]">{{ parsedCharacteristics.arena }}</span>
        </div>
        <div v-if="parsedCharacteristics.longitud" class="flex items-center gap-1">
          <span class="font-semibold text-gray-800">{{ $t('playas_page.length') }}:</span>
          <span>{{ parsedCharacteristics.longitud }}</span>
        </div>
      </div>
      -->
      <!-- Footer action -->
      <div class="pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] font-bold text-primary cursor-pointer">
        <span>{{ $t('noticias_page.read_more') }}</span>
        <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, Sun, Thermometer, Waves, Wind, ArrowRight } from '@lucide/vue'
import type { Beach } from '~/types/beach'
import type { BeachWeatherItem } from '~/types/beachWeather'
import { getBeachStatusBadgeClass, getBeachStatusDotClass } from '~/utils/beachStatusStyles'

const props = defineProps<{
  beach: Beach
  weather?: BeachWeatherItem
}>()

defineEmits(['click'])

// Strip HTML tags and entities for clean preview text
const cleanDescription = computed(() => {
  if (!props.beach.description) return ''
  return props.beach.description
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
})

const parsedCharacteristics = computed(() => {
  if (!props.beach.caracteristicas) return {}
  const parts = props.beach.caracteristicas.split('<br />')
  const result: Record<string, string> = {}
  parts.forEach(part => {
    const colonIdx = part.indexOf(':')
    if (colonIdx !== -1) {
      const key = part.slice(0, colonIdx).trim().toLowerCase()
      const value = part.slice(colonIdx + 1).trim()
      if (key && value) {
        result[key] = value
      }
    }
  })
  return result
})

const currentUv = computed(() => {
  const weather = props.weather
  if (!weather) return 0

  const currentHour = weather.current.time?.slice(0, 13)
  const hourlyIndex = currentHour
    ? weather.hourly.time.findIndex((time) => time.slice(0, 13) === currentHour)
    : -1
  const value = hourlyIndex >= 0
    ? weather.hourly.uv_index?.[hourlyIndex]
    : weather.daily.uv_index_max?.[0]
  return typeof value === 'number' ? Math.round(value) : 0
})

const currentUvClass = computed(() => {
  const value = currentUv.value
  if (value <= 2) return 'bg-emerald-50 text-emerald-700'
  if (value <= 5) return 'bg-yellow-50 text-yellow-700'
  if (value <= 7) return 'bg-amber-50 text-amber-700'
  if (value <= 10) return 'bg-red-50 text-red-700'
  return 'bg-purple-50 text-purple-700'
})

function getBadgeClass(bandera: string) {
  return getBeachStatusBadgeClass(bandera)
}

function getDotColorClass(bandera: string) {
  return getBeachStatusDotClass(bandera)
}
</script>
