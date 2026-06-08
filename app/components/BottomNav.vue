<template>
  <nav class="border-t border-gray-100 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] shadow-lg">
    <div class="flex justify-around items-center h-16">
      <NuxtLink 
        :to="localePath('/')" 
        class="flex flex-col items-center justify-center flex-1 h-full text-gray-500 hover:text-emerald-600 transition-colors"
        active-class="text-emerald-600 font-semibold"
      >
        <Map class="w-6 h-6 mb-0.5" />
        <span class="text-[10px] tracking-wide">{{ $t('components.bottom_nav.map') }}</span>
      </NuxtLink>

      <!-- Playas Link -->
      <NuxtLink 
        :to="localePath('/playas')" 
        class="flex flex-col items-center justify-center flex-1 h-full text-gray-500 hover:text-emerald-600 transition-colors"
        active-class="text-emerald-600 font-semibold"
      >
        <Waves class="w-6 h-6 mb-0.5" />
        <span class="text-[10px] tracking-wide">{{ $t('components.bottom_nav.beaches') }}</span>
      </NuxtLink>
      


      <!-- Noticias Link -->
      <NuxtLink 
        :to="localePath('/noticias')" 
        class="flex flex-col items-center justify-center flex-1 h-full text-gray-500 hover:text-emerald-600 transition-colors"
        active-class="text-emerald-600 font-semibold"
      >
        <Newspaper class="w-6 h-6 mb-0.5" />
        <span class="text-[10px] tracking-wide">{{ $t('components.bottom_nav.news') }}</span>
      </NuxtLink>

      <!-- Ajustes Link -->
      <NuxtLink 
        :to="localePath('/ajustes')" 
        class="flex flex-col items-center justify-center flex-1 h-full text-gray-500 hover:text-emerald-600 transition-colors"
        active-class="text-emerald-600 font-semibold"
      >
        <Settings class="w-6 h-6 mb-0.5" />
        <span class="text-[10px] tracking-wide">{{ $t('ajustes') }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
  import { Map, Settings, Waves, Newspaper } from '@lucide/vue'
  const localePath = useLocalePath()
</script>

