<template>
  <div
    v-if="displayWeatherData"
    class="w-full flex flex-col select-none relative text-white"
    :class="{ 'theme-darker-boxes': isDarkerBoxes }"
    @pointerdown="closeBeachSelector"
    @click.stop
  >
      <!-- Background Decorative Blobs for Ambient Glow -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div class="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-white/5 blur-3xl"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl"></div>
      </div>

      <!-- Floating Close Button (Fixed Top-Right) -->
      <div 
        @click.stop="emit('close')" 
        class="fixed right-4 z-[110] hover:bg-white/25 active:scale-95 text-white p-2 rounded-full transition-all cursor-pointer flex items-center justify-center fixed-close-btn"
        style="top: calc(var(--safe-area-inset-top, 0px) + 1rem);"
        :aria-label="t('weather.close')"
      >
        <X class="w-6 h-6" />
      </div>

      <!-- Content Container -->
      <div :class="contentContainerClass" :style="contentContainerStyle">
        
        <!-- Header -->
        <header class="relative z-[500] flex items-center justify-between pt-4 stagger-item stagger-header">
          <div class="relative z-[500] min-w-0">
            <button
              v-if="canSelectBeach"
              type="button"
              class="weather-selector-trigger"
              :class="{ 'weather-selector-trigger--open': isBeachSelectorOpen }"
              :aria-expanded="isBeachSelectorOpen"
              @pointerdown.stop
              @click.stop="isBeachSelectorOpen = !isBeachSelectorOpen"
            >
              <span v-if="selectedBeach" class="relative mt-0.5 flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
                <BeachStatusFlagIcon :status="selectedBeach.state" class="size-4 drop-shadow-sm" />
                <span v-if="isParkingFull(selectedBeach)" class="weather-selector-parking-alert" />
              </span>
              <MapPin v-else class="mt-0.5 size-4 shrink-0 text-[#232323]" />
              <span class="flex min-w-0 flex-col gap-0.5">
                <span class="flex min-w-0 items-center gap-1.5 text-sm font-extrabold uppercase tracking-wide">
                  <span class="truncate">{{ title }}</span>
                  <ChevronDown class="size-4 shrink-0 transition-transform" :class="{ 'rotate-180': isBeachSelectorOpen }" />
                </span>
                <span class="text-[9px] font-mono uppercase leading-none tracking-widest text-[#232323]/70">
                  {{ t('weather.last_update_label') }} {{ displayWeatherData?.current?.time ? displayWeatherData.current.time.slice(11, 16) : '' }}
                </span>
              </span>
            </button>
            <div v-else class="flex items-start gap-2">
              <MapPin class="w-4 h-4 text-white/90 mt-0.5" />
              <div class="flex min-w-0 flex-col gap-0.5">
                <span class="text-sm font-extrabold tracking-wide uppercase">{{ title }}</span>
                <span class="text-[9px] text-white/70 font-mono uppercase tracking-widest leading-none">
                  {{ t('weather.last_update_label') }} {{ displayWeatherData?.current?.time ? displayWeatherData.current.time.slice(11, 16) : '' }}
                </span>
              </div>
            </div>
              <div
                v-if="canSelectBeach && isBeachSelectorOpen"
                class="weather-selector-dropdown absolute left-0 top-full z-[1000] max-h-90 space-y-0 overflow-y-auto bg-white px-4 pt-2 text-[#232323] shadow-2xl"
                @pointerdown.stop
                @click.stop
              >
                <button
                  v-for="beach in beaches"
                  :key="beach.id"
                  type="button"
                  class="flex min-h-10 w-full items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-bold"
                  @click="selectBeach(beach.id)"
                >
                  <span class="flex min-w-0 items-center gap-3">
                    <span class="relative flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
                      <BeachStatusFlagIcon :status="beach.state" class="size-4 drop-shadow-sm" />
                      <span v-if="isParkingFull(beach)" class="weather-selector-parking-alert" />
                    </span>
                    <span class="truncate">{{ beach.title }}</span>
                  </span>
                </button>
              </div>
          </div>
          <!-- Spacer to maintain layout balance -->
          <div class="w-9 h-9"></div>
        </header>

        <!-- Hero Card (Current Condition Summary) -->
        <section class="flex flex-col items-center stagger-item stagger-hero -mt-4 mb-4">
          <div class="flex items-center justify-center gap-0">
            <img 
              v-if="imgTiempo"
              :src="imgTiempo" 
              :alt="weatherDescription" 
              class="w-24 h-24 object-contain filter animate-float" 
            />
            <div class="text-6xl font-black leading-none relative">
              {{ animatedTemperature }}<span class="text-5xl absolute font-semibold">°</span>
            </div>
          </div>
          
          <span class="text-xs font-bold uppercase tracking-wider text-white -mt-2">
            {{ weatherDescription }}
          </span>

          <div class="text-xs opacity-80 mt-1 text-shadow-sm select-none">
            <span v-if="isRefreshing">{{ t('weather.refreshing') }}</span>
            <span v-else-if="isError && lastUpdate">{{ t('weather.last_update', { time: formattedLastUpdate }) }}</span>
          </div>
        </section>

        <!-- Hourly Forecast Section (with SVG Line Chart) -->
        <section class="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl py-4 px-0 flex flex-col gap-3 stagger-item stagger-hourly">
          <div ref="scrollContainer" class="overflow-x-auto scrollbar-none flex flex-col relative w-full">
            <div class="relative w-[1680px]">
              
              <!-- SVG Temp Curve Layer -->
              <svg class="w-[1680px] h-[110px] overflow-visible select-none pointer-events-none" viewBox="0 0 1680 110">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="rgba(255, 255, 255, 0.25)" />
                    <stop offset="100%" stop-color="rgba(255, 255, 255, 0.0)" />
                  </linearGradient>
                </defs>
                <!-- Area path -->
                <path :d="chartPoints.areaPath" fill="url(#areaGrad)" />
                <!-- Stroke path -->
                <path :d="chartPoints.linePath" fill="none" stroke="rgba(255, 255, 255, 0.75)" stroke-width="3" stroke-linecap="round" />
                <!-- UV curve, colored by risk band -->
                <path
                  v-for="(segment, idx) in chartPoints.uvSegments"
                  :key="`uv-${idx}`"
                  :d="segment.path"
                  fill="none"
                  :stroke="segment.color"
                  stroke-width="3"
                  stroke-linecap="round"
                />
                <!-- Current Hour Vertical Indicator -->
                <line 
                  v-if="currentHourIndex !== -1"
                  :x1="currentHourX" 
                  y1="0" 
                  :x2="currentHourX" 
                  y2="110" 
                  stroke="rgba(255, 255, 255, 0.4)" 
                  stroke-width="1.5" 
                  stroke-dasharray="4 3" 
                />
                <!-- Circles and Temp text values -->
                <g v-for="(pt, idx) in chartPoints.coords" :key="idx">
                  <circle :cx="pt.x" :cy="pt.y" r="4" fill="#ffffff" stroke="rgba(255, 255, 255, 0.4)" stroke-width="2.5" />
                  <text :x="pt.x" :y="pt.y - 12" fill="white" font-size="14" font-weight="900" text-anchor="middle">
                    {{ pt.temp.toFixed(1) }}°
                  </text>
                </g>
                <!-- UV points and labels -->
                <g v-for="(pt, idx) in chartPoints.uvCoords" :key="`uv-point-${idx}`">
                  <circle :cx="pt.x" :cy="pt.y" r="4" :fill="pt.color" stroke="rgba(255, 255, 255, 0.55)" stroke-width="2" />
                  <text :x="pt.x" :y="pt.y + 17" :fill="pt.color" font-size="11" font-weight="900" text-anchor="middle">
                    UV {{ formatMaxDecimals(pt.uv, 1) }}
                  </text>
                </g>
              </svg>

              <!-- Columns / Info Layer aligned with X coords -->
              <div class="flex w-[1680px] text-white">
                <div 
                  v-for="(item, idx) in hourlyForecast" 
                  :key="idx" 
                  class="flex flex-col items-center justify-between w-[70px] shrink-0 text-center"
                >
                  <!-- Hourly weather icon -->
                  <img 
                    :src="getWeatherIcon(item.weatherCode, item.isDayVal)" 
                    :alt="getWeatherDescription(item.weatherCode, item.isDayVal)" 
                    class="size-10 object-contain filter" 
                  />
                  
                  <!-- Rain probability -->
                  <span 
                    class="text-[9px] lg:text-xs font-bold text-sky-200 min-h-3"
                    :class="{ 'opacity-0': item.rainProb === 0 }"
                  >
                    💧 {{ formatMaxDecimals(item.rainProb) }}%
                  </span>

                  <!-- Hour -->
                  <span class="text-[11px] lg:text-sm font-bold opacity-90">
                    {{ formatHour(item.time) }}
                  </span>

                  <!-- Wind Speed -->
                  <span class="text-[9px] lg:text-xs opacity-75 mt-0.5 whitespace-nowrap flex items-center gap-0.5">
                    <Wind class="size-2 lg:size-3" />
                    {{ item.windSpeed.toFixed(0) }} <span class="text-[7px] lg:text-xs">{{ WEATHER_UNITS.windSpeed }}</span>
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- Weather Metrics Grid -->
        <section class="grid grid-cols-2 gap-3.5">

          <!-- UV Card (colored bg based on UV index level) -->
          <div class="backdrop-blur-md border rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 stagger-item stagger-uv" :class="uvBgClass">
            <span class="text-[10px] text-white/80 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sun class="w-3.5 h-3.5 text-white/95" />
              {{ t('weather.uv_index') }}
            </span>
            <div class="mt-3 flex items-center gap-1.5">
              <span class="text-2xl lg:text-3xl font-black">{{ animatedUv }}</span>
              <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-white/15">
                {{ uvLabel }}
              </span>
            </div>
            <div class="-mt-2 pt-2 block text-[8px] lg:text-xs text-white/75">
              {{ t('weather.uv_max') }}: {{ displayWeatherData?.daily?.uv_index_max?.[0]?.toFixed(2) ?? '' }}
            </div>
          </div>

          <!-- Wind Card -->
          <div class="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between stagger-item stagger-wind">
            <span class="text-[10px] text-white/70 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Wind class="w-3.5 h-3.5 text-white/80" />
              {{ t('weather.wind') }}
            </span>
            <div class="mt-3 flex items-baseline gap-1">
              <span class="text-2xl lg:text-3xl font-black">{{ animatedWindSpeed.toFixed(1) }}</span>
              <span class="text-xs font-semibold text-white/85">{{ WEATHER_UNITS.windSpeed }}</span>
            </div>
            <div class="-mt-2 pt-2 flex items-center justify-between text-xs text-white/80">
              <span class="font-mono text-[8px] lg:text-xs">{{ t('weather.wind_direction') }}: {{ formatMaxDecimals(displayWeatherData?.current?.wind_direction_10m ?? 0) }}°{{ getWindDirectionCardinal(displayWeatherData?.current?.wind_direction_10m ?? 0) }}</span>
              <ArrowUp 
                class="w-3.5 h-3.5 text-white stroke-[3] transition-transform duration-500" 
                :style="{ transform: `rotate(${displayWeatherData?.current?.wind_direction_10m ?? 0}deg)` }"
              />
            </div>
          </div>

          <!-- Precipitation Card (replacing Location Card) -->
          <div class="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between stagger-item stagger-precip">
            <span class="text-[10px] text-white/70 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <CloudRain class="w-3.5 h-3.5 text-white/80" />
              {{ t('weather.precipitation') }}
            </span>
            <div class="mt-3 flex items-baseline gap-0.5">
              <span class="text-2xl lg:text-3xl font-black">{{ animatedPrecipitation.toFixed(1) }}</span>
              <span class="text-xs font-semibold text-white/85">{{ WEATHER_UNITS.precipitation }}</span>
            </div>
          </div>

          <!-- Humidity Card -->
          <div class="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col justify-between stagger-item stagger-humidity">
            <span class="text-[10px] text-white/70 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Droplet class="w-3.5 h-3.5 text-white/80" />
              {{ t('weather.humidity') }}
            </span>
            <div class="mt-3 flex items-baseline gap-0.5">
              <span class="text-2xl lg:text-3xl font-black">{{ animatedHumidity }}</span>
              <span class="text-xs font-semibold text-white/85">{{ WEATHER_UNITS.percent }}</span>
            </div>
          </div>

          <!-- Sunrise & Sunset Card (Sun Trajectory, full-width) -->
          <div class="col-span-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col items-center relative overflow-hidden mb-6 stagger-item stagger-sun">

            <!-- The Arc Trajectory -->
            <div class="w-full max-w-[280px] h-[110px] flex items-center justify-center select-none relative">
              <svg class="w-full h-full" viewBox="0 0 240 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Ground line -->
                <line x1="10" y1="95" x2="230" y2="95" stroke="rgba(255, 255, 255, 0.15)" stroke-width="2" stroke-dasharray="4 4" stroke-linecap="round" />
                <!-- Arc -->
                <path d="M 40,95 A 80,80 0 0,1 200,95" stroke="rgba(255, 255, 255, 0.2)" stroke-width="3" stroke-linecap="round" />
                <!-- Traversed Arc -->
                <path 
                  v-if="sunPosition.active"
                  :d="`M 40,95 A 80,80 0 0,1 ${sunPosition.x},${sunPosition.y}`" 
                  stroke="#fbbf24" 
                  stroke-width="3.5" 
                  stroke-linecap="round" 
                />

                <!-- Sun Icon (Flat, no shadow) -->
                <g 
                  v-if="sunPosition.active"
                  :transform="`translate(${sunPosition.x}, ${sunPosition.y})`"
                  class="transition-all duration-700 ease-out"
                >
                  <circle cx="0" cy="0" r="11" fill="white" />
                  <circle cx="0" cy="0" r="5" fill="#f59e0b" />
                  <!-- Rays -->
                  <line x1="0" y1="-8" x2="0" y2="-6" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" />
                  <line x1="0" y1="6" x2="0" y2="8" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" />
                  <line x1="-8" y1="0" x2="-6" y2="0" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" />
                  <line x1="6" y1="0" x2="8" y2="0" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" />
                  <line x1="-5.6" y1="-5.6" x2="-4.2" y2="-4.2" stroke="#f59e0b" stroke-width="1.2" stroke-linecap="round" />
                  <line x1="4.2" y1="4.2" x2="5.6" y2="5.6" stroke="#f59e0b" stroke-width="1.2" stroke-linecap="round" />
                  <line x1="4.2" y1="-4.2" x2="5.6" y2="-5.6" stroke="#f59e0b" stroke-width="1.2" stroke-linecap="round" />
                  <line x1="-5.6" y1="4.2" x2="-4.2" y2="5.6" stroke="#f59e0b" stroke-width="1.2" stroke-linecap="round" />
                </g>
              </svg>
            </div>

            <!-- Times Row -->
            <div class="w-full flex justify-between items-center text-sm text-white">
              <div class="flex items-center gap-1.5">
                <Sunrise class="w-5 h-5 text-amber-400 stroke-[2.2]" />
                <div class="flex flex-col text-left">
                  <span class="text-[9px] font-bold text-white/50 uppercase tracking-widest leading-none">{{ t('weather.sunrise') }}</span>
                  <span class="font-extrabold tracking-tight mt-0.5">{{ formatToAmPm(displayWeatherData?.daily?.sunrise?.[0]) }}</span>
                </div>
              </div>
              <div class="flex items-center gap-1.5 text-right">
                <div class="flex flex-col items-end text-right">
                  <span class="text-[9px] font-bold text-white/50 uppercase tracking-widest leading-none">{{ t('weather.sunset') }}</span>
                  <span class="font-extrabold tracking-tight mt-0.5">{{ formatToAmPm(displayWeatherData?.daily?.sunset?.[0]) }}</span>
                </div>
                <Sunset class="w-5 h-5 text-amber-500 stroke-[2.2]" />
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useI18n } from '#imports'
import {
  getWeatherDescriptionKeyFromCode,
  getWeatherIconFromCode,
  getWeatherStateFromCode
} from '~/composables/useBeachWeatherAggregate'
import type { BeachWeatherItem } from '~/types/beachWeather'
import BeachStatusFlagIcon from '~/components/BeachStatusFlagIcon.vue'
import {
  X,
  Wind,
  Droplet,
  Sun,
  Sunrise,
  Sunset,
  CloudRain,
  ArrowUp,
  MapPin,
  ChevronDown
} from '@lucide/vue'
import type { Beach } from '~/types/beach'

