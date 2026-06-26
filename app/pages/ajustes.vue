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
      <div class="max-w-[1024px] mx-auto p-4 space-y-6 pb-28">
        <!-- Language Switcher Card Component -->
        <LanguageSwitcher />

        <!-- Logo -->
        <div class="flex flex-col gap-4 items-center justify-center mt-18 mb-8">
          <img src="/turismonijar.svg" :alt="$t('title1')" class="w-32 lg:w-48 h-auto mx-auto" />


          <!-- Contacto -->
          <div class="flex flex-wrap lg:flex-nowrap gap-2 lg:gap-4 items-center justify-center text-xs">
            <div>
              <a href="https://www.turismonijar.es" target="_blank">turismonijar.es</a>
            </div>
            <div>
              <a href="mailto:turismo@nijar.es">turismo@nijar.es</a>
            </div>
            <div>
              <a href="tel:+34950612165">+34950612165</a>
            </div>
          </div>


          <!-- Logos -->
          <div class="flex flex-wrap lg:flex-nowrap gap-4 lg:gap-8 pt-8 lg:pt-12 items-center justify-center text-xs">
            <div>
              <img src="/logos/01.webp" alt="" class="h-10 lg:h-12 w-auto object-contain" />
            </div>
            <div>
              <img src="/logos/02.webp" alt="" class="h-10 lg:h-12 w-auto object-contain" />
            </div>
            <div>
              <img src="/logos/03.webp" alt="" class="h-10 lg:h-12 w-auto object-contain" />
            </div>
            <div>
              <img src="/logos/04.webp" alt="" class="h-10 lg:h-12 w-auto object-contain" />
            </div>
          </div>


          <AppVersion class="justify-center w-full opacity-70" />

        </div>

      </div>
    </ion-content>

  </ion-page>
</template>

<style scoped>
  .custom-content {
    --background: #f9fafb;
  }
</style>

<script setup lang="ts">
  import { IonContent, IonPage } from '@ionic/vue';
  import { Settings } from '@lucide/vue';
  import LanguageSwitcher from '@/components/LanguageSwitcher.vue';
  import AppVersion from '@/components/AppVersion.vue';
  import { useSeoMeta, useI18n } from '#imports'
  
  const { t } = useI18n()

  useSeoMeta({
    title: () => t('seo.settings.title'),
    description: () => t('seo.settings.description'),
  })
</script>
