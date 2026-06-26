<template>
  <div
    class="select-none weather-card text-white"
    :class="[
      isDetailOpen
        ? 'fixed inset-0 w-screen h-screen rounded-none z-[20000] cursor-default overflow-y-auto pb-safe'
        : 'fixed rounded-3xl w-fit h-26 cursor-pointer z-20 shadow-lg overflow-hidden',
      { 'theme-darker-boxes': isDarkerBoxes }
    ]"
    :style="isDetailOpen
      ? { top: '0px', left: '0px', width: '100vw', height: '100vh', borderRadius: '0px' }
      : fixedCardStyle"
    @click="!isDetailOpen && openDetail()"
  >
      <!-- Animated Dynamic Weather Background -->
      <WeatherBackground
        v-if="aggregateWeatherData"
        :weather-state="weatherState"
        :is-day="isDay"
        :is-fixed="showDetailsContent"
      />

      <!-- Loaded Summary Card Content (visible when closed) -->
      <div 
        v-if="aggregateWeatherData" 
        class="h-full w-full p-3 flex flex-col gap-1.5 justify-between transition-opacity duration-300"
        :class="isDetailOpen ? 'opacity-0 pointer-events-none absolute top-0 left-0 w-56 h-26' : 'opacity-100 relative z-10'"
      >
        <!-- Top Row Badges -->
        <div class="flex items-center gap-1 text-[10px] lg:text-[12px] font-semibold text-shadow-sm">
          <!-- Wind Badge -->
          <span class="bg-white/10 backdrop-blur-sm py-0.5 px-2 rounded-full flex items-center gap-1 whitespace-nowrap">
            <Wind class="w-3 h-3 text-white/90" />
            {{ windSpeed.toFixed(0) }} {{ WEATHER_UNITS.windSpeed }}
          </span>
          
          <!-- UV Badge -->
          <span class="bg-white/10 backdrop-blur-sm py-0.5 px-2 rounded-full flex items-center gap-1 whitespace-nowrap">
            <Circle 
              class="w-2.5 h-2.5 fill-current" 
              :class="{
                'text-emerald-400': uv <= 2,
                'text-yellow-400': uv >= 3 && uv <= 5,
                'text-amber-500': uv >= 6 && uv <= 7,
                'text-red-500': uv >= 8 && uv <= 10,
                'text-purple-400': uv >= 11
              }" 
            />
            {{ uv }} {{ WEATHER_UNITS.uvIndex }}
          </span>
          
          <!-- Humidity Badge -->
          <span class="bg-white/10 backdrop-blur-sm py-0.5 px-2 rounded-full flex items-center gap-1 whitespace-nowrap">
            <Droplet class="w-3 h-3 text-white/90" />
            {{ humidity.toFixed(0) }}{{ WEATHER_UNITS.percent }}
          </span>
        </div>

        <!-- Bottom Row: Icon + Temperature & Condition -->
        <div>
          <div class="flex items-center justify-between gap-2 text-shadow-md">
            <div class="flex items-center gap-0">
              <img 
                v-if="imgTiempo"
                :src="imgTiempo" 
                :alt="weatherDescription" 
                class="w-14 h-14 object-contain filter animate-float" 
              />
              <span class="text-4xl font-extrabold tracking-tight leading-none">
                {{ temperature.toFixed(0) }}°
              </span>
            </div>
            <span
              v-if="seaTemperature !== null"
              class="bg-white/10 backdrop-blur-sm py-1 px-2 rounded-2xl flex items-center gap-1 text-sm font-bold whitespace-nowrap"
            >
              <Waves class="w-4 h-4 text-white/90" />
              {{ seaTemperature.toFixed(0) }}°
            </span>
          </div>
          <div class="text-xs opacity-80 mt-1 text-shadow-sm select-none">
            <span v-if="isRefreshing">{{ t('weather.refreshing') }}</span>
            <span v-else-if="isError && lastUpdate">{{ t('weather.last_update', { time: formattedLastUpdate }) }}</span>
          </div>
        </div>
      </div>

      <!-- Loading Skeleton State (visible when closed and loading) -->
      <div 
        v-else-if="isLoading || !aggregateWeatherData" 
        class="h-full w-full p-3 bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse flex flex-col justify-between relative z-10"
      >
        <div class="flex items-center gap-1.5">
          <div class="h-5 w-16 bg-slate-300/60 rounded-full"></div>
          <div class="h-5 w-12 bg-slate-300/60 rounded-full"></div>
          <div class="h-5 w-12 bg-slate-300/60 rounded-full"></div>
        </div>
        <div class="flex items-center gap-2 pl-1 pb-1">
          <div class="w-12 h-12 bg-slate-300/60 rounded-full"></div>
          <div class="flex flex-col gap-1">
            <div class="h-7 w-12 bg-slate-300/60 rounded-lg"></div>
            <div class="h-3 w-16 bg-slate-300/60 rounded-md"></div>
          </div>
        </div>
      </div>

      <!-- Detailed Content (visible when open) -->
      <TiempoDetalleModal 
        v-if="showDetailsContent" 
        :weather-data="aggregateWeatherData ?? undefined"
        :is-refreshing="isRefreshing"
        :is-error="isError"
        :last-update="lastUpdate"
        @close="closeDetail" 
        class="relative z-10"
      />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Wind, Circle, Droplet, Waves } from '@lucide/vue'
