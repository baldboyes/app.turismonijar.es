<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle
} from 'reka-ui'
import AppVersion from './AppVersion.vue'

const isOpen = ref(false)
const titleId = 'onboarding-modal-title'

const emit = defineEmits<{
  close: []
}>()

function handleOpenChange(open: boolean) {
  isOpen.value = open
  if (!open) {
    emit('close')
  }
}

onMounted(() => {
  if (import.meta.client) {
    const shown = sessionStorage.getItem('turismonijar_onboarding_shown')
    if (!shown) {
      isOpen.value = true
      sessionStorage.setItem('turismonijar_onboarding_shown', 'true')
      setTimeout(() => {
        isOpen.value = false
        emit('close')
      }, 3000)
    }
  }
})
</script>

<template>
  <DialogRoot :open="isOpen" @update:open="handleOpenChange">
    <DialogPortal disabled force-mount>
      <Transition name="fade">
        <DialogOverlay
          v-if="isOpen"
          class="fixed inset-0 z-[10000] bg-slate-900/40 backdrop-blur-md transition-opacity duration-300"
        />
      </Transition>
      <Transition name="onboarding-fade">
        <DialogContent
          v-if="isOpen"
          class="fixed left-1/2 top-1/2 z-[10001] flex w-[calc(100vw-2rem)] max-w-md lg:w-[80vw] lg:max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-3xl bg-white p-8 lg:p-12 text-slate-800 shadow-2xl focus:outline-none border border-slate-100"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
        >
          <DialogTitle :id="titleId" class="sr-only">{{ $t('title1') }}</DialogTitle>

          <!-- Main Logo -->
          <div class="mb-8 transform scale-100 transition-transform duration-500 hover:scale-105">
            <img src="/turismonijar.svg" :alt="$t('title1')" class="w-40 lg:w-60 h-auto mx-auto" />
          </div>

          <!-- Divider -->
          <div class="w-full h-px bg-slate-100 my-6"></div>

          <!-- Institutional Logos -->
          <div class="flex flex-wrap gap-4 lg:gap-12 items-center justify-center">
            <img src="/logos/01.webp" alt="" class="h-10 lg:h-14 w-auto object-contain transition-all duration-300" />
            <img src="/logos/02.webp" alt="" class="h-10 lg:h-14 w-auto object-contain transition-all duration-300" />
            <img src="/logos/03.webp" alt="" class="h-10 lg:h-14 w-auto object-contain transition-all duration-300" />
            <img src="/logos/04.webp" alt="" class="h-10 lg:h-14 w-auto object-contain transition-all duration-300" />
          </div>

          <!-- Version de la App -->
          <AppVersion class="mt-6 opacity-50 justify-center" />

        </DialogContent>
      </Transition>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.onboarding-fade-enter-active {
  /* No animation on enter to make it show fully instantly */
}
.onboarding-fade-leave-active {
  transition: opacity 300ms ease;
}
.onboarding-fade-leave-to {
  opacity: 0;
}
</style>
