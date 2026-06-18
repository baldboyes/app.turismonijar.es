<template>
  <div class="flex w-full items-stretch gap-2 rounded-2xl">
    <button
      type="button"
      class="box-border flex min-w-0 flex-1 appearance-none items-stretch gap-2 overflow-hidden !rounded-2xl border-0 p-2 text-left text-white shadow-sm transition-all hover:brightness-105"
      :class="getCardClass(beach.state)"
      :aria-label="`${t('map.view_beach')}: ${beach.title}`"
      @click="$emit('select', beach)"
    >
      <span class="flex min-w-0 flex-1 flex-col gap-1 rounded-xl px-3 py-2 space-y-0">
        <span class="truncate text-sm font-bold">{{ beach.title }}</span>
        <span class="flex min-w-0 items-center gap-2.5 text-[11px] font-bold uppercase tracking-wider text-white/85">
          <span class="truncate">{{ getStatusText(beach.state) }}</span>
          <span
            v-if="isParkingFull"
            class="relative inline-flex shrink-0 items-center gap-1 rounded-full bg-red-700 px-3 py-1 text-[10px] font-extrabold leading-none text-white shadow-sm ring-1 ring-white"
            role="alert"
          >
            <span class="parking-alert-pulse scale-70" aria-hidden="true" />
            <AlertTriangle class="size-3" />
            {{ $t('playas_page.parking_full') }}
          </span>
        </span>
      </span>
    </button>

    <button
      type="button"
      class="flex w-28 shrink-0 appearance-none flex-col justify-center overflow-hidden !rounded-2xl bg-sky-500 !px-2 py-1.5 text-white transition-colors hover:bg-sky-600 space-y-0"
      :aria-label="t('weather.open_beach_details', { beach: beach.title })"
      :disabled="!props.weather"
      @click.stop="openWeatherDetails"
    >
      <span class="flex items-center justify-center gap-1.5 text-sm font-extrabold leading-none">
        <img :src="weatherImage" :alt="weatherDescription" class="size-8 shrink-0 object-contain" />
        <span>{{ weatherTemperature }}</span>
      </span>
      <span class="-mt-1 flex items-center gap-1 text-[9px] font-bold leading-none">
        <span class="flex items-center gap-0.5">
          <Wind class="size-2.5" />
          {{ weatherWind }}
        </span>
        <span class="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-extrabold text-white" :class="currentUvClass">
          <Sun class="size-2.5" />
          {{ currentUv }} UV
        </span>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, Sun, Wind } from '@lucide/vue'
import type { Beach } from '~/types/beach'
import type { BeachWeatherItem } from '~/types/beachWeather'
import { getBeachStatusCardClass } from '~/utils/beachStatusStyles'

const props = defineProps<{
  beach: Beach
  weather?: BeachWeatherItem
}>()

const emit = defineEmits(['select', 'open-weather'])

const { t } = useI18n()

const isParkingFull = computed(() => props.beach.ocupacion?.state === 'red')

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
  if (value <= 2) return 'bg-emerald-600'
  if (value <= 5) return 'bg-yellow-500'
  if (value <= 7) return 'bg-amber-500'
  if (value <= 10) return 'bg-red-600'
  return 'bg-purple-700'
})

const weatherTemperature = computed(() => {
  if (!props.weather) return '--°'
  return `${props.weather.current.temperature_2m.toFixed(0)}°`
})

const weatherWind = computed(() => {
  if (!props.weather) return '-- km/h'
  return `${props.weather.current.wind_speed_10m.toFixed(0)} km/h`
})

const weatherImage = computed(() => {
  const code = props.weather?.current.weather_code
  const isDay = props.weather?.current.is_day !== 0
  return getWeatherImage(code, isDay)
})

const weatherDescription = computed(() => {
  const code = props.weather?.current.weather_code
  return t(getWeatherDescriptionKey(code))
})

function openWeatherDetails() {
  emitBeachWeather(emit, props.weather)
}

function getStatusText(state: string) {
  const s = state.toLowerCase()
  if (s === 'verde') return t('verde')
  if (s === 'amarilla') return t('amarilla')
  if (s === 'amarilla_por_medusa') return t('amarilla_por_medusa')
  if (s === 'roja') return t('roja')
  return s
}

function getCardClass(state: string) {
  return getBeachStatusCardClass(state)
}

function getWeatherImage(code?: number, isDay = true) {
  const suffix = isDay ? 'd' : 'n'
  const icon = getWeatherIconCode(code)
  return `https://openweathermap.org/img/wn/${icon}${suffix}@2x.png`
}

function getWeatherIconCode(code?: number) {
  if (code === 0 || code === 1) return '01'
  if (code === 2) return '02'
  if (code === 3) return '03'
  if (code === 45 || code === 48) return '50'
  if (code === 51 || code === 53 || code === 55 || code === 56 || code === 57) return '09'
  if (code === 61 || code === 63 || code === 65 || code === 66 || code === 67) return '10'
  if (code === 71 || code === 73 || code === 75 || code === 77 || code === 85 || code === 86) return '13'
  if (code === 80 || code === 81 || code === 82) return '09'
  if (code === 95 || code === 96 || code === 99) return '11'
  return '01'
}

function getWeatherDescriptionKey(code?: number) {
  if (code === 0) return 'weather.sunny'
  if (code === 1) return 'weather.mainly_sunny'
  if (code === 2) return 'weather.partly_cloudy'
  if (code === 3) return 'weather.cloudy'
  if (code === 45) return 'weather.foggy'
  if (code === 48) return 'weather.rime_fog'
  if (code === 51) return 'weather.light_drizzle'
  if (code === 53) return 'weather.drizzle'
  if (code === 55) return 'weather.heavy_drizzle'
  if (code === 56) return 'weather.light_freezing_drizzle'
  if (code === 57) return 'weather.freezing_drizzle'
  if (code === 61) return 'weather.light_rain'
  if (code === 63) return 'weather.rain'
  if (code === 65) return 'weather.heavy_rain'
  if (code === 66) return 'weather.light_freezing_rain'
  if (code === 67) return 'weather.freezing_rain'
  if (code === 71) return 'weather.light_snow'
  if (code === 73) return 'weather.snow'
  if (code === 75) return 'weather.heavy_snow'
  if (code === 77) return 'weather.snow_grains'
  if (code === 80) return 'weather.light_showers'
  if (code === 81) return 'weather.showers'
  if (code === 82) return 'weather.heavy_showers'
  if (code === 85) return 'weather.light_snow_showers'
  if (code === 86) return 'weather.snow_showers'
  if (code === 95) return 'weather.thunderstorm'
  if (code === 96) return 'weather.light_thunderstorms_hail'
  if (code === 99) return 'weather.thunderstorm_hail'
  return 'weather.sunny'
}

</script>

<script lang="ts">
import type { BeachWeatherItem } from '~/types/beachWeather'

export function emitBeachWeather(
  emit: (event: 'open-weather', weather: BeachWeatherItem) => void,
  weather?: BeachWeatherItem
) {
  if (!weather) return
  emit('open-weather', weather)
}
</script>

<style>
.parking-alert-pulse {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 15px;
  height: 15px;
  background-color: #ef4444;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
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