const emit = defineEmits<{
  close: []
  'select-beach': [beachId: string | number]
}>()

const props = defineProps<{
  weatherData?: BeachWeatherItem
  title?: string
  isRefreshing?: boolean
  isError?: boolean
  lastUpdate?: number | null
  layout?: 'default' | 'split-map'
  beaches?: Beach[]
  selectedBeachId?: string | number | null
}>()

const scrollContainer = ref<HTMLElement | null>(null)

const scrollToCurrentHour = () => {
  const currentTimeStr = displayWeatherData.value?.current?.time
  if (!scrollContainer.value || !currentTimeStr) return
  const currentHour = new Date(currentTimeStr).getHours()
  scrollContainer.value.scrollLeft = currentHour * 70
}

onMounted(() => {
  nextTick(() => {
    scrollToCurrentHour()
  })
})

const { t } = useI18n()

const title = computed(() => props.title || t('weather.details_title'))
const beaches = computed(() => props.beaches ?? [])
const selectedBeachId = computed(() => props.selectedBeachId ?? null)
const selectedBeach = computed(() => selectedBeachId.value === null
  ? undefined
  : beaches.value.find(beach => String(beach.id) === String(selectedBeachId.value))
)
const canSelectBeach = computed(() => props.layout !== 'split-map' && beaches.value.length > 0)
const isBeachSelectorOpen = ref(false)

