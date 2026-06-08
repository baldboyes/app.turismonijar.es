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
      <TiempoPortada />
    </Teleport>

    <!-- Drawer Personalizado con Soporte Táctil -->
    <Teleport to="body" v-if="isMounted && !isLoading && !isError">
      <CustomDrawer 
        ref="drawerRef"
        :last-modified="lastModified"
        :is-provisional="isProvisional"
        @state-change="state => drawerState = state"
        @drag="handleDrawerDrag"
      >
        <!-- Leyenda -->
        <BeachLegend />

        <!-- Listado de Playas -->
        <BeachList :beaches="beaches" @select-beach="selectBeach" :fechas-servicio="fechasServicio" />
      </CustomDrawer>
    </Teleport>

    <!-- Teleportar el BottomNav directamente a body como elemento fijo (100% de anchura) -->
    <Teleport to="body" v-if="isMounted">
      <BottomNav 
        :style="{ zIndex: drawerState === 'full' ? 10 : 50 }"
        class="fixed bottom-0 left-0 right-0 w-full"
      />
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
</style>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { IonContent, IonPage } from '@ionic/vue';
  import CustomDrawer from '@/components/CustomDrawer.vue';
  import BeachMap from '@/components/BeachMap.vue';
  import BeachLegend from '@/components/BeachLegend.vue';
  import BeachList from '@/components/BeachList.vue';
  import LoadingOverlay from '@/components/LoadingOverlay.vue';
  import ErrorOverlay from '@/components/ErrorOverlay.vue';
  import type { Beach } from '~/types/beach';
  import { useLocalePath, useSeoMeta, useI18n } from '#imports';
  import { useBeaches } from '~/composables/useBeaches';

  const localePath = useLocalePath()
  const { t } = useI18n()
  
  const drawerState = ref<'peek' | 'mid' | 'full'>('peek')
  const isMounted = ref(false)
  const selectedBeachId = ref<number | string | null>(null)
  
  const mapRef = ref<any>(null)
  const drawerRef = ref<any>(null)

  const { 
    beaches, 
    fechasServicio, 
    lastModified, 
    isProvisional, 
    isLoading, 
    isError, 
    fetchBeaches 
  } = useBeaches()

  function handleMarkerClick(beach: Beach) {
    selectedBeachId.value = beach.id
    if (drawerRef.value && drawerState.value === 'full') {
      drawerRef.value.setState('peek')
    }
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
    await fetchBeaches()
  })

  useSeoMeta({
    title: () => t('seo.index.title'),
    description: () => t('seo.index.description'),
  })
</script>