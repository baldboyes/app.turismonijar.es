<template>
  <ion-page>
    <!-- Header with Back Button -->
    <header class="custom-header bg-white border-b border-gray-100 p-4 shrink-0 select-none">
      <div class="max-w-[1024px] mx-auto flex items-center gap-3">
        <button
          @click="goBack"
          class="p-2 -ml-2 rounded-xl hover:bg-gray-50 text-gray-500 active:scale-95 transition-all"
        >
          <ChevronLeft class="w-6 h-6" />
        </button>
        <h1 class="text-lg font-extrabold text-gray-800 truncate">
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
      <div v-else class="max-w-[1024px] mx-auto p-4 space-y-5 pb-24">
        <!-- Hero image with flag overlay -->
        <div class="relative w-full h-64 rounded-3xl overflow-hidden shadow-md bg-gray-100 shrink-0">
          <NuxtImg
            v-if="beach.src"
            :src="beach.src"
            :alt="beach.title"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-800">
            <Waves class="w-16 h-16 opacity-30" />
          </div>

          <!-- Live Flag status overlay -->
          <div 
            v-if="beach.bandera"
            class="absolute bottom-4 left-4 px-4 py-2 rounded-2xl text-xs font-black tracking-wider uppercase shadow-lg flex items-center gap-2 backdrop-blur-md"
            :class="getBadgeClass(beach.bandera)"
          >
            <span class="size-2.5 rounded-full shrink-0" :class="getDotColorClass(beach.bandera)"></span>
            {{ $t(beach.bandera.toLowerCase()) }}
          </div>
        </div>

        <!-- Description Section -->
        <div v-if="beach.description" class="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-2">
          <h3 class="text-xs font-extrabold uppercase tracking-wider text-gray-400">
            {{ $t('playas_page.description') }}
          </h3>
          <div 
            class="text-sm text-gray-600 leading-relaxed font-normal whitespace-pre-line prose max-w-none" 
            v-html="beach.description"
          ></div>
        </div>

        <!-- Grid of Characteristics -->
        <div v-if="hasCharacteristics" class="grid grid-cols-3 gap-3">
          <div 
            v-if="parsedCharacteristics.arena" 
            class="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm text-center flex flex-col items-center justify-center"
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
            class="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm text-center flex flex-col items-center justify-center"
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
            class="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm text-center flex flex-col items-center justify-center"
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
        <div class="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm space-y-4">
          <div class="flex items-center justify-between px-1">
            <div>
              <h3 class="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                {{ $t('playas_page.location') }}
              </h3>
              <p class="text-[10px] font-semibold text-gray-500 mt-0.5">
                {{ beach.lat.toFixed(6) }}, {{ beach.lng.toFixed(6) }}
              </p>
            </div>
            <a
              :href="`https://www.google.com/maps/search/?api=1&query=${beach.lat},${beach.lng}`"
              target="_blank"
              class="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] rounded-xl transition-all shadow-inner shrink-0"
            >
              <MapPin class="w-3.5 h-3.5" />
              {{ $t('playas_page.open_maps') }}
            </a>
          </div>

          <!-- Map Component -->
          <div class="h-56 w-full rounded-2xl overflow-hidden relative">
            <BeachDetailMap
              :lat="beach.lat"
              :lng="beach.lng"
              :title="beach.title"
              :bandera="beach.bandera"
            />
          </div>
        </div>

        <!-- Accessibility Section -->
        <div v-if="beach.accesibilidad && beach.accesibilidad.trim()" class="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-2.5">
          <div class="flex items-center gap-2">
            <div class="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
              <Accessibility class="w-4 h-4" />
            </div>
            <h3 class="text-xs font-extrabold uppercase tracking-wider text-gray-400">
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
          <div v-if="beach.informacion && beach.informacion.trim()" class="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-2">
            <div class="flex items-center gap-2 mb-1">
              <div class="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                <Info class="w-4 h-4" />
              </div>
              <h3 class="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                {{ $t('playas_page.information') }}
              </h3>
            </div>
            <div class="text-xs text-gray-600 leading-relaxed" v-html="beach.informacion"></div>
          </div>

          <!-- Contact Details -->
          <div v-if="beach.contacto && beach.contacto.trim()" class="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-2">
            <div class="flex items-center gap-2 mb-1">
              <div class="p-1.5 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                <Phone class="w-4 h-4" />
              </div>
              <h3 class="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                {{ $t('playas_page.contact') }}
              </h3>
            </div>
            <!-- Render WordPress rich contact HTML (like links) safely -->
            <div class="text-xs text-emerald-600 font-semibold space-y-1 prose contact-links" v-html="beach.contacto"></div>
          </div>
        </div>
      </div>
    </ion-content>

    <!-- Footer -->
    <ion-footer>
      <BottomNav class="fixed bottom-0 left-0 right-0 w-full" style="z-index: 50;" />
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { IonPage, IonContent, IonFooter } from '@ionic/vue'
import { ChevronLeft, Waves, AlertCircle, MapPin, Ruler, Expand, Accessibility, Info, Phone, Umbrella } from '@lucide/vue'
import { useRoute, useRouter, useLocalePath, useSeoMeta, useI18n } from '#imports'
import { useBeachesDetailed } from '~/composables/useBeachesDetailed'
import BeachDetailMap from '@/components/BeachDetailMap.vue'
import BottomNav from '@/components/BottomNav.vue'

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()

const {
  beachesDetailed,
  isLoading,
  isError,
  fetchDetailedBeaches
} = useBeachesDetailed()

const beach = computed(() => {
  return beachesDetailed.value.find(b => String(b.id) === String(route.params.id))
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
  if (beachesDetailed.value.length === 0) {
    await fetchDetailedBeaches()
  }
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
  const b = bandera.toLowerCase()
  if (b === 'verde') return 'bg-emerald-500/90 text-white'
  if (b === 'amarilla') return 'bg-amber-400/90 text-gray-900'
  if (b === 'amarilla_por_medusa') return 'bg-orange-500/90 text-white'
  if (b === 'roja') return 'bg-red-600/90 text-white'
  return 'bg-gray-500/90 text-white'
}

function getDotColorClass(bandera: string) {
  const b = bandera.toLowerCase()
  if (b === 'verde') return 'bg-white'
  if (b === 'amarilla') return 'bg-gray-900'
  if (b === 'amarilla_por_medusa') return 'bg-white'
  if (b === 'roja') return 'bg-white'
  return 'bg-white'
}
</script>

<style scoped>
.custom-content {
  --background: #f9fafb;
}

/* Ensure contact links are appropriately styled */
.contact-links :deep(a) {
  color: var(--color-emerald-600);
  font-weight: 700;
  text-decoration: underline;
  transition: opacity 0.2s;
}

.contact-links :deep(a:hover) {
  opacity: 0.8;
}
</style>
