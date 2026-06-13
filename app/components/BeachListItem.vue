<template>
  <div
    class="w-full bg-white hover:bg-gray-50 active:bg-gray-100 rounded-2xl border border-gray-100 transition-all"
  >
    <button
      type="button"
      class="w-full p-2 text-left"
      @click="$emit('select', beach)"
    >
      <div class="flex items-center justify-between w-full min-w-0 gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <span
            class="size-4 rounded-full flex-shrink-0"
            :class="getStatusColorClass(beach.state)"
          />
          <span class="font-semibold text-sm text-gray-700 truncate">{{ beach.title }}</span>
        </div>
        <div
          v-if="beach.ocupacion?.state === 'red'"
          class="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider shrink-0 border border-red-100/50"
        >
          <AlertTriangle class="w-3 h-3" />
          <span>{{ $t('playas_page.parking_full') }}</span>
        </div>
      </div>
    </button>

    <div
      v-if="weather"
      class="mx-2 mb-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2"
    >
      <div class="flex min-w-0 flex-1 items-center gap-3 text-[11px] font-semibold text-slate-600">
        <span class="flex items-center gap-1 whitespace-nowrap">
          <Thermometer class="size-3.5 text-orange-500" />
          {{ weather.current.temperature_2m.toFixed(0) }}°
        </span>
        <span class="flex items-center gap-1 whitespace-nowrap">
          <Wind class="size-3.5 text-sky-600" />
          {{ weather.current.wind_speed_10m.toFixed(0) }} km/h
        </span>
        <span
          v-if="weather.sea_surface_temperature !== undefined"
          class="flex items-center gap-1 whitespace-nowrap"
        >
          <Waves class="size-3.5 text-cyan-600" />
          {{ weather.sea_surface_temperature.toFixed(0) }}°
        </span>
        <span
          class="flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 font-extrabold"
          :class="currentUvClass"
        >
          <Sun class="size-3.5" />
          {{ currentUv }} UV
        </span>
      </div>

      <button
        type="button"
        class="shrink-0 rounded-full px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 transition-colors hover:bg-emerald-50"
        :aria-label="t('weather.open_beach_details', { beach: beach.title })"
        @click.stop="$emit('open-weather', weather)"
      >
        {{ $t('weather.details') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, Sun, Thermometer, Waves, Wind } from '@lucide/vue'
import type { Beach } from '~/types/beach'
import type { BeachWeatherItem } from '~/types/beachWeather'

const props = defineProps<{
  beach: Beach
  weather?: BeachWeatherItem
}>()

defineEmits(['select', 'open-weather'])

const { t } = useI18n()

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

function getStatusText(state: string) {
  const s = state.toLowerCase()
  if (s === 'verde') return t('verde')
  if (s === 'amarilla') return t('amarilla')
  if (s === 'amarilla_por_medusa') return t('amarilla_por_medusa')
  if (s === 'roja') return t('roja')
  return s
}

function getStatusColorClass(state: string) {
  const s = state.toLowerCase()
  if (s === 'verde') return 'bg-status-verde'
  if (s === 'amarilla') return 'bg-status-amarilla text-gray-900'
  if (s === 'amarilla_por_medusa') return 'bg-status-medusa'
  if (s === 'roja') return 'bg-status-roja'
  return 'bg-gray-500'
}

function getFlagIconUrl(state: string) {
  const s = state.toLowerCase()
  if (s === 'verde') return '/banderas/estados/verde_.svg'
  if (s === 'amarilla') return '/banderas/estados/amarilla_.svg'
  if (s === 'amarilla_por_medusa') return '/banderas/estados/amarilla_por_medusa_.svg'
  if (s === 'roja') return '/banderas/estados/roja_.svg'
  return '/banderas/estados/verde_.svg'
}
</script>