function selectBeach(beachId: string | number) {
  isBeachSelectorOpen.value = false
  emit('select-beach', beachId)
}

function closeBeachSelector() {
  isBeachSelectorOpen.value = false
}

function isParkingFull(beach: Beach) {
  return beach.ocupacion?.state === 'red'
}

const contentContainerClass = computed(() => [
  'relative z-10 flex min-h-full flex-col gap-6 pt-safe pb-8 content-container',
  props.layout === 'split-map'
    ? 'split-weather-content max-w-none items-center px-6 lg:px-10'
    : 'w-full max-w-lg mx-auto px-4'
])

const contentContainerStyle = computed(() => props.layout === 'split-map'
  ? {
      marginLeft: 'calc(2.5rem + min(420px, 42vw))',
      width: 'calc(100% - (2.5rem + min(420px, 42vw)))'
    }
  : undefined
)

const displayWeatherData = computed(() => props.weatherData)
const isRefreshing = computed(() => props.isRefreshing ?? false)
const isError = computed(() => props.isError ?? false)

const isDay = computed(() => {
  return displayWeatherData.value?.current?.is_day === 1
})

const temperature = computed(() => {
  return displayWeatherData.value?.current?.temperature_2m ?? 0
})

const animationTimers = new Set<ReturnType<typeof setInterval>>()

