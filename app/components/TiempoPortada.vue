<template>
<div 
  class="border border-white/10 select-none bg-gradient-to-br weather-card"
  :class="[
    isDetailOpen 
      ? 'fixed inset-0 w-screen h-screen rounded-none z-[100] cursor-default overflow-y-auto pb-safe' 
      : 'fixed rounded-3xl w-fit h-26 cursor-pointer z-20 overflow-hidden',
    isDay ? 'from-sky-400 via-blue-500 to-indigo-600 text-white' : 'from-slate-950 via-indigo-950 to-slate-900 text-white'
  ]"
  :style="isDetailOpen ? {} : { top: 'calc(env(safe-area-inset-top, 0px))', left: '16px' }"
  @click="!isDetailOpen && openDetail()"
>
  <!-- Loaded Summary Card Content (visible when closed) -->
  <div 
    v-if="!isLoading && weatherData" 
    class="h-full w-full p-3 flex flex-col gap-1.5 justify-between transition-opacity duration-300"
    :class="isDetailOpen ? 'opacity-0 pointer-events-none absolute inset-0' : 'opacity-100'"
  >
    <!-- Top Row Badges -->
    <div class="flex items-center gap-1 text-[10px] lg:text-[12px] font-semibold">
      <!-- Wind Badge -->
      <span class="bg-white/10 backdrop-blur-sm border border-white/5 py-0.5 px-2 rounded-full flex items-center gap-1 whitespace-nowrap">
        <Wind class="w-3 h-3 text-white/90" />
        {{ windSpeed.toFixed(0) }} km/h
      </span>
      
      <!-- UV Badge -->
      <span class="bg-white/10 backdrop-blur-sm border border-white/5 py-0.5 px-2 rounded-full flex items-center gap-1 whitespace-nowrap">
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
      <span class="bg-white/10 backdrop-blur-sm border border-white/5 py-0.5 px-2 rounded-full flex items-center gap-1 whitespace-nowrap">
        <Droplet class="w-3 h-3 text-white/90" />
        {{ humidity.toFixed(0) }}%
      </span>
    </div>

    <!-- Bottom Row: Icon + Temperature & Condition -->
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
  </div>

  <!-- Loading Skeleton State (visible when closed and loading) -->
  <div 
    v-else-if="isLoading || !weatherData" 
    class="h-full w-full p-3 bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse flex flex-col justify-between"
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
  />
</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Wind, Circle, Droplet } from '@lucide/vue'
import { useWeather } from '~/composables/useWeather'
import TiempoDetalleModal from './TiempoDetalleModal.vue'

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
  fetchWeather
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
              border-radius 0.42s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>