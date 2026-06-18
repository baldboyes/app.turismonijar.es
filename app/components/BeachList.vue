<template>
  <div class="space-y-2">

    <BeachListItem
      v-for="beach in beaches"
      :key="beach.id"
      :beach="beach"
      @select="$emit('select-beach', beach)"
    />

    <div v-if="fechasServicio" class="text-[10px] text-gray-600 mt-2.5 text-center pt-2 font-medium">
      {{ $t('service_active') }}<br />{{ fechasServicio }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Beach } from '~/types/beach'
import BeachListItem from './BeachListItem.vue'

defineProps<{
  beaches: Beach[]
  fechasServicio?: string
}>()

defineEmits(['select-beach'])
</script>