function roundToPrecision(value: number, precision: number) {
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

function useAnimatedNumber(source: () => number, options: { precision?: number, step?: number, interval?: number } = {}) {
  const precision = options.precision ?? 0
  const step = options.step ?? 1
  const interval = options.interval ?? 45
  const value = ref(roundToPrecision(source(), precision))
  let initialized = false
  let timer: ReturnType<typeof setInterval> | null = null

  function clearTimer() {
    if (!timer) return
    clearInterval(timer)
    animationTimers.delete(timer)
    timer = null
  }

  watch(source, (rawTarget) => {
    const target = roundToPrecision(rawTarget, precision)
    clearTimer()

    if (!initialized) {
      value.value = target
      initialized = true
      return
    }

    if (value.value === target) return

    timer = setInterval(() => {
      const direction = value.value < target ? 1 : -1
      const next = roundToPrecision(value.value + direction * step, precision)
      value.value = direction > 0 ? Math.min(next, target) : Math.max(next, target)

      if (value.value === target) {
        clearTimer()
      }
    }, interval)
    animationTimers.add(timer)
  }, { immediate: true })

  return value
}

const animatedTemperature = useAnimatedNumber(() => Math.round(temperature.value))

const windSpeed = computed(() => {
  return displayWeatherData.value?.current?.wind_speed_10m ?? 0
})

const animatedWindSpeed = useAnimatedNumber(() => windSpeed.value, { precision: 1, step: 0.2 })

const humidity = computed(() => {
  return displayWeatherData.value?.current?.relative_humidity_2m ?? 0
})

const animatedHumidity = useAnimatedNumber(() => Math.round(humidity.value))

const precipitation = computed(() => {
  return displayWeatherData.value?.current?.precipitation ?? 0
})

const animatedPrecipitation = useAnimatedNumber(() => precipitation.value, { precision: 1, step: 0.1 })

const uv = computed(() => {
  const currentHour = displayWeatherData.value?.current?.time?.slice(0, 13)
  const hourly = displayWeatherData.value?.hourly
  const hourlyIndex = currentHour && hourly?.time
    ? hourly.time.findIndex((time) => time.slice(0, 13) === currentHour)
    : -1
  const val = hourlyIndex >= 0
    ? hourly?.uv_index?.[hourlyIndex]
    : displayWeatherData.value?.daily?.uv_index_max?.[0]
  return val !== undefined && typeof val === 'number' ? Math.round(val) : 0
})

const animatedUv = useAnimatedNumber(() => uv.value)

onUnmounted(() => {
  animationTimers.forEach(timer => clearInterval(timer))
  animationTimers.clear()
})

const imgTiempo = computed(() => {
  const code = displayWeatherData.value?.current?.weather_code
  if (code === undefined || code === null) return null
  return getWeatherIconFromCode(code, isDay.value)
})

const weatherDescription = computed(() => {
  const code = displayWeatherData.value?.current?.weather_code
  if (code === undefined || code === null) return ''
  return t(getWeatherDescriptionKeyFromCode(code))
})

const weatherState = computed(() => {
  const code = displayWeatherData.value?.current?.weather_code
  if (code === undefined || code === null) return 'sunny'
  return getWeatherStateFromCode(code)
})

// These compact meteorological symbols are locale-neutral domain units by design.
const WEATHER_UNITS = {
  windSpeed: 'km/h',
  precipitation: 'mm',
  percent: '%'
} as const

const formattedLastUpdate = computed(() => {
  if (!props.lastUpdate) return ''
  const date = new Date(props.lastUpdate)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
})

const isDarkerBoxes = computed(() => {
  return isDay.value && (weatherState.value === 'cloudy' || weatherState.value === 'rainy')
})

// Formatting helpers
function formatHour(timeStr: string | undefined) {
  if (!timeStr) return ''
  return timeStr.substring(11, 16)
}

function formatToAmPm(timeStr: string | undefined) {
  if (!timeStr) return ''
  const timePart = timeStr.includes('T') ? (timeStr.split('T')[1] || '') : timeStr
  const parts = timePart.split(':')
  const hourStr = parts[0] || '00'
  const minStr = parts[1] || '00'
  let hour = parseInt(hourStr, 10)
  const ampm = hour >= 12 ? 'pm' : 'am'
  hour = hour % 12
  hour = hour ? hour : 12
  return `${hour}:${minStr} ${ampm}`
}

function formatMaxDecimals(value: number, decimals = 2) {
  return Number.isFinite(value) ? Number(value.toFixed(decimals)).toString() : '0'
}

const sunPosition = computed(() => {
  const sunriseStr = displayWeatherData.value?.daily?.sunrise?.[0]
  const sunsetStr = displayWeatherData.value?.daily?.sunset?.[0]
  const currentTimeStr = displayWeatherData.value?.current?.time

  if (!sunriseStr || !sunsetStr || !currentTimeStr) {
    return { x: 40, y: 95, active: false, angleDeg: 180 }
  }

  const parseTime = (str: string) => {
    return new Date(str).getTime()
  }

  const sunriseTime = parseTime(sunriseStr)
  const sunsetTime = parseTime(sunsetStr)
  const currentTime = parseTime(currentTimeStr)

  const cx = 120
  const cy = 95
  const r = 80

  if (currentTime < sunriseTime) {
    return { x: cx - r, y: cy, active: false, angleDeg: 180 }
  }
  if (currentTime > sunsetTime) {
    return { x: cx + r, y: cy, active: false, angleDeg: 0 }
  }

  const progress = (currentTime - sunriseTime) / (sunsetTime - sunriseTime)
  const angleRad = Math.PI - progress * Math.PI
  const x = cx + r * Math.cos(angleRad)
  const y = cy - r * Math.sin(angleRad)
  const angleDeg = 180 - progress * 180

  return { x, y, active: true, angleDeg }
})

// UV card background class depending on value
const uvBgClass = computed(() => {
  const value = uv.value
  if (value <= 2) return 'bg-emerald-500 border-emerald-500/30'
  if (value <= 5) return 'bg-yellow-500 border-yellow-500/30'
  if (value <= 7) return 'bg-amber-500 border-amber-500/40'
  if (value <= 10) return 'bg-red-500 border-red-500/45'
  return 'bg-purple-600 border-purple-600/40'
})

// UV indicator status
const uvLabel = computed(() => {
  const value = uv.value
  if (value <= 2) return t('weather.uv_low')
  if (value <= 5) return t('weather.uv_moderate')
  if (value <= 7) return t('weather.uv_high')
  if (value <= 10) return t('weather.uv_very_high')
  return t('weather.uv_extreme')
})

// Wind direction mapping
function getWindDirectionCardinal(degrees: number) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(degrees / 45) % 8
  return directions[index]
}

