<template>
  <div 
    v-if="visible" 
    class="absolute inset-0 bg-white/85 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300"
  >
    <div class="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <Loader2 class="animate-spin h-8 w-8 text-emerald-600" />
      <span class="text-sm font-semibold text-gray-700">{{ $t('loading_flags') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from '@lucide/vue'
defineProps<{
  visible: boolean
}>()
</script>
