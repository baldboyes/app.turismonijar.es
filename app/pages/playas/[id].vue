<template>
  <ion-page>
    <!-- Header with Back Button -->
    <header class="custom-header bg-white border-b border-gray-100 p-4 shrink-0 select-none">
      <div class="max-w-[1024px] mx-auto flex items-center gap-3 lg:pt-3">
        <button
          @click="goBack"
          class="p-2 -ml-2 rounded-xl hover:bg-gray-50 text-gray-500 active:scale-95 transition-all"
        >
          <ChevronLeft class="w-6 h-6" />
        </button>
        <h1 class="!text-lg font-extrabold text-gray-800 truncate !m-0 !p-0">
          {{ beach ? beach.title : $t('playas_page.loading') }}
        </h1>
      </div>
    </header>

    <!-- Content -->
    <ion-content class="custom-content">
      <!-- Loading state -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
        <Waves class="w-12 h-12 text-emerald-600 animate-bounce mb-3" />
        <p class="text-xs text-gray-500 font-semibold">{{ $t('playas_page.loading') }}</p>
      </div>

      <!-- Error state -->
      <div v-else-if="isError || !beach" class="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center max-w-sm mx-auto">
        <div class="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3">
          <AlertCircle class="w-6 h-6" />
        </div>
        <h3 class="font-bold text-gray-800 text-base mb-1">{{ $t('error_overlay.title') }}</h3>
        <p class="text-xs text-gray-500 mb-4">{{ $t('playas_page.no_results') }}</p>
        <button
          @click="goBack"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.97]"
        >
          {{ $t('playas_page.back_to_list') }}
        </button>
      </div>

      <!-- Detail View -->
      <div v-else class="max-w-[1024px] mx-auto p-4 lg:p-6 space-y-4 pb-28 lg:pb-28">
        <!-- Hero image with flag overlay -->
        <div class="relative w-full h-64 rounded-3xl overflow-hidden bg-gray-100 shrink-0">
          <NuxtImg
            v-if="beach.src"
            :src="beach.src"
            :alt="beach.title"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-800">
            <Waves class="w-16 h-16 opacity-30" />
          </div>

          <!-- Live Flag & Parking status overlay container -->
          <div class="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 items-center">
            <!-- Live Flag status overlay -->
            <div 
              v-if="beach.bandera"
              class="px-4 py-2 rounded-2xl text-xs font-black tracking-wider uppercase shadow-lg flex items-center gap-2 backdrop-blur-md"
              :class="getBadgeClass(beach.bandera)"
            >
              <BeachStatusFlagIcon :status="beach.bandera" class="size-4" />
              {{ $t(beach.bandera.toLowerCase()) }}
            </div>

            <!-- Parking status overlay -->
            <div 
              v-if="beach.ocupacion?.state === 'red'"
              class="px-4 py-2 rounded-2xl text-xs font-black tracking-wider uppercase shadow-lg flex items-center gap-2 bg-red-600/90 text-white backdrop-blur-md"
            >
              <AlertTriangle class="w-3.5 h-3.5" />
              <span>{{ $t('playas_page.parking_full') }}</span>
            </div>
          </div>
        </div>

        <!-- Beach Weather Summary -->
        <div v-if="beachWeather" class="bg-white rounded-3xl p-4 lg:p-6 space-y-4">
          <div class="flex items-center justify-between gap-3">
            <h3 class="!text-sm font-extrabold uppercase tracking-wider text-gray-600 !m-0">
              {{ $t('weather.beach_summary') }}
            </h3>
            <button
              type="button"
              class="flex items-center gap-1.5 !px-3.5 !py-2 !bg-primary !hover:bg-primary/90 !text-primary-foreground font-bold text-[11px] !rounded-xl transition-all shrink-0"
              :aria-label="$t('weather.open_beach_details', { beach: beach.title })"
              @click="isWeatherModalOpen = true"
            >
              <Thermometer class="w-3.5 h-3.5" />
              {{ $t('weather.details') }}
            </button>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="rounded-2xl bg-orange-50 p-3 text-orange-700">
              <Thermometer class="size-4 mb-1" />
              <span class="block text-[10px] font-bold uppercase tracking-wider text-orange-700/70">{{ $t('weather.temperature') }}</span>
              <span class="text-lg font-black">{{ beachWeather.current.temperature_2m.toFixed(0) }}°</span>
            </div>
            <div class="rounded-2xl bg-sky-50 p-3 text-sky-700">
              <Wind class="size-4 mb-1" />
              <span class="block text-[10px] font-bold uppercase tracking-wider text-sky-700/70">{{ $t('weather.wind') }}</span>
              <span class="text-lg font-black">{{ beachWeather.current.wind_speed_10m.toFixed(0) }}</span>
              <span class="text-[10px] font-bold"> km/h</span>
            </div>
            <div class="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
              <Waves class="size-4 mb-1" />
              <span class="block text-[10px] font-bold uppercase tracking-wider text-cyan-700/70">{{ $t('weather.sea') }}</span>
              <span class="text-lg font-black">{{ beachWeather.sea_surface_temperature.toFixed(0) }}°</span>
            </div>
            <div class="rounded-2xl p-3" :class="beachWeatherUvClass">
              <Sun class="size-4 mb-1" />
              <span class="block text-[10px] font-bold uppercase tracking-wider opacity-70">{{ $t('weather.uv_index') }}</span>
              <span class="text-lg font-black">{{ beachWeatherUv }}</span>
            </div>
          </div>
        </div>

        <!-- Description Section -->
        <div v-if="beach.description" class="bg-white rounded-3xl p-4 lg:p-6 space-y-2">
          <h3 class="!text-sm font-extrabold uppercase tracking-wider text-gray-600 !m-0">
            {{ $t('playas_page.description') }}
          </h3>
          <div 
            class="text-sm text-gray-600 leading-relaxed font-normal whitespace-pre-line prose max-w-none" 
            v-html="beach.description"
          ></div>
        </div>

        <!-- Grid of Characteristics -->
        <div v-if="hasCharacteristics" class="grid grid-cols-3 gap-4">
          <div 
            v-if="parsedCharacteristics.arena" 
            class="bg-white rounded-3xl p-4 lg:p-6 text-center flex flex-col items-center justify-center"
          >
            <div class="size-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-1.5 shrink-0">
              <Umbrella class="w-4 h-4" />
            </div>
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
              {{ $t('playas_page.sand') }}
            </span>
            <span class="text-xs font-bold text-gray-700 truncate w-full">
              {{ parsedCharacteristics.arena }}
            </span>
          </div>

          <div 
            v-if="parsedCharacteristics.anchura" 
            class="bg-white rounded-3xl p-4 lg:p-6 text-center flex flex-col items-center justify-center"
          >
            <div class="size-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-1.5 shrink-0">
              <Ruler class="w-4 h-4" />
            </div>
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
              {{ $t('playas_page.width') }}
            </span>
            <span class="text-xs font-bold text-gray-700 truncate w-full">
              {{ parsedCharacteristics.anchura }}
            </span>
          </div>

          <div 
            v-if="parsedCharacteristics.longitud" 
            class="bg-white rounded-3xl p-4 lg:p-6 text-center flex flex-col items-center justify-center"
          >
            <div class="size-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1.5 shrink-0">
              <Expand class="w-4 h-4" />
            </div>
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
              {{ $t('playas_page.length') }}
            </span>
            <span class="text-xs font-bold text-gray-700 truncate w-full">
              {{ parsedCharacteristics.longitud }}
            </span>
          </div>
        </div>

        <!-- Geolocation & Map -->
        <div class="bg-white rounded-3xl p-4 lg:p-6 space-y-4">
          <div class="flex items-center justify-between px-1">
            <div>
              <h3 class="!text-sm font-extrabold uppercase tracking-wider text-gray-600 !m-0">
                {{ $t('playas_page.location') }}
              </h3>
            </div>
            <a
              :href="`https://www.google.com/maps/search/?api=1&query=${beach.lat},${beach.lng}`"
              target="_blank"
              class="flex items-center gap-1.5 px-3.5 py-2 !bg-primary !hover:bg-primary/90 !text-primary-foreground font-bold text-[11px] rounded-xl transition-all shrink-0"
            >
              <MapPin class="w-3.5 h-3.5" />
              {{ $t('playas_page.open_maps') }}
            </a>
          </div>

          <!-- Map Component -->

          <BeachDetailMap
            :lat="beach.lat"
            :lng="beach.lng"
            :title="beach.title"
            :bandera="beach.bandera"
            :ocupacion-state="beach.ocupacion?.state"
          />
        </div>

        <!-- Accessibility Section -->
        <div v-if="beach.accesibilidad && beach.accesibilidad.trim()" class="bg-white rounded-3xl p-4 lg:p-6 space-y-2.5">
          <div class="flex items-center gap-2">
            <div class="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
              <Accessibility class="w-4 h-4" />
            </div>
            <h3 class="!text-sm font-extrabold uppercase tracking-wider text-gray-600">
              {{ $t('playas_page.accessibility') }}
            </h3>
          </div>
          <div 
            class="text-sm text-gray-600 leading-relaxed font-normal whitespace-pre-line prose" 
            v-html="beach.accesibilidad"
          ></div>
        </div>

        <!-- Contact & Info Section -->
        <div v-if="hasContactOrInfo" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Information Point -->
          <div v-if="beach.informacion && beach.informacion.trim()" class="bg-white rounded-3xl p-4 lg:p-6 space-y-2">
            <div class="flex items-center gap-2 mb-1">
              <div class="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                <Info class="w-4 h-4" />
              </div>
              <h3 class="!text-sm font-extrabold uppercase tracking-wider text-gray-600">
                {{ $t('playas_page.information') }}
              </h3>
            </div>
            <div class="text-xs text-gray-600 leading-relaxed" v-html="beach.informacion"></div>
          </div>

          <!-- Contact Details -->
          <div v-if="beach.contacto && beach.contacto.trim()" class="bg-white rounded-3xl p-4 lg:p-6 space-y-2">
            <div class="flex items-center gap-2 mb-1">
              <div class="p-1.5 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                <Phone class="w-4 h-4" />
              </div>
              <h3 class="!text-sm font-extrabold uppercase tracking-wider text-gray-600">
                {{ $t('playas_page.contact') }}
              </h3>
            </div>
            <!-- Render WordPress rich contact HTML (like links) safely -->
            <div class="text-xs !text-primary font-semibold space-y-1 prose contact-links" v-html="beach.contacto"></div>
          </div>
        </div>
      </div>
    </ion-content>

    <Teleport to="body">
      <div
        v-if="isWeatherModalOpen && beachWeather"
        class="fixed inset-0 z-[100] h-screen w-screen overflow-y-auto text-white"
        @click="isWeatherModalOpen = false"
      >
        <WeatherBackground
          :weather-state="beachWeatherState"
          :is-day="beachWeather.current.is_day === 1"
          :is-fixed="true"
        />
        <TiempoDetalleModal
          :weather-data="beachWeather"
          :title="beachWeather.nombre"
          class="relative z-10"
          @close="isWeatherModalOpen = false"
        />
      </div>
    </Teleport>

  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import { ChevronLeft, Waves, AlertCircle, MapPin, Ruler, Expand, Accessibility, Info, Phone, Umbrella, AlertTriangle, Thermometer, Wind, Sun } from '@lucide/vue'
