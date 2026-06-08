<template>
  <div class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-sm font-bold text-gray-800">{{ $t('settings_panel.language_title') }}</h3>
        <p class="text-[10px] text-gray-400 font-semibold mt-0.5">{{ $t('settings_panel.language_subtitle') }}</p>
      </div>
      <div class="p-2 bg-emerald-50 rounded-xl">
        <Languages class="w-5 h-5 text-emerald-600" />
      </div>
    </div>
    
    <div class="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-xl">
      <NuxtLink
        :to="switchLocalePath('es')"
        class="flex items-center justify-center py-2.5 text-xs font-bold rounded-lg transition-all"
        :class="locale === 'es' ? 'bg-white text-emerald-600 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-800'"
      >
        {{ $t('languages.es') }}
      </NuxtLink>
      <NuxtLink
        :to="switchLocalePath('en')"
        class="flex items-center justify-center py-2.5 text-xs font-bold rounded-lg transition-all"
        :class="locale === 'en' ? 'bg-white text-emerald-600 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-800'"
      >
        {{ $t('languages.en') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Languages } from '@lucide/vue'
import { useSwitchLocalePath, useI18n } from '#imports'

const switchLocalePath = useSwitchLocalePath()
const { locale } = useI18n()
</script>