// 24-hour predictions format
const hourlyForecast = computed(() => {
  if (!displayWeatherData.value?.hourly) return []
  const h = displayWeatherData.value.hourly
  return h.time.map((time, idx) => ({
    time,
    temp: h.temperature_2m?.[idx] ?? 0,
    humidity: h.relative_humidity_2m?.[idx] ?? 0,
    rainProb: h.precipitation_probability?.[idx] ?? 0,
    rain: h.rain?.[idx] ?? 0,
    weatherCode: h.weather_code?.[idx] ?? 0,
    windSpeed: h.wind_speed_10m?.[idx] ?? 0,
    windDir: h.wind_direction_10m?.[idx] ?? 0,
    uvIndex: h.uv_index?.[idx] ?? 0,
    isDayVal: h.is_day?.[idx] === 1
  }))
})

function getWeatherIcon(code: number, isDayVal: boolean) {
  return getWeatherIconFromCode(code, isDayVal)
}

function getWeatherDescription(code: number, _isDayVal?: boolean) {
  return t(getWeatherDescriptionKeyFromCode(code))
}

function getUvRiskColor(value: number) {
  if (value <= 2) return '#34d399'
  if (value <= 5) return '#facc15'
  if (value <= 7) return '#fb923c'
  if (value <= 10) return '#f87171'
  return '#c084fc'
}