import { useRoute, useRouter, useLocalePath, useSeoMeta, useI18n } from '#imports'
import { useBeachesDetailed } from '~/composables/useBeachesDetailed'
import { useBeachWeather } from '~/composables/useBeachWeather'
import type { WeatherState } from '~/composables/useWeather'
import { getBeachStatusBadgeClass } from '~/utils/beachStatusStyles'
import BeachStatusFlagIcon from '@/components/BeachStatusFlagIcon.vue'
import BeachDetailMap from '@/components/BeachDetailMap.vue'
import TiempoDetalleModal from '@/components/TiempoDetalleModal.vue'

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()
const isWeatherModalOpen = ref(false)

const {
  beachesDetailed,
  isLoading,
  isError,
  fetchDetailedBeaches
} = useBeachesDetailed()

const { fetchBeachWeather, getBeachWeather } = useBeachWeather()

const beach = computed(() => {
  return beachesDetailed.value.find(b => String(b.id) === String(route.params.id))
})

const beachWeather = computed(() => {
  return beach.value ? getBeachWeather(beach.value.id) : undefined
})

const beachWeatherUv = computed(() => {
  const weather = beachWeather.value
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

const beachWeatherUvClass = computed(() => {
  const value = beachWeatherUv.value
  if (value <= 2) return 'bg-emerald-50 text-emerald-700'
  if (value <= 5) return 'bg-yellow-50 text-yellow-700'
  if (value <= 7) return 'bg-amber-50 text-amber-700'
  if (value <= 10) return 'bg-red-50 text-red-700'
  return 'bg-purple-50 text-purple-700'
})

const beachWeatherState = computed<WeatherState>(() => {
  const code = beachWeather.value?.current.weather_code
  if (code === undefined || code === null) return 'sunny'

  if (code === 0 || code === 1) return 'sunny'
  if (code === 2 || code === 3 || code === 45 || code === 48) return 'cloudy'
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) return 'rainy'
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'snowy'
  return 'sunny'
})

const parsedCharacteristics = computed(() => {
  if (!beach.value || !beach.value.caracteristicas) return {}
  const parts = beach.value.caracteristicas.split('<br />')
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

const hasCharacteristics = computed(() => {
  return !!parsedCharacteristics.value.arena || !!parsedCharacteristics.value.anchura || !!parsedCharacteristics.value.longitud
})

const hasContactOrInfo = computed(() => {
  return (beach.value?.informacion && beach.value.informacion.trim()) || 
         (beach.value?.contacto && beach.value.contacto.trim())
})

function goBack() {
  router.push(localePath('/playas'))
}

onMounted(async () => {
  await Promise.all([
    beachesDetailed.value.length === 0 ? fetchDetailedBeaches() : Promise.resolve(),
    fetchBeachWeather()
  ])
})

useSeoMeta({
  title: () => {
    const name = beach.value ? beach.value.title : ''
    return t('seo.playa_detail.title', { name })
  },
  description: () => {
    const name = beach.value ? beach.value.title : ''
    return t('seo.playa_detail.description', { name })
  }
})

function getBadgeClass(bandera: string) {
  return getBeachStatusBadgeClass(bandera)
}

</script>

<style scoped>
.custom-content {
  --background: #f9fafb;
}

/* Ensure contact links are appropriately styled */
.contact-links :deep(a) {
  color: var(--color-primary);
  font-weight: 700;
  text-decoration: underline;
  transition: opacity 0.2s;
  padding: 0px;
  margin: 0px;
}

.contact-links :deep(a:hover) {
  opacity: 0.8;
}
</style>
