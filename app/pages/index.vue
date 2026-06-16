<template>
  <ion-page>
    <ion-content class="custom-content" :scroll-y="false">
      <div :class="homeLayoutClass">
        <aside
          v-if="isSplitHomeLayout"
          class="relative z-10 flex h-[100dvh] w-[min(420px,42vw)] min-w-80 flex-col overflow-hidden bg-white/95 shadow-xl backdrop-blur-xl"
        >
          <div class="shrink-0 border-b border-slate-100/80 px-4 pb-4 pt-[calc(var(--safe-area-inset-top,0px)+1rem)]">
            <div class="flex max-w-full items-center gap-2 overflow-hidden">
              <span class="min-w-0 truncate font-semibold uppercase tracking-[0.1em] text-slate-500">
                <template v-if="lastModified && lastModified.length >= 12">
                  <span class="block text-[9px] leading-none">{{ $t('last_update_label') }}</span>
                </template>
                <span class="block text-[11px] leading-tight">{{ formattedSplitHeaderDate }}</span>
              </span>
              <span
                v-if="lastModified && lastModified.length >= 12"
                class="ml-auto shrink-0 text-[9px] font-extrabold uppercase tracking-wider"
                :class="isProvisional ? 'text-amber-700' : 'text-emerald-700'"
              >
                {{ isProvisional ? $t('provisional') : $t('definitivo') }}
              </span>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto overscroll-contain bg-gradient-to-b from-white via-white to-slate-50/80 px-4 pt-4 pb-6">
            <BeachList :beaches="beaches" @select-beach="selectBeach" :fechas-servicio="fechasServicio" />
          </div>
        </aside>

        <!-- El mapa de Mapbox -->
        <div :class="mapPaneClass">
          <BeachMap 
            ref="mapRef"
            :beaches="beaches"
            :selected-beach-id="selectedBeachId"
            :drawer-state="mapDrawerState"
            :is-provisional="isProvisional"
            @marker-click="handleMarkerClick"
            @deselect="selectedBeachId = null"
          />
        </div>

        <!-- Loading overlay -->
        <LoadingOverlay :visible="isLoading" />

        <!-- Error overlay -->
        <ErrorOverlay :visible="isError" @retry="fetchBeaches" />
      </div>
    </ion-content>
    
    <Teleport to="body" v-if="isMounted && !isLoading && !isError && !isSplitHomeLayout">
      <button
        type="button"
        class="fixed z-50 box-border inline-flex size-12 min-h-12 min-w-12 max-h-12 max-w-12 appearance-none items-center justify-center overflow-hidden !rounded-full bg-white p-0 text-primary shadow-lg backdrop-blur transition hover:bg-white/90"
        style="top: calc(var(--safe-area-inset-top, 0px) + 44px); right: 16px;"
        :aria-label="isBeachListVisible ? t('weather.close') : t('components.bottom_nav.beaches')"
        :aria-expanded="isBeachListVisible"
        @click="toggleBeachList"
      >
        <X v-if="isBeachListVisible" class="size-6" aria-hidden="true" />
        <MapPinSearch v-else class="size-6" aria-hidden="true" />
      </button>
    </Teleport>

    <Teleport to="body" v-if="isMounted && !isLoading && !isError">
      <Transition name="weather-fade">
        <TiempoPortada v-if="!shouldHideWeather" />
      </Transition>
    </Teleport>

    <!-- Drawer Personalizado con Soporte Táctil -->
    <Teleport to="body" v-if="isMounted && !isLoading && !isError && !isSplitHomeLayout && shouldMountDrawer">
      <CustomDrawer 
        ref="drawerRef"
        :last-modified="lastModified"
        :is-provisional="isProvisional"
        :start-hidden="true"
        :target-state="drawerTargetState"
        :lock-at-mid="true"
        @state-change="handleDrawerStateChange"
        @drag="handleDrawerDrag"
      >
        <!-- Leyenda
        <BeachLegend />  -->

        <!-- Listado de Playas -->
        <BeachList :beaches="beaches" @select-beach="selectBeach" :fechas-servicio="fechasServicio" />
      </CustomDrawer>
    </Teleport>
  </ion-page>
</template>

<style scoped>
  .custom-content {
    --background: #f9fafb;
    --padding-top: 0px;
    --padding-bottom: 0px;
    --padding-start: 0px;
    --padding-end: 0px;
  }

  .weather-fade-enter-active,
  .weather-fade-leave-active {
    transition: opacity 0.25s ease;
  }

  .weather-fade-enter-from,
  .weather-fade-leave-to {
    opacity: 0;
  }
</style>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
  import { IonContent, IonPage } from '@ionic/vue';
  import { MapPinSearch, X } from '@lucide/vue';
  import CustomDrawer from '@/components/CustomDrawer.vue';
  import BeachMap from '@/components/BeachMap.vue';
  import BeachList from '@/components/BeachList.vue';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import ErrorOverlay from '@/components/ErrorOverlay.vue';
  import type { Beach } from '~/types/beach';
  import {
    createBeachListStateController,
    shouldHideWeatherPanel,
    shouldMountBeachListDrawer,
    shouldUseHomeSplitLayout,
    type DrawerTargetState,
    type DrawerState
  } from './index.mobile-beach-list';
  import { useLocalePath, useSeoMeta, useI18n, useState } from '#imports';
  import { useBeaches } from '~/composables/useBeaches';

  const localePath = useLocalePath()
  const { t } = useI18n()
  
  const drawerState = ref<DrawerState>('peek')
  const isMounted = ref(false)
  const isBeachListMounted = ref(false)
  const isBeachListVisible = ref(false)
  const drawerTargetState = ref<DrawerTargetState>('peek')
  const selectedBeachId = ref<number | string | null>(null)
  const viewportWidth = ref(0)
  const viewportHeight = ref(0)
  
  const mapRef = ref<any>(null)
  const drawerRef = ref<any>(null)

  const bottomNavZIndex = useState<number>('bottomNavZIndex')
  watch(drawerState, (state) => {
    bottomNavZIndex.value = state === 'full' || isBeachListVisible.value ? 10 : 9999
  }, { immediate: true })

  watch(isBeachListVisible, (isVisible) => {
    bottomNavZIndex.value = drawerState.value === 'full' || isVisible ? 10 : 9999
  })

  const { 
    beaches, 
    fechasServicio, 
    lastModified, 
    isProvisional, 
    isLoading, 
    isError, 
    fetchBeaches 
  } = useBeaches()

  const isSplitHomeLayout = computed(() => shouldUseHomeSplitLayout(viewportWidth.value, viewportHeight.value))
  const homeLayoutClass = computed(() => isSplitHomeLayout.value
    ? 'relative flex h-[100dvh] w-full overflow-hidden bg-[#f9fafb]'
    : 'absolute inset-0 h-full w-full'
  )
  const mapPaneClass = computed(() => isSplitHomeLayout.value
    ? 'relative h-[100dvh] min-w-0 flex-1'
    : 'absolute inset-0 h-full w-full'
  )
  const mapDrawerState = computed<DrawerState>(() => isSplitHomeLayout.value ? 'full' : drawerState.value)
  const shouldMountDrawer = computed(() => shouldMountBeachListDrawer(isBeachListMounted.value))
  const shouldHideWeather = computed(() => shouldHideWeatherPanel(isBeachListVisible.value, isSplitHomeLayout.value))
  const formattedSplitHeaderDate = computed(() => {
    if (!lastModified.value || lastModified.value.length < 12) return t('drawer.explore_fallback')
    const year = lastModified.value.substring(0, 4)
    const month = lastModified.value.substring(4, 6)
    const day = lastModified.value.substring(6, 8)
    const hour = lastModified.value.substring(8, 10)
    const minute = lastModified.value.substring(10, 12)
    return `${day}/${month}/${year} ${hour}:${minute}`
  })

  function updateViewportSize() {
    if (!import.meta.client) return
    viewportWidth.value = window.innerWidth
    viewportHeight.value = window.innerHeight
  }

  function handleMarkerClick(beach: Beach) {
    selectedBeachId.value = beach.id
    if (drawerRef.value && drawerState.value === 'full') {
      drawerRef.value.setState('peek')
    }
  }

  const {
    toggleBeachList,
    handleDrawerStateChange
  } = createBeachListStateController({
    isBeachListMounted,
    isBeachListVisible,
    drawerState,
    drawerTargetState
  }, {
    isClient: import.meta.client,
    setTimeout: import.meta.client ? window.setTimeout.bind(window) : undefined
  })

  function selectBeach(beach: Beach) {
    selectedBeachId.value = beach.id
    if (mapRef.value) {
      mapRef.value.focusOnBeach(beach)
    }
    if (drawerRef.value && drawerState.value === 'full') {
      drawerRef.value.setState('peek')
    }
  }

  function handleDrawerDrag(translateY: number) {
    if (mapRef.value) {
      mapRef.value.updateBottomPadding(translateY)
    }
  }

  onMounted(async () => {
    isMounted.value = true
    updateViewportSize()
    window.addEventListener('resize', updateViewportSize)
    await fetchBeaches()
  })

  onUnmounted(() => {
    if (import.meta.client) {
      window.removeEventListener('resize', updateViewportSize)
    }
  })

  useSeoMeta({
    title: () => t('seo.index.title'),
    description: () => t('seo.index.description'),
  })
</script>
