<template>
  <!-- 1. PRODUCTION MODE (renders single card) -->
  <template v-if="!simulationMode">
    <div 
      class="select-none weather-card text-white"
      :class="[
        isDetailOpen 
          ? 'fixed inset-0 w-screen h-screen rounded-none z-[100] cursor-default overflow-y-auto pb-safe' 
          : 'fixed rounded-3xl w-56 h-26 cursor-pointer z-20 shadow-lg overflow-hidden',
        { 'theme-darker-boxes': isDarkerBoxes }
      ]"
      :style="isDetailOpen 
        ? { top: '0px', left: '0px', width: '100vw', height: '100vh', borderRadius: '0px' } 
        : { top: 'calc(var(--safe-area-inset-top, 0px) + 16px)', left: '16px', width: '224px', height: '104px', borderRadius: '24px' }"
      @click="!isDetailOpen && openDetail()"
    >
      <!-- Animated Dynamic Weather Background -->
      <WeatherBackground
        v-if="!isLoading && weatherData"
        :weather-state="weatherState"
        :is-day="isDay"
        :is-fixed="showDetailsContent"
      />

      <!-- Loaded Summary Card Content (visible when closed) -->
      <div 
        v-if="!isLoading && weatherData" 
        class="h-full w-full p-3 flex flex-col gap-1.5 justify-between transition-opacity duration-300"
        :class="isDetailOpen ? 'opacity-0 pointer-events-none absolute top-0 left-0 w-56 h-26' : 'opacity-100 relative z-10'"
      >
        <!-- Top Row Badges -->
        <div class="flex items-center gap-1 text-[10px] lg:text-[12px] font-semibold text-shadow-sm">
          <!-- Wind Badge -->
          <span class="bg-white/10 backdrop-blur-sm py-0.5 px-2 rounded-full flex items-center gap-1 whitespace-nowrap">
            <Wind class="w-3 h-3 text-white/90" />
            {{ windSpeed.toFixed(0) }} km/h
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
            {{ uv }} UV
          </span>
          
          <!-- Humidity Badge -->
          <span class="bg-white/10 backdrop-blur-sm py-0.5 px-2 rounded-full flex items-center gap-1 whitespace-nowrap">
            <Droplet class="w-3 h-3 text-white/90" />
            {{ humidity.toFixed(0) }}%
          </span>
        </div>

        <!-- Bottom Row: Icon + Temperature & Condition -->
        <div class="flex items-center gap-0 text-shadow-md">
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
      </div>

      <!-- Loading Skeleton State (visible when closed and loading) -->
      <div 
        v-else-if="isLoading || !weatherData" 
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
        @close="closeDetail" 
        class="relative z-10"
      />
    </div>
  </template>

  <!-- 2. SIMULATION PREVIEW MODE (renders all states stacked vertically for visual testing) -->
  <template v-else>
    <!-- Detailed Modal (displayed on top if a preview card is clicked) -->
    <div 
      v-if="isDetailOpen"
      class="select-none weather-card overflow-hidden text-white fixed inset-0 w-screen h-screen rounded-none z-[100] cursor-default overflow-y-auto pb-safe"
    >
      <WeatherBackground
        :weather-state="simulatedDetailState.state"
        :is-day="simulatedDetailState.isDay"
        :is-fixed="true"
      />
      <TiempoDetalleModal 
        @close="closeDetail" 
        class="relative z-10"
        :simulated-state="simulatedDetailState.state"
        :simulated-is-day="simulatedDetailState.isDay"
      />
    </div>

    <!-- Stack of Preview Cards -->
    <div 
      v-else
      v-for="(item, idx) in previewStates" 
      :key="idx"
      class="select-none weather-card overflow-hidden text-white fixed rounded-3xl w-56 h-26 cursor-pointer z-20 shadow-lg border border-white/10"
      :style="{ top: `calc(var(--safe-area-inset-top, 0px) + 16px + ${idx * 110}px)`, left: '16px' }"
      @click="openSimulatedDetail(item)"
    >
      <WeatherBackground
        :weather-state="item.state"
        :is-day="item.isDay"
        :is-fixed="false"
      />
      
      <div class="h-full w-full p-3 flex flex-col gap-1.5 justify-between relative z-10 text-shadow-md">
        <!-- Top Row Badge -->
        <div class="flex items-center gap-1 text-[10px] font-bold">
          <span class="bg-black/20 backdrop-blur-sm py-0.5 px-2 rounded-full whitespace-nowrap">
            {{ item.label }}
          </span>
        </div>

        <!-- Bottom Row: Icon + Simulated Temperature -->
        <div class="flex items-center gap-1 pl-1">
          <img 
            v-if="getWeatherIcon(item.code, item.isDay)"
            :src="getWeatherIcon(item.code, item.isDay)" 
            class="w-12 h-12 object-contain filter animate-float" 
          />
          <span class="text-3xl font-black leading-none">
            {{ item.temp }}°
          </span>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Wind, Circle, Droplet } from '@lucide/vue'
import { useWeather } from '~/composables/useWeather'
import TiempoDetalleModal from './TiempoDetalleModal.vue'

const isDarkerBoxes = computed(() => {
  return isDay.value && (weatherState.value === 'cloudy' || weatherState.value === 'rainy')
})

const isItemDarkerBoxes = (item: { isDay: boolean; state: string }) => {
  return item.isDay && (item.state === 'cloudy' || item.state === 'rainy')
}

// --- SIMULATION TOGGLE ---
// Change to false to restore production behavior using actual live API weather data
const simulationMode = ref(false)

const previewStates = [
  { label: 'Soleado (Día)', state: 'sunny' as const, isDay: true, temp: 28, code: 0 },
  { label: 'Nublado (Día)', state: 'cloudy' as const, isDay: true, temp: 21, code: 3 },
  { label: 'Lluvia (Día)', state: 'rainy' as const, isDay: true, temp: 17, code: 63 },
  { label: 'Despejado (Noche)', state: 'sunny' as const, isDay: false, temp: 15, code: 0 },
  { label: 'Nublado (Noche)', state: 'cloudy' as const, isDay: false, temp: 13, code: 3 },
  { label: 'Lluvia (Noche)', state: 'rainy' as const, isDay: false, temp: 11, code: 63 }
]

const simulatedDetailState = ref({ state: 'sunny' as const, isDay: true })

const {
  weatherData,
  isLoading,
  isDay,
  temperature,
  windSpeed,
  humidity,
  uv,
  imgTiempo,
  weatherDescription,
  weatherState,
  fetchWeather,
  getWeatherIcon
} = useWeather()

const isDetailOpen = ref(false)
const showDetailsContent = ref(false)

function openDetail() {
  if (!isLoading.value && weatherData.value) {
    isDetailOpen.value = true
    setTimeout(() => {
      showDetailsContent.value = true
    }, 430)
  }
}

function openSimulatedDetail(item: typeof previewStates[number]) {
  simulatedDetailState.value = { state: item.state, isDay: item.isDay }
  isDetailOpen.value = true
  setTimeout(() => {
    showDetailsContent.value = true
  }, 430)
}

function closeDetail() {
  showDetailsContent.value = false
  isDetailOpen.value = false
}

onMounted(async () => {
  await fetchWeather()
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