<template>
  <div class="flex w-full items-stretch gap-2 rounded-2xl">
    <button
      type="button"
      class="box-border flex min-w-0 flex-1 appearance-none items-stretch gap-2 overflow-hidden !rounded-2xl border border-slate-200 bg-white p-2 text-left text-slate-900 shadow-sm transition-colors hover:bg-slate-50"
      :aria-label="`${t('map.view_beach')}: ${beach.title}`"
      @click="$emit('select', beach)"
    >
      <span class="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2">
        <span class="relative flex size-7 shrink-0 items-center justify-center" aria-hidden="true">
          <span class="size-6 rounded-full ring-2 ring-white shadow-sm" :style="flagDotStyle" />
          <span v-if="isParkingFull" class="parking-alert-pulse" />
        </span>
        <span class="flex min-w-0 flex-1 flex-col gap-1 space-y-0">
          <span class="truncate text-sm font-bold">{{ beach.title }}</span>
          <span v-if="isParkingFull" class="truncate text-[10px] font-extrabold uppercase tracking-wider text-red-700" role="alert">
            {{ $t('playas_page.parking_full') }}
          </span>
        </span>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Beach } from '~/types/beach'
import { getBeachStatusCssColor } from '~/utils/beachStatusStyles'

const props = defineProps<{
  beach: Beach
}>()

const { t } = useI18n()

const isParkingFull = computed(() => props.beach.ocupacion?.state === 'red')

const flagDotStyle = computed(() => ({
  backgroundColor: getBeachStatusCssColor(props.beach.state)
}))

</script>

<style>
.parking-alert-pulse {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 13px;
  height: 13px;
  background-color: #ef4444;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  animation: pulse-dot 1.8s infinite ease-in-out;
}

@keyframes pulse-dot {
  0% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }

  70% {
    transform: scale(1.15);
    box-shadow: 0 0 0 5px rgba(239, 68, 68, 0);
  }

  100% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}
</style>
