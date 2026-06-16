<template>
  <ion-page>
    <ion-content class="custom-content" :scroll-y="false">
      <div class="absolute inset-0 w-full h-full">
        <!-- El mapa de Mapbox -->
        <BeachMap 
          ref="mapRef"
          :beaches="beaches"
          :selected-beach-id="selectedBeachId"
          :drawer-state="drawerState"
          :is-provisional="isProvisional"
          @marker-click="handleMarkerClick"
          @deselect="selectedBeachId = null"
        />

        <!-- Loading overlay -->
        <LoadingOverlay :visible="isLoading" />

        <!-- Error overlay -->
        <ErrorOverlay :visible="isError" @retry="fetchBeaches" />
      </div>
    </ion-content>
    
    <Teleport to="body" v-if="isMounted && !isLoading && !isError">
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
    <Teleport to="body" v-if="isMounted && !isLoading && !isError && shouldMountDrawer">
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
  import { computed, onMounted, ref, watch } from 'vue';
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

  const shouldMountDrawer = computed(() => shouldMountBeachListDrawer(isBeachListMounted.value))
  const shouldHideWeather = computed(() => shouldHideWeatherPanel(isBeachListVisible.value))

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
    await fetchBeaches()
  })

  useSeoMeta({
    title: () => t('seo.index.title'),
    description: () => t('seo.index.description'),
  })
</script>
