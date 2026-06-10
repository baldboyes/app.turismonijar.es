<template>
  <nav 
    v-bind="filteredAttrs"
    class="fixed bottom-6 left-1/2 -translate-x-1/2 w-auto max-w-[95vw] rounded-3xl bg-primary shadow-[0_10px_30px_rgba(0,0,0,0.15)] p-2 flex items-center justify-center transition-all duration-300 hover:scale-[1.01] z-[9999]"
  >
    <div ref="containerRef" class="relative flex items-center justify-center gap-3 sm:gap-4">
      <div 
        class="absolute bg-primary-foreground rounded-2xl transition-all duration-350 ease-[cubic-bezier(0.34,1.2,0.64,1)] shadow-sm pointer-events-none z-0"
        :style="bgStyle"
      ></div>

      <!-- Map Link -->
      <NuxtLink 
        :to="localePath('/')" 
        class="relative z-10 flex flex-col items-center justify-center w-auto min-w-11 sm:min-w-12 md:min-w-13 h-11 sm:h-12 md:h-13 px-2 rounded-2xl border border-transparent transition-all active:scale-95"
        :class="isTabActive('/') 
          ? 'is-active !text-primary font-bold scale-105' 
          : '!text-primary-foreground/75 bg-transparent hover:bg-primary-foreground/15 hover:!text-primary-foreground hover:scale-105'"
        :title="$t('components.bottom_nav.map')"
      >
        <Map class="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 mb-0.5" />
        <span class="text-[7.5px] sm:text-[8px] md:text-[9px] font-bold tracking-wide uppercase mt-0.5 whitespace-nowrap text-center leading-none">{{ $t('components.bottom_nav.map') }}</span>
        <!-- macOS Active Dot -->
        <span 
          class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.2 h-1.2 rounded-full transition-all duration-350"
          :class="isTabActive('/') ? 'opacity-100 bg-primary' : 'opacity-0 bg-primary-foreground'"
        ></span>
      </NuxtLink>

      <!-- Playas Link -->
      <NuxtLink 
        :to="localePath('/playas')" 
        class="relative z-10 flex flex-col items-center justify-center w-auto min-w-11 sm:min-w-12 md:min-w-13 h-11 sm:h-12 md:h-13 px-2 rounded-2xl border border-transparent transition-all active:scale-95"
        :class="isTabActive('/playas') 
          ? 'is-active !text-primary font-bold scale-105' 
          : '!text-primary-foreground/75 bg-transparent hover:bg-primary-foreground/15 hover:!text-primary-foreground hover:scale-105'"
        :title="$t('components.bottom_nav.beaches')"
      >
        <Waves class="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 mb-0.5" />
        <span class="text-[7.5px] sm:text-[8px] md:text-[9px] font-bold tracking-wide uppercase mt-0.5 whitespace-nowrap text-center leading-none">{{ $t('components.bottom_nav.beaches') }}</span>
        <!-- macOS Active Dot -->
        <span 
          class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.2 h-1.2 rounded-full transition-all duration-350"
          :class="isTabActive('/playas') ? 'opacity-100 bg-primary' : 'opacity-0 bg-primary-foreground'"
        ></span>
      </NuxtLink>
      
      <!-- Noticias Link -->
      <NuxtLink 
        :to="localePath('/noticias')" 
        class="relative z-10 flex flex-col items-center justify-center w-auto min-w-11 sm:min-w-12 md:min-w-13 h-11 sm:h-12 md:h-13 px-2 rounded-2xl border border-transparent transition-all active:scale-95"
        :class="isTabActive('/noticias') 
          ? 'is-active !text-primary font-bold scale-105' 
          : '!text-primary-foreground/75 bg-transparent hover:bg-primary-foreground/15 hover:!text-primary-foreground hover:scale-105'"
        :title="$t('components.bottom_nav.news')"
      >
        <Newspaper class="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 mb-0.5" />
        <span class="text-[7.5px] sm:text-[8px] md:text-[9px] font-bold tracking-wide uppercase mt-0.5 whitespace-nowrap text-center leading-none">{{ $t('components.bottom_nav.news') }}</span>
        <!-- macOS Active Dot -->
        <span 
          class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.2 h-1.2 rounded-full transition-all duration-350"
          :class="isTabActive('/noticias') ? 'opacity-100 bg-primary' : 'opacity-0 bg-primary-foreground'"
        ></span>
      </NuxtLink>

      <!-- Ajustes Link -->
      <NuxtLink 
        :to="localePath('/ajustes')" 
        class="relative z-10 flex flex-col items-center justify-center w-auto min-w-11 sm:min-w-12 md:min-w-13 h-11 sm:h-12 md:h-13 px-2 rounded-2xl border border-transparent transition-all active:scale-95"
        :class="isTabActive('/ajustes') 
          ? 'is-active !text-primary font-bold scale-105' 
          : '!text-primary-foreground/75 bg-transparent hover:bg-primary-foreground/15 hover:!text-primary-foreground hover:scale-105'"
        :title="$t('ajustes')"
      >
        <Settings class="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 mb-0.5" />
        <span class="text-[7.5px] sm:text-[8px] md:text-[9px] font-bold tracking-wide uppercase mt-0.5 whitespace-nowrap text-center leading-none">{{ $t('ajustes') }}</span>
        <!-- macOS Active Dot -->
        <span 
          class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.2 h-1.2 rounded-full transition-all duration-350"
          :class="isTabActive('/ajustes') ? 'opacity-100 bg-primary' : 'opacity-0 bg-primary-foreground'"
        ></span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
  import { useAttrs, computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
  import { useRoute } from 'vue-router'
  import { Map, Settings, Waves, Newspaper } from '@lucide/vue'
  import { useLocalePath } from '#imports'
  
  defineOptions({
    inheritAttrs: false
  })

  const route = useRoute()
  const attrs = useAttrs()
  const localePath = useLocalePath()

  const isTabActive = (path: string) => {
    const localizedPath = localePath(path)
    if (path === '/') {
      return route.path === localizedPath || route.path === localizedPath + '/'
    }
    return route.path.startsWith(localizedPath)
  }

  const filteredAttrs = computed(() => {
    const { class: _, ...rest } = attrs
    return rest
  })

  const containerRef = ref<HTMLElement | null>(null)
  const bgStyle = ref({
    left: '0px',
    width: '0px',
    height: '0px',
    opacity: 0
  })

  const updateBgPosition = async () => {
    await nextTick()
    if (!containerRef.value) return
    const activeEl = containerRef.value.querySelector('.is-active') as HTMLElement
    if (activeEl) {
      bgStyle.value = {
        left: `${activeEl.offsetLeft}px`,
        width: `${activeEl.offsetWidth}px`,
        height: `${activeEl.offsetHeight}px`,
        opacity: 1
      }
    } else {
      bgStyle.value.opacity = 0
    }
  }

  // Watch route to update position
  watch(() => route.path, () => {
    updateBgPosition()
  })

  onMounted(() => {
    updateBgPosition()
    if (import.meta.client) {
      window.addEventListener('resize', updateBgPosition)
    }
  })

  onUnmounted(() => {
    if (import.meta.client) {
      window.removeEventListener('resize', updateBgPosition)
    }
  })
</script>

<style scoped>
</style>