// Graph calculations
const chartPoints = computed(() => {
  const data = hourlyForecast.value
  if (!data.length) return { linePath: '', areaPath: '', coords: [], uvCoords: [], uvSegments: [] }

  const temps = data.map(d => d.temp)
  const minTemp = Math.min(...temps)
  const maxTemp = Math.max(...temps)
  const tempRange = maxTemp - minTemp || 1

  const colWidth = 70
  const height = 110
  const topPadding = 25
  const bottomPadding = 15
  const graphHeight = height - topPadding - bottomPadding

  const coords = data.map((d, i) => {
    const x = i * colWidth + colWidth / 2
    const y = topPadding + graphHeight - ((d.temp - minTemp) / tempRange) * graphHeight
    return { x, y, temp: d.temp }
  })

  const uvTopPadding = 34
  const uvBottomPadding = 16
  const uvGraphHeight = height - uvTopPadding - uvBottomPadding
  const maxUv = Math.max(11, ...data.map(d => d.uvIndex))
  const uvCoords = data.map((d, i) => {
    const uv = d.uvIndex
    const x = i * colWidth + colWidth / 2
    const y = uvTopPadding + uvGraphHeight - (uv / maxUv) * uvGraphHeight
    return { x, y, uv, color: getUvRiskColor(uv) }
  })
  const uvSegments = uvCoords.slice(1).map((pt, index) => {
    const prev = uvCoords[index]
    return {
      path: `M ${prev.x},${prev.y} L ${pt.x},${pt.y}`,
      color: getUvRiskColor(Math.max(prev.uv, pt.uv))
    }
  })

  // Stroke path string
  const linePath = coords.map(c => `${c.x},${c.y}`).join(' L ')
  
  // Area path string (under the line to the bottom)
  const startX = coords[0]?.x ?? 0
  const endX = coords[coords.length - 1]?.x ?? 0
  const areaPath = `M ${startX},${height} L ${linePath} L ${endX},${height} Z`

  return {
    linePath: `M ${linePath}`,
    areaPath,
    coords,
    uvCoords,
    uvSegments
  }
})

