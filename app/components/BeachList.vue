<template>
  <div class="space-y-2">
    <BeachListItem
      v-for="beach in beaches"
      :key="beach.id"
      :beach="beach"
      :weather="getBeachWeather(beach.id)"
      @select="$emit('select-beach', beach)"
      @open-weather="openWeather"
    />
    <div v-if="fechasServicio" class="text-[10px] text-gray-600 mt-2.5 text-center pt-2 font-medium">
      {{ $t('service_active') }}<br />{{ fechasServicio }}
    </div>

    <Teleport to="body">
      <div
        v-if="selectedWeather"
        class="fixed inset-0 z-[100] h-screen w-screen overflow-y-auto text-white"
        @click="closeWeather"
      >
        <WeatherBackground
          :weather-state="selectedWeatherState"
          :is-day="selectedWeather.current.is_day === 1"
          :is-fixed="true"
        />
        <TiempoDetalleModal
          :weather-data="selectedWeather"
          :title="selectedWeather.nombre"
          class="relative z-10"
          @close="closeWeather"
        />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Beach } from '~/types/beach'
import type { BeachWeatherItem } from '~/types/beachWeather'
import { useBeachWeather } from '~/composables/useBeachWeather'
import type { WeatherState } from '~/composables/useWeather'
import BeachListItem from './BeachListItem.vue'
import TiempoDetalleModal from './TiempoDetalleModal.vue'

defineProps<{
  beaches: Beach[]
  fechasServicio?: string
}>()

defineEmits(['select-beach'])

const selectedWeather = ref<BeachWeatherItem | null>(null)

const { fetchBeachWeather, getBeachWeather } = useBeachWeather()

const selectedWeatherState = computed<WeatherState>(() => {
  const code = selectedWeather.value?.current.weather_code
  if (code === undefined || code === null) return 'sunny'

  if (code === 0 || code === 1) return 'sunny'
  if (code === 2 || code === 3 || code === 45 || code === 48) return 'cloudy'
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) return 'rainy'
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'snowy'
  return 'sunny'
})

function openWeather(weather: BeachWeatherItem) {
  selectedWeather.value = weather
}

function closeWeather() {
  selectedWeather.value = null
}

onMounted(() => {
  fetchBeachWeather()
})
</script>