import { useBeachWeather } from '~/composables/useBeachWeather'
import {
  getWeatherDescriptionKeyFromCode,
  getWeatherIconFromCode,
  useBeachWeatherAggregate
} from '~/composables/useBeachWeatherAggregate'
import { useI18n } from '#imports'
import TiempoDetalleModal from './TiempoDetalleModal.vue'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  position?: 'default' | 'split-map'
  externalDetail?: boolean
}>(), {
  position: 'default',
  externalDetail: false
})

const emit = defineEmits(['open-detail'])

const fixedCardStyle = computed(() => ({
  top: props.position === 'split-map'
    ? 'calc(var(--safe-area-inset-top, 0px) + 56px)'
    : 'calc(var(--safe-area-inset-top, 0px) + 16px)',
  left: props.position === 'split-map'
    ? 'calc(2.5rem + min(420px, 42vw) + 16px)'
    : '16px',
  width: '224px',
  height: '104px',
  borderRadius: '24px'
}))

const isDarkerBoxes = computed(() => {
  return isDay.value && (weatherState.value === 'cloudy' || weatherState.value === 'rainy')
})

// These compact meteorological symbols are locale-neutral domain units by design.
const WEATHER_UNITS = {
  windSpeed: 'km/h',
  uvIndex: 'UV',
  percent: '%'
} as const

const {
  beachesWeather,
  isLoading,
  isRefreshing,
  isError,
  lastUpdate,
  fetchBeachWeather
} = useBeachWeather()

const beachWeatherItems = computed(() => Object.values(beachesWeather.value))
const { aggregateWeatherData, aggregateWeatherCode, aggregateWeatherState } = useBeachWeatherAggregate(() => beachWeatherItems.value)

const isDay = computed(() => aggregateWeatherData.value?.current?.is_day === 1)
const temperature = computed(() => aggregateWeatherData.value?.current?.temperature_2m ?? 0)
const windSpeed = computed(() => aggregateWeatherData.value?.current?.wind_speed_10m ?? 0)
const humidity = computed(() => aggregateWeatherData.value?.current?.relative_humidity_2m ?? 0)
const seaTemperature = computed(() => {
  const value = aggregateWeatherData.value?.sea_surface_temperature ?? 0
  return value > 0 ? value : null
})
const uv = computed(() => {
  const currentHour = aggregateWeatherData.value?.current?.time?.slice(0, 13)
  const hourly = aggregateWeatherData.value?.hourly
  const hourlyIndex = currentHour && hourly?.time
    ? hourly.time.findIndex((time) => time.slice(0, 13) === currentHour)
    : -1
  const value = hourlyIndex >= 0
    ? hourly?.uv_index?.[hourlyIndex]
    : aggregateWeatherData.value?.daily?.uv_index_max?.[0]
  return typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : 0
})
const weatherState = aggregateWeatherState
const imgTiempo = computed(() => getWeatherIconFromCode(aggregateWeatherCode.value, isDay.value))
const weatherDescription = computed(() => {
  return t(getWeatherDescriptionKeyFromCode(aggregateWeatherCode.value))
})

const formattedLastUpdate = computed(() => {
  if (!lastUpdate.value) return ''
  const date = new Date(lastUpdate.value)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
})

const isDetailOpen = ref(false)
const showDetailsContent = ref(false)

function openDetail() {
  if (props.externalDetail) {
    emit('open-detail')
    return
  }

  if (!isLoading.value && aggregateWeatherData.value) {
    isDetailOpen.value = true
    setTimeout(() => {
      showDetailsContent.value = true
    }, 430)
  }
}

function closeDetail() {
  showDetailsContent.value = false
  isDetailOpen.value = false
}

onMounted(async () => {
  await fetchBeachWeather()
})
</script>

<style scoped>
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
  100% { transform: translateY(0px); }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

.weather-card {
  transition: top 0.42s cubic-bezier(0.16, 1, 0.3, 1),
              left 0.42s cubic-bezier(0.16, 1, 0.3, 1),
              width 0.42s cubic-bezier(0.16, 1, 0.3, 1),
              height 0.42s cubic-bezier(0.16, 1, 0.3, 1),
              border-radius 0.42s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.42s ease;
}

/* Premium Text Shadows for outstanding contrast against moving backgrounds */
.text-shadow-sm {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.text-shadow-md {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Darker capsules for rainy/cloudy day contrast on mini card */
.theme-darker-boxes .bg-white\/10 {
  background-color: rgba(0, 0, 0, 0.22) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
}
</style>
