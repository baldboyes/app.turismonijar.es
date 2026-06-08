<template>
  <div 
    v-if="visible" 
    class="absolute inset-0 bg-white/90 flex items-center justify-center z-50 p-4"
  >
    <div class="max-w-xs text-center p-6 bg-red-50 rounded-2xl border border-red-100 shadow-md">
      <AlertTriangle class="w-10 h-10 text-red-500 mx-auto mb-3" />
      <h3 class="font-bold text-red-800 text-sm mb-1">{{ $t('error_overlay.title') }}</h3>
      <p class="text-xs text-red-600 mb-4">{{ $t('error_overlay.message') }}</p>
      
      <Button 
        @click="$emit('retry')" 
        class="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all h-auto"
      >
        {{ $t('error_overlay.retry') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle } from '@lucide/vue'
import Button from '@/components/ui/button/Button.vue'

defineProps<{
  visible: boolean
}>()

defineEmits(['retry'])
</script>
