<template>
  <div 
    class="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center select-none"
    @click.self="emit('close')"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <!-- Top Bar -->
    <div 
      class="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10"
      style="padding-top: calc(env(safe-area-inset-top) + 1rem);"
    >
      <!-- Page Counter -->
      <span class="text-white/80 text-xs font-bold font-mono tracking-wider px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm">
        {{ $t('components.lightbox.image_counter', { current: currentIndex + 1, total: images.length }) }}
      </span>

      <!-- Close Button -->
      <button 
        @click="emit('close')"
        class="p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all backdrop-blur-sm"
        :aria-label="$t('components.lightbox.close')"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Main Image -->
    <div class="relative w-full max-w-4xl max-h-[70vh] px-4 flex items-center justify-center">
      <!-- Transition wrapper for image changes -->
      <transition name="fade-scale" mode="out-in">
        <NuxtImg
          :key="currentIndex"
          :src="images[currentIndex]"
          class="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl pointer-events-none select-none transition-all duration-300"
        />
      </transition>
    </div>

    <!-- Navigation Controls (Desktop/Tablets) -->
    <div class="absolute inset-y-0 left-4 hidden md:flex items-center">
      <button
        @click="prev"
        :disabled="images.length <= 1"
        class="p-3 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all disabled:opacity-30 disabled:pointer-events-none backdrop-blur-sm"
        :aria-label="$t('components.lightbox.prev')"
      >
        <ChevronLeft class="w-6 h-6" />
      </button>
    </div>
    <div class="absolute inset-y-0 right-4 hidden md:flex items-center">
      <button
        @click="next"
        :disabled="images.length <= 1"
        class="p-3 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all disabled:opacity-30 disabled:pointer-events-none backdrop-blur-sm"
        :aria-label="$t('components.lightbox.next')"
      >
        <ChevronRight class="w-6 h-6" />
      </button>
    </div>

    <!-- Bottom Instructions (for Swiping on mobile) -->
    <div 
      class="absolute bottom-6 text-center z-10 px-4 md:hidden pointer-events-none"
      style="padding-bottom: env(safe-area-inset-bottom);"
    >
      <p class="text-white/40 text-[10px] uppercase tracking-widest font-bold">
        &larr; Desliza para navegar &rarr;
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { X, ChevronLeft, ChevronRight } from '@lucide/vue'

const props = defineProps<{
  images: string[]
  initialIndex: number
}>()

const emit = defineEmits(['close'])

const currentIndex = ref(props.initialIndex)

// Touch state for swiping
let startX = 0

function onTouchStart(e: TouchEvent) {
  startX = e.touches[0].clientX
}

function onTouchEnd(e: TouchEvent) {
  const endX = e.changedTouches[0].clientX
  const deltaX = endX - startX

  // Swipe sensitivity threshold
  if (Math.abs(deltaX) > 50) {
    if (deltaX > 0) {
      prev()
    } else {
      next()
    }
  }
}

function next() {
  if (props.images.length <= 1) return
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
  } else {
    currentIndex.value = 0 // Wrap around
  }
}

function prev() {
  if (props.images.length <= 1) return
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    currentIndex.value = props.images.length - 1 // Wrap around
  }
}

// Keyboard events (Escape, Left Arrow, Right Arrow)
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
  } else if (e.key === 'ArrowRight') {
    next()
  } else if (e.key === 'ArrowLeft') {
    prev()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  // Disable body scroll when lightbox is active
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  // Re-enable body scroll
  document.body.style.overflow = ''
})
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.92);
}
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.03);
}
</style>
