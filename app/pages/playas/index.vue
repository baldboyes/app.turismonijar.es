<template>
  <ion-page>
    <!-- Header -->
    <header class="custom-header bg-white border-b border-gray-100 p-4 shrink-0 select-none">
      <div class="max-w-[1024px] mx-auto flex items-center justify-between">
        <h1 class="text-xl font-extrabold text-gray-800">{{ $t('playas_page.title') }}</h1>
        <div class="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
          <Waves class="w-5 h-5" />
        </div>
      </div>
    </header>

    <!-- Content -->
    <ion-content class="custom-content">
      <div class="max-w-[1024px] mx-auto p-4 space-y-4 pb-20">
        <!-- Search and Filters Section -->
        <div class="space-y-3">
          <!-- Search Input -->
          <div class="relative flex items-center bg-white rounded-2xl border border-gray-100 shadow-sm p-1">
            <Search class="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              v-model="searchQuery"
              :placeholder="$t('playas_page.search_placeholder')"
              class="w-full bg-transparent pl-10 pr-10 py-2.5 text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none border-none"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-3 p-1 rounded-full hover:bg-gray-100 text-gray-400 active:scale-95 transition-all"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Flag Filters
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
            <button
              v-for="filter in filters"
              :key="filter.value"
              @click="selectedFlagFilter = filter.value"
              class="px-4 py-2 text-xs font-bold rounded-xl border transition-all whitespace-nowrap active:scale-[0.98]"
              :class="selectedFlagFilter === filter.value 
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/20' 
                : 'bg-white border-gray-100 text-gray-500 hover:text-gray-800 hover:border-gray-200'"
            >
              {{ filter.label }}
            </button>
          </div>
          -->
        </div>

        <!-- Skeleton Loading State -->
        <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="n in 6" :key="n" class="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse flex flex-col h-76">
            <div class="w-full h-44 bg-gray-200"></div>
            <div class="p-4 flex-1 space-y-3">
              <div class="h-4 bg-gray-200 rounded w-2/3"></div>
              <div class="h-3 bg-gray-200 rounded w-full"></div>
              <div class="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="isError" class="bg-white rounded-2xl border border-red-100 p-8 text-center max-w-md mx-auto shadow-sm">
          <div class="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle class="w-6 h-6" />
          </div>
          <h3 class="font-bold text-gray-800 text-base mb-1">{{ $t('error_overlay.title') }}</h3>
          <p class="text-xs text-gray-500 mb-4">{{ $t('error_overlay.message') }}</p>
          <button
            @click="fetchDetailedBeaches(true)"
            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.97]"
          >
            {{ $t('error_overlay.retry') }}
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredBeaches.length === 0" class="bg-white rounded-2xl border border-gray-100 p-8 text-center max-w-md mx-auto shadow-sm">
          <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search class="w-6 h-6" />
          </div>
          <h3 class="font-bold text-gray-800 text-base mb-1">{{ $t('playas_page.no_results') }}</h3>
        </div>

        <!-- Beaches List Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BeachCard
            v-for="beach in filteredBeaches"
            :key="beach.id"
            :beach="beach"
            @click="navigateToBeach(beach.id)"
          />
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
import { Waves, Search, X, AlertCircle } from '@lucide/vue'
import { useLocalePath, useSeoMeta, useI18n, useRouter } from '#imports'
import { useBeachesDetailed } from '~/composables/useBeachesDetailed'
import BeachCard from '~/components/BeachCard.vue'
import BottomNav from '~/components/BottomNav.vue'

const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()

const {
  isLoading,
  isError,
  searchQuery,
  selectedFlagFilter,
  filteredBeaches,
  fetchDetailedBeaches
} = useBeachesDetailed()

const filters = computed(() => [
  { value: 'all', label: t('playas_page.filter_all') },
  { value: 'verde', label: t('verde') },
  { value: 'amarilla', label: t('amarilla') },
  { value: 'roja', label: t('roja') },
  { value: 'sin_bandera', label: t('playas_page.filter_non_monitored') }
])

function navigateToBeach(id: string | number) {
  router.push(localePath(`/playas/${id}`))
}

onMounted(async () => {
  await fetchDetailedBeaches()
})

useSeoMeta({
  title: () => t('seo.playas.title'),
  description: () => t('seo.playas.description'),
})
</script>

<style scoped>
.custom-content {
  --background: #f9fafb;
}
/* Hide scrollbar on chrome/safari */
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
/* Hide scrollbar on firefox */
.scrollbar-none {
  scrollbar-width: none;
}
</style>
