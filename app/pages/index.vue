<template>
  <ion-page>
    <ion-content class="custom-content" :scroll-y="false">
      <div :class="homeLayoutClass">
        <aside
          v-if="isSplitHomeLayout"
          class="absolute inset-y-10 left-10 z-10 flex w-[min(420px,42vw)] min-w-80 flex-col overflow-hidden rounded-[2rem] bg-white/95 shadow-2xl backdrop-blur-xl"
        >
          <div class="shrink-0 border-b border-slate-100/80 px-4 pb-4 pt-[calc(var(--safe-area-inset-top,0px)+1rem)]">
            <div class="flex max-w-full items-center gap-2 overflow-hidden">
              <img src="/favicon.svg" alt="" aria-hidden="true" class="size-8 shrink-0" />
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
            :fit-bounds-padding-top="mapFitBoundsPaddingTop"
            :fit-bounds-padding-bottom="mapFitBoundsPaddingBottom"
            :fit-bounds-padding-left="mapFitBoundsPaddingLeft"
            :is-provisional="isProvisional"
            :external-weather-detail="true"
            @marker-click="handleMarkerClick"
            @weather-click="openSplitWeather"
            @deselect="selectedBeachId = null"
          />
        </div>

        <Transition name="weather-fade">
          <div
            v-if="isMounted && !isLoading && !isError && splitWeatherOpen && splitWeatherData"
            class="fixed inset-0 z-[9] h-screen w-screen overflow-y-auto text-white"
            @click="closeSplitWeather"
          >
            <WeatherBackground
              :weather-state="selectedWeatherState"
              :is-day="splitWeatherData.current.is_day === 1"
              :is-fixed="true"
            />
            <TiempoDetalleModal
              :weather-data="splitWeatherData"
              :title="splitWeatherTitle"
              :is-refreshing="isWeatherRefreshing"
              :is-error="isWeatherError"
              :last-update="weatherLastUpdate"
              :layout="isSplitHomeLayout ? 'split-map' : 'default'"
              :beaches="isSplitHomeLayout ? [] : beaches"
              :selected-beach-id="selectedBeachId"
              class="relative z-10"
              @close="closeSplitWeather"
              @select-beach="selectWeatherBeach"
            />
          </div>
        </Transition>

        <!-- Loading overlay -->
        <LoadingOverlay :visible="isLoading" />

        <!-- Error overlay -->
        <ErrorOverlay :visible="isError" @retry="fetchBeaches" />
      </div>
    </ion-content>
    
    <Teleport to="body" v-if="isMounted && !isLoading && !isError && !isSplitHomeLayout && !splitWeatherOpen">
      <button
        type="button"
        :class="[
          'fixed z-[10020] box-border inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 select-none',
          isBeachListVisible 
            ? 'w-11 h-11 !rounded-full !p-0' 
            : 'flex-col !p-3 !gap-1.5 !rounded-2xl'
        ]"
        :style="{
          top: isBeachListVisible ? 'calc(var(--safe-area-inset-top, 0px) + 46px)' : 'auto',
          bottom: isBeachListVisible ? 'auto' : 'calc(var(--safe-area-inset-bottom, 0px) + 80px)',
          right: '16px'
        }"
        :aria-label="isBeachListVisible ? t('weather.close') : t('components.header.list_flags')"
        :aria-expanded="isBeachListVisible"
        @click="toggleBeachList"
      >
        <X v-if="isBeachListVisible" class="size-5" aria-hidden="true" />
        <template v-else>
          <BeachStatusFlagIcon use-current-color class="size-5.5 text-white" />
          <span class="text-[9px] font-black uppercase tracking-wider text-center leading-tight max-w-[65px]">
            {{ t('components.header.list_flags') }}
          </span>
        </template>
      </button>
    </Teleport>

    <Teleport to="body" v-if="isMounted && !isLoading && !isError">
      <FlagNotificationModal
        v-if="flagNotificationModalOpen && visibleNotificationMessage"
        :message="visibleNotificationMessage"
        :close-label="t('weather.close')"
        @close="closeFlagNotificationModal"
      />
    </Teleport>

    <Teleport to="body" v-if="isMounted && !isLoading && !isError">
      <Transition name="weather-fade">
        <TiempoPortada
          v-if="!shouldHideWeather"
          :position="isSplitHomeLayout ? 'split-map' : 'default'"
          :external-detail="true"
          @open-detail="openSplitWeather()"
        />
      </Transition>
    </Teleport>

    <!-- Drawer Personalizado con Soporte Táctil -->
    <Teleport to="body" v-if="isMounted && !isLoading && !isError && !isSplitHomeLayout && shouldMountDrawer">
      <CustomDrawer 
        ref="drawerRef"
        :last-modified="lastModified"
        :is-provisional="isProvisional"
        :start-hidden="false"
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

    <Teleport to="body" v-if="isMounted">
      <OnboardingModal />
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
  import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
  import { IonContent, IonPage } from '@ionic/vue';
  import { X } from '@lucide/vue';
  import CustomDrawer from '@/components/CustomDrawer.vue';
  import BeachMap from '@/components/BeachMap.vue';
  import BeachList from '@/components/BeachList.vue';
  import TiempoDetalleModal from '@/components/TiempoDetalleModal.vue';
  import WeatherBackground from '@/components/WeatherBackground.vue';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import ErrorOverlay from '@/components/ErrorOverlay.vue';
  import BeachStatusFlagIcon from '@/components/BeachStatusFlagIcon.vue';
  import FlagNotificationModal from '@/components/FlagNotificationModal.vue';
  import OnboardingModal from '@/components/OnboardingModal.vue';
  import type { Beach } from '~/types/beach';
  import type { WeatherState } from '~/composables/useWeather';
  import {
    createBeachListStateController,
    getHomeSplitMapLeftPadding,
    getSplitWeatherTitle,
    HOME_SPLIT_MAP_PADDING_BOTTOM,
    HOME_SPLIT_MAP_PADDING_TOP,
    shouldHideWeatherPanel,
    shouldMountBeachListDrawer,
    shouldUseHomeSplitLayout,
    type DrawerTargetState,
    type DrawerState
  } from './index.mobile-beach-list';
  import { useLocalePath, useSeoMeta, useI18n, useState } from '#imports';
  import { useBeaches } from '~/composables/useBeaches';
  import { useBeachWeather } from '~/composables/useBeachWeather';
  import { useBeachWeatherAggregate } from '~/composables/useBeachWeatherAggregate';
  import { closeFlagNotificationModalState, syncFlagNotificationModalState } from '~/utils/flagNotification';

  const localePath = useLocalePath()
  const { t } = useI18n()
  
  const drawerState = ref<DrawerState>('mid')
  const isMounted = ref(false)
  const isBeachListMounted = ref(true)
  const isBeachListVisible = ref(true)
  const drawerTargetState = ref<DrawerTargetState>('mid')
  const selectedBeachId = ref<number | string | null>(null)
  const splitWeatherOpen = ref(false)
  const flagNotificationModalOpen = ref(false)
  const dismissedNotificationMessage = useState<string | null>('dismissedFlagNotificationMessage', () => null)
  const viewportWidth = ref(0)
  const viewportHeight = ref(0)
  
  const mapRef = ref<any>(null)
  const drawerRef = ref<any>(null)

  const isSplitHomeLayout = computed(() => shouldUseHomeSplitLayout(viewportWidth.value, viewportHeight.value))

  const bottomNavZIndex = useState<number>('bottomNavZIndex')

  function updateBottomNavZIndex() {
    if (splitWeatherOpen.value) {
      bottomNavZIndex.value = 0
      return
    }

    if (isSplitHomeLayout.value) {
      bottomNavZIndex.value = 9999
      return
    }

    bottomNavZIndex.value = drawerState.value === 'full' || isBeachListVisible.value ? 10 : 9999
  }

  watch(drawerState, updateBottomNavZIndex, { immediate: true })

  watch(isBeachListVisible, () => {
    updateBottomNavZIndex()
  })
  watch(splitWeatherOpen, updateBottomNavZIndex)
  watch(isSplitHomeLayout, updateBottomNavZIndex)

  const { 
    beaches, 
    fechasServicio, 
    lastModified, 
    isProvisional, 
    isLoading, 
    isError, 
    visibleNotificationMessage,
    fetchBeaches 
  } = useBeaches()

  watch(visibleNotificationMessage, (message) => {
    const state = syncFlagNotificationModalState({
      open: flagNotificationModalOpen.value,
      dismissedMessage: dismissedNotificationMessage.value
    }, message)

    flagNotificationModalOpen.value = state.open
    dismissedNotificationMessage.value = state.dismissedMessage
  }, { immediate: true })
  const {
    fetchBeachWeather,
    beachesWeather,
    getBeachWeather,
    isRefreshing: isWeatherRefreshing,
    isError: isWeatherError,
    lastUpdate: weatherLastUpdate
  } = useBeachWeather()
  const beachWeatherItems = computed(() => Object.values(beachesWeather.value))
  const { aggregateWeatherData } = useBeachWeatherAggregate(() => beachWeatherItems.value)

  const homeLayoutClass = computed(() => isSplitHomeLayout.value
    ? 'relative h-[100dvh] w-full overflow-hidden bg-[#f9fafb]'
    : 'absolute inset-0 h-full w-full'
  )
  const mapPaneClass = computed(() => isSplitHomeLayout.value
    ? 'absolute inset-0 h-full w-full'
    : 'absolute inset-0 h-full w-full'
  )
  const mapFitBoundsPaddingLeft = computed(() => isSplitHomeLayout.value
    ? getHomeSplitMapLeftPadding(viewportWidth.value)
    : 45
  )
  const mapFitBoundsPaddingTop = computed(() => isSplitHomeLayout.value ? HOME_SPLIT_MAP_PADDING_TOP : undefined)
  const mapFitBoundsPaddingBottom = computed(() => {
    if (isSplitHomeLayout.value) return HOME_SPLIT_MAP_PADDING_BOTTOM
    if (!isBeachListVisible.value) return 100
    return undefined
  })
  const mapDrawerState = computed<DrawerState>(() => {
    if (isSplitHomeLayout.value) return 'full'
    if (!isBeachListVisible.value) return 'peek'
    return drawerState.value
  })
  const shouldMountDrawer = computed(() => shouldMountBeachListDrawer(isBeachListMounted.value))
  const selectedWeather = computed(() => selectedBeachId.value === null ? undefined : getBeachWeather(selectedBeachId.value))
  const selectedBeach = computed(() => selectedBeachId.value === null
    ? undefined
    : beaches.value.find(item => String(item.id) === String(selectedBeachId.value))
  )
  const splitWeatherData = computed(() => selectedWeather.value ?? aggregateWeatherData.value)
  const splitWeatherTitle = computed(() => getSplitWeatherTitle(
    selectedBeach.value?.title,
    selectedWeather.value?.nombre,
    t('weather.details_title')
  ))
  const shouldHideWeather = computed(() => splitWeatherOpen.value && !!splitWeatherData.value
    ? true
    : shouldHideWeatherPanel(isBeachListVisible.value, isSplitHomeLayout.value)
  )
  const selectedWeatherState = computed<WeatherState>(() => {
    const code = splitWeatherData.value?.current.weather_code
    if (code === undefined || code === null) return 'sunny'

    if (code === 0 || code === 1) return 'sunny'
    if (code === 2 || code === 3 || code === 45 || code === 48) return 'cloudy'
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) return 'rainy'
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'snowy'
    return 'sunny'
  })
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

  function openSplitWeather(beachId?: string | number) {
    if (beachId !== undefined) {
      selectedBeachId.value = beachId
    } else {
      selectedBeachId.value = null
    }
    splitWeatherOpen.value = true
  }

  function closeSplitWeather() {
    splitWeatherOpen.value = false
  }

  function closeFlagNotificationModal() {
    const state = closeFlagNotificationModalState({
      open: flagNotificationModalOpen.value,
      dismissedMessage: dismissedNotificationMessage.value
    }, visibleNotificationMessage.value)

    flagNotificationModalOpen.value = state.open
    dismissedNotificationMessage.value = state.dismissedMessage
  }

  async function selectWeatherBeach(beachId: string | number) {
    const beach = beaches.value.find(item => String(item.id) === String(beachId))
    if (!beach) return

    selectedBeachId.value = beach.id
    await nextTick()
    if (mapRef.value) {
      mapRef.value.focusOnBeach(beach)
    }
  }

  const {
    toggleBeachList,
    handleDrawerStateChange: originalHandleDrawerStateChange
  } = createBeachListStateController({
    isBeachListMounted,
    isBeachListVisible,
    drawerState,
    drawerTargetState
  }, {
    isClient: import.meta.client,
    setTimeout: import.meta.client ? window.setTimeout.bind(window) : undefined
  })

  function handleDrawerStateChange(state: any) {
    originalHandleDrawerStateChange(state)
  }

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
    await fetchBeachWeather()
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
