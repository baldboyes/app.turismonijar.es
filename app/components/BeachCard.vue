<template>
  <div
    @click="$emit('click')"
    class="w-full text-left bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md active:scale-[0.99] transition-all duration-300 flex flex-col group select-none"
  >
    <!-- Card Image Header -->
    <div class="relative w-full h-44 overflow-hidden bg-gray-100 shrink-0">
      <NuxtImg
        v-if="beach.src"
        :src="beach.src"
        :alt="beach.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <!-- Fallback when image is not present -->
      <div v-else class="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-800">
        <Waves class="w-12 h-12 opacity-30 animate-pulse" />
      </div>

      <!-- Flag Badge Overlay -->
      <div 
        v-if="beach.bandera" 
        class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1.5 backdrop-blur-sm"
        :class="getBadgeClass(beach.bandera)"
      >
        <span class="size-2 rounded-full shrink-0" :class="getDotColorClass(beach.bandera)"></span>
        {{ $t(beach.bandera.toLowerCase()) }}
      </div>

      <!-- Parking Badge Overlay -->
      <div 
        v-if="beach.ocupacion?.state === 'red'" 
        class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1 bg-red-600/95 text-white backdrop-blur-sm"
      >
        <AlertTriangle class="w-3 h-3" />
        <span>{{ $t('playas_page.parking_full') }}</span>
      </div>
    </div>

    <!-- Card Content -->
    <div class="p-4 flex-1 flex flex-col justify-between min-w-0">
      <div>
        <h3 class="font-extrabold text-gray-800 text-base mb-1 truncate group-hover:text-emerald-700 transition-colors">
          {{ beach.title }}
        </h3>
        
        <!-- Clean Description Text (Strips HTML tags & limits to 2 lines) -->
        <p class="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {{ cleanDescription }}
        </p>
      </div>

      <!-- Quick characteristics badges -->
      <div class="pt-3 border-t border-gray-50 flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-gray-600">
        <div v-if="parsedCharacteristics.arena" class="flex items-center gap-1">
          <span class="font-semibold text-gray-800">{{ $t('playas_page.sand') }}:</span>
          <span class="truncate max-w-[120px]">{{ parsedCharacteristics.arena }}</span>
        </div>
        <div v-if="parsedCharacteristics.longitud" class="flex items-center gap-1">
          <span class="font-semibold text-gray-800">{{ $t('playas_page.length') }}:</span>
          <span>{{ parsedCharacteristics.longitud }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Waves, AlertTriangle } from '@lucide/vue'
import type { Beach } from '~/types/beach'

const props = defineProps<{
  beach: Beach
}>()

defineEmits(['click'])

// Strip HTML tags and entities for clean preview text
const cleanDescription = computed(() => {
  if (!props.beach.description) return ''
  return props.beach.description
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
})

const parsedCharacteristics = computed(() => {
  if (!props.beach.caracteristicas) return {}
  const parts = props.beach.caracteristicas.split('<br />')
  const result: Record<string, string> = {}
  parts.forEach(part => {
    const colonIdx = part.indexOf(':')
    if (colonIdx !== -1) {
      const key = part.slice(0, colonIdx).trim().toLowerCase()
      const value = part.slice(colonIdx + 1).trim()
      if (key && value) {
        result[key] = value
      }
    }
  })
  return result
})

function getBadgeClass(bandera: string) {
  const b = bandera.toLowerCase()
  if (b === 'verde') return 'bg-emerald-500/90 text-white'
  if (b === 'amarilla') return 'bg-amber-400/90 text-gray-900'
  if (b === 'amarilla_por_medusa') return 'bg-orange-500/90 text-white'
  if (b === 'roja') return 'bg-red-600/90 text-white'
  return 'bg-gray-500/90 text-white'
}

function getDotColorClass(bandera: string) {
  const b = bandera.toLowerCase()
  if (b === 'verde') return 'bg-white'
  if (b === 'amarilla') return 'bg-gray-900'
  if (b === 'amarilla_por_medusa') return 'bg-white'
  if (b === 'roja') return 'bg-white'
  return 'bg-white'
}
</script>
