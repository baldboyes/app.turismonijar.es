<script setup lang="ts">
import { computed } from 'vue'
import { getBeachStatusCssColor } from '~/utils/beachStatusStyles'
import { BEACH_STATUS_FLAG_PATH, BEACH_STATUS_JELLYFISH_MARKER_SRC } from '~/utils/beachStatusFlagMarker'
import { cn } from '~/lib/utils'

const props = defineProps<{
  status?: string
  useCurrentColor?: boolean
  class?: string
}>()

const iconStyle = computed(() => ({
  color: props.useCurrentColor ? 'currentColor' : getBeachStatusCssColor(props.status)
}))

const isJellyfishStatus = computed(() => props.status === 'amarilla_por_medusa' && !props.useCurrentColor)
</script>

<template>
  <img
    v-if="isJellyfishStatus"
    :src="BEACH_STATUS_JELLYFISH_MARKER_SRC"
    alt=""
    aria-hidden="true"
    :class="cn('inline-block shrink-0 object-contain', props.class)"
  />
  <svg
    v-else
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
