<template>
  <ion-page>
    <!-- Cabecera Premium compatible con Notch/Safe Area -->
    <header class="custom-header bg-white border-b border-gray-100 p-4 shrink-0 transition-all select-none">
      <div class="max-w-[1024px] mx-auto flex items-center justify-between">
        <h1 class="text-xl font-extrabold text-gray-800">{{ $t('ajustes') }}</h1>
        <div class="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg text-gray-400">
          <Settings class="w-5 h-5" />
        </div>
      </div>
    </header>

    <ion-content class="custom-content">
      <div class="max-w-[1024px] mx-auto p-4 space-y-6">
        <!-- Language Switcher Card Component -->
        <LanguageSwitcher />

        <!-- App info card -->
        <div class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <h3 class="text-sm font-bold text-gray-800 mb-1">{{ $t('settings_panel.info_title') }}</h3>
          <p class="text-xs text-gray-500 mb-4">{{ $t('settings_panel.info_subtitle') }}</p>
          <div class="divide-y divide-gray-100 text-xs">
            <div class="flex justify-between py-2.5">
              <span class="text-gray-500 font-semibold">{{ $t('settings_panel.version') }}</span>
              <span class="text-gray-800 font-bold">1.0.0</span>
            </div>
            <div class="flex justify-between py-2.5">
              <span class="text-gray-500 font-semibold">{{ $t('settings_panel.framework') }}</span>
              <span class="text-gray-800 font-bold">Nuxt 4 / Vue 3</span>
            </div>
            <div class="flex justify-between py-2.5">
              <span class="text-gray-500 font-semibold">{{ $t('settings_panel.environment') }}</span>
              <span class="text-gray-800 font-bold">Capacitor Native (iOS / Android)</span>
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <ion-footer>
      <BottomNav />
    </ion-footer>
  </ion-page>
</template>

<style scoped>
  .custom-content {
    --background: #f9fafb;
  }
</style>

<script setup lang="ts">
  import { IonContent, IonPage, IonFooter } from '@ionic/vue';
  import { Settings } from '@lucide/vue';
  import LanguageSwitcher from '@/components/LanguageSwitcher.vue';
  import BottomNav from '@/components/BottomNav.vue';
  import { useSeoMeta, useI18n } from '#imports'
  
  const { t } = useI18n()

  useSeoMeta({
    title: () => t('seo.settings.title'),
    description: () => t('seo.settings.description'),
  })
</script>