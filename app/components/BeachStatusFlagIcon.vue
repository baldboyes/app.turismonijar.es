<script setup lang="ts">
import { computed } from 'vue'
import { getBeachStatusCssColor } from '~/utils/beachStatusStyles'
import { BEACH_STATUS_FLAG_PATH } from '~/utils/beachStatusFlagMarker'
import { cn } from '~/lib/utils'

const props = defineProps<{
  status?: string
  class?: string
}>()

const iconStyle = computed(() => ({
  color: getBeachStatusCssColor(props.status)
}))
</script>

<template>
  <svg
    :class="cn('inline-block shrink-0', props.class)"
    :style="iconStyle"
    viewBox="0 0 24 24"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="none"
      stroke="white"
      stroke-width="2.5"
      stroke-linejoin="round"
      stroke-linecap="round"
      :d="BEACH_STATUS_FLAG_PATH"
    />
    <path
      fill="currentColor"
      :d="BEACH_STATUS_FLAG_PATH"
    />
  </svg>
</template>