const currentHourIndex = computed(() => {
  const currentTimeStr = displayWeatherData.value?.current?.time
  if (!currentTimeStr) return -1
  return new Date(currentTimeStr).getHours()
})

const currentHourX = computed(() => {
  const idx = currentHourIndex.value
  if (idx === -1) return 0
  return idx * 70 + 35
})

defineExpose({
  scrollToCurrentHour
})
</script>

<style scoped>
@keyframes float {
  0% { transform: translateY(5px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(5px); }
}

.animate-float {
  animation: float 5s ease-in-out infinite;
}

/* Hide scrollbar default styles */
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Staggered Fade-in Animation for detailed content components */
.stagger-item {
  animation: fadeInStagger 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}

@keyframes fadeInStagger {
  0% {
    opacity: 0;
    transform: translateY(12px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.fixed-close-btn {
  animation: fadeInClose 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: 0s;
  opacity: 0;
}

@keyframes fadeInClose {
  0% {
    opacity: 0;
    transform: scale(0.85);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Specific Stagger Delays starting immediately on mount */
.stagger-header { animation-delay: 0s; }
.stagger-hero { animation-delay: 0.05s; }
.stagger-hourly { animation-delay: 0.10s; }
.stagger-uv { animation-delay: 0.15s; }
.stagger-wind { animation-delay: 0.20s; }
.stagger-precip { animation-delay: 0.25s; }
.stagger-humidity { animation-delay: 0.30s; }
.stagger-sun { animation-delay: 0.35s; }

.pb-safe {
  padding-bottom: var(--safe-area-inset-bottom);
}
.pt-safe {
  padding-top: var(--safe-area-inset-top);
}

.split-weather-content > * {
  width: 100%;
  max-width: 38rem;
}

.weather-selector-trigger {
  display: flex !important;
  width: min(78vw, 22rem) !important;
  align-items: flex-start !important;
  gap: 0.5rem !important;
  box-sizing: border-box !important;
  padding: 1rem !important;
  appearance: none !important;
  background: #ffffff !important;
  color: #232323 !important;
  text-align: left !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  border-radius: 1.5rem !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
}

.weather-selector-trigger--open {
  border-bottom: 0 !important;
  border-radius: 1.5rem 1.5rem 0 0 !important;
}

.weather-selector-dropdown {
  width: min(78vw, 22rem) !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  border-radius: 0 0 1.5rem 1.5rem !important;
}

.weather-selector-parking-alert {
  position: absolute;
  top: -0.125rem;
  right: -0.125rem;
  width: 0.625rem;
  height: 0.625rem;
  background-color: #ef4444;
  border: 2px solid #ffffff;
  border-radius: 9999px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  animation: weather-selector-parking-pulse 1.8s infinite ease-in-out;
}

@keyframes weather-selector-parking-pulse {
  0% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }

  70% {
    transform: scale(1.15);
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0);
  }

  100% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

/* Darker card boxes for rainy/cloudy day contrast */
.theme-darker-boxes .bg-white\/10 {
  background-color: rgba(0, 0, 0, 0.22) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
}
</style>
