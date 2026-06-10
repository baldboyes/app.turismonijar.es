<template>
  <button
    @click="$emit('select', beach)"
    class="w-full bg-white hover:bg-gray-50 active:bg-gray-100 rounded-2xl border border-gray-100 transition-all"
  >
    <div class="flex items-center justify-between w-full p-2 min-w-0 gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <span 
          class="size-4 rounded-full flex-shrink-0"
          :class="getStatusColorClass(beach.state)"
        />
        <span class="font-semibold text-sm text-gray-700 truncate">{{ beach.title }}</span>
      </div>
      <div 
        v-if="beach.ocupacion?.state === 'red'" 
        class="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider shrink-0 border border-red-100/50"
      >
        <AlertTriangle class="w-3 h-3" />
        <span>{{ $t('playas_page.parking_full') }}</span>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { AlertTriangle } from '@lucide/vue'
import type { Beach } from '~/types/beach'

defineProps<{
  beach: Beach
}>()

defineEmits(['select'])

const { t } = useI18n()

function getStatusText(state: string) {
  const s = state.toLowerCase()
  if (s === 'verde') return t('verde')
  if (s === 'amarilla') return t('amarilla')
  if (s === 'amarilla_por_medusa') return t('amarilla_por_medusa')
  if (s === 'roja') return t('roja')
  return s
}

function getStatusColorClass(state: string) {
  const s = state.toLowerCase()
  if (s === 'verde') return 'bg-status-verde'
  if (s === 'amarilla') return 'bg-status-amarilla text-gray-900'
  if (s === 'amarilla_por_medusa') return 'bg-status-medusa'
  if (s === 'roja') return 'bg-status-roja'
  return 'bg-gray-500'
}

function getFlagIconUrl(state: string) {
  const s = state.toLowerCase()
  if (s === 'verde') return '/banderas/estados/verde_.svg'
  if (s === 'amarilla') return '/banderas/estados/amarilla_.svg'
  if (s === 'amarilla_por_medusa') return '/banderas/estados/amarilla_por_medusa_.svg'
  if (s === 'roja') return '/banderas/estados/roja_.svg'
  return '/banderas/estados/verde_.svg'
}
</script>
