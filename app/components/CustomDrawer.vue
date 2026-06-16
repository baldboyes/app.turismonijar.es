<template>
  <div
    :style="drawerStyle"
    :class="[
      'fixed left-0 right-0 mx-auto flex flex-col overflow-hidden bg-white/95 shadow-[0_-18px_55px_rgb(15,23,42,0.18)] backdrop-blur-xl drawer-container',
      !isDragging ? 'transition-[max-width,border-radius] duration-350 ease-out' : '',
      state === 'full' 
        ? 'max-w-none rounded-t-[28px] md:rounded-t-none border-t border-white/70 md:border-t-0 md:shadow-none'
        : 'max-w-[1024px] rounded-t-[28px] border border-b-0 border-white/70 ring-1 ring-slate-900/5'
    ]"
  >
    <div
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @mousedown="onMouseDown"
      class="group w-full px-5 pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing select-none shrink-0"
    >
      <div class="h-1.5 w-14 rounded-full bg-slate-300 shadow-inner transition-colors group-hover:bg-emerald-500/80" />
    </div>

    <div
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @mousedown="onMouseDown"
      class="px-4 pb-4 border-b border-slate-100/80 flex items-center gap-3 relative select-none shrink-0"
    >
      <Button
        v-if="!lockAtMid && (state === 'full' || state === 'mid')"
        variant="ghost"
        size="icon"
        :aria-label="$t('drawer.collapse')"
        @click="onCollapseClick"
        @touchstart.stop
        @mousedown.stop
        class="size-10 rounded-full text-slate-500 transition-colors hover:bg-transparent hover:text-emerald-700"
      >
        <ChevronDown class="size-5" />
      </Button>

      <div class="min-w-0 flex-1 select-none text-left">
        <div class="flex max-w-full items-center gap-2 overflow-hidden">
          <span class="min-w-0 truncate font-semibold uppercase tracking-[0.1em] text-slate-500">
            <template v-if="lastModified && lastModified.length >= 12">
              <span class="block text-[9px] leading-none">{{ $t('last_update_label') }}</span>
            </template>
            <span class="block text-[11px] leading-tight">{{ formattedDate }}</span>
          </span>
          <span
            v-if="lastModified && lastModified.length >= 12"
            class="ml-auto shrink-0 text-[9px] font-extrabold uppercase tracking-wider"
            :class="isProvisional ? 'text-amber-700' : 'text-emerald-700'"
          >
            {{ isProvisional ? $t('provisional') : $t('definitivo') }}
          </span>
        </div>
      </div>
    </div>

    <div
      class="flex-1 overflow-y-auto overscroll-contain bg-gradient-to-b from-white via-white to-slate-50/80 px-4 pt-4 pb-[calc(2rem+var(--safe-area-inset-bottom,0px))] sm:px-5"
      :class="{ 'pointer-events-none': isDragging }"
      :style="{ maxHeight: scrollAreaMaxHeight }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ChevronDown } from '@lucide/vue'
import Button from '@/components/ui/button/Button.vue'
import { useI18n } from '#imports'
import { getSafeAreaInsets } from '~/utils/safeArea'

const { t } = useI18n()

type DrawerState = 'peek' | 'mid' | 'full'
type DrawerTargetState = 'hidden' | DrawerState

interface Props {
  lastModified?: string
  isProvisional?: boolean
  startHidden?: boolean
  targetState?: DrawerTargetState
  lockAtMid?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  lastModified: '',
  isProvisional: false,
  startHidden: false,
  targetState: undefined,
  lockAtMid: false
})

const emit = defineEmits(['state-change', 'drag'])

const formattedDate = computed(() => {
  if (!props.lastModified || props.lastModified.length < 12) return t('drawer.explore_fallback')
  const year = props.lastModified.substring(0, 4)
  const month = props.lastModified.substring(4, 6)
  const day = props.lastModified.substring(6, 8)
  const hour = props.lastModified.substring(8, 10)
  const minute = props.lastModified.substring(10, 12)
  return `${day}/${month}/${year} ${hour}:${minute}`
})

const state = ref<DrawerState>('peek')
const isDragging = ref(false)
const windowHeight = ref(800)
const safeAreaTop = ref(0)
const safeAreaBottom = ref(0)
const translateY = ref(props.startHidden ? 1000 : 550) // Valor por defecto antes de montar
const hasMounted = ref(false)

function updateSafeArea() {
  const insets = getSafeAreaInsets()
  safeAreaTop.value = insets.top
  safeAreaBottom.value = insets.bottom
}

const maxTranslate = computed(() => {
  const bottomNavHeight = 64 + safeAreaBottom.value
  const drawerHeaderHeight = 90
  const visibleHeight = bottomNavHeight + drawerHeaderHeight
  return windowHeight.value - visibleHeight - safeAreaTop.value
})

const scrollAreaMaxHeight = computed(() => {
  if (state.value === 'full') return 'auto'

  const visibleHeight = windowHeight.value - translateY.value - safeAreaTop.value
  const drawerChromeHeight = props.lockAtMid ? 72 : 104
  const usableHeight = visibleHeight - drawerChromeHeight

  return `${Math.max(120, usableHeight)}px`
})

const drawerStyle = computed(() => {
  return {
    height: '100dvh',
    zIndex: state.value === 'full' ? 10010 : 10000,
    bottom: 0,
    transform: `translateY(calc(${translateY.value}px + var(--safe-area-top, 0px)))`,
    // Sin retraso en la transición durante el arrastre
    transition: isDragging.value 
      ? 'none' 
      : 'transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)'
  }
})

onMounted(() => {
  hasMounted.value = true

  if (import.meta.client) {
    windowHeight.value = window.innerHeight
    updateSafeArea()
    translateY.value = props.startHidden ? windowHeight.value : maxTranslate.value

    if (props.targetState) {
      window.requestAnimationFrame(() => {
        applyTargetState(props.targetState ?? 'peek')
      })
    }
    
    window.addEventListener('resize', onResize)
  } else if (props.targetState) {
    applyTargetState(props.targetState)
  }
})

watch(() => props.targetState, (targetState) => {
  if (!hasMounted.value || !targetState) return

  applyTargetState(targetState)
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('resize', onResize)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }
})

function onResize() {
  windowHeight.value = window.innerHeight
  updateSafeArea()
  if (props.targetState === 'hidden') {
    translateY.value = windowHeight.value
  } else if (state.value === 'peek') {
    translateY.value = maxTranslate.value
  } else if (state.value === 'mid') {
    translateY.value = windowHeight.value / 2
  } else {
    translateY.value = 0
  }
}

let startTouchY = 0
let startTranslateY = 0
let touchStartTime = 0

// GESTIÓN TÁCTIL (MÓVIL)
function onTouchStart(e: TouchEvent) {
  touchStartTime = Date.now()
  startTouchY = e.touches[0].clientY
  startTranslateY = translateY.value
  isDragging.value = true
}

function onTouchMove(e: TouchEvent) {
  if (!isDragging.value) return
  const currentY = e.touches[0].clientY
  const deltaY = currentY - startTouchY
  
  let newTranslate = startTranslateY + deltaY
  if (newTranslate < 0) newTranslate = 0
  if (newTranslate > maxTranslate.value) newTranslate = maxTranslate.value
  
  translateY.value = newTranslate
  emit('drag', newTranslate)
}

function onTouchEnd() {
  if (!isDragging.value) return
  isDragging.value = false
  
  const duration = Date.now() - touchStartTime
  const deltaY = translateY.value - startTranslateY
  
  if (duration < 350 && Math.abs(deltaY) < 25) {
    toggleState()
  } else {
    snapState(deltaY, duration)
  }
}

// GESTIÓN RATÓN (ESCRITORIO)
function onMouseDown(e: MouseEvent) {
  if (e.button !== 0 || isDragging.value) return // Solo click izquierdo
  
  // Prevent browser default text selection/dragging to ensure mouseup fires cleanly
  e.preventDefault()
  
  touchStartTime = Date.now()
  startTouchY = e.clientY
  startTranslateY = translateY.value
  isDragging.value = true
  
  if (import.meta.client) {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  const currentY = e.clientY
  const deltaY = currentY - startTouchY
  
  let newTranslate = startTranslateY + deltaY
  if (newTranslate < 0) newTranslate = 0
  if (newTranslate > maxTranslate.value) newTranslate = maxTranslate.value
  
  translateY.value = newTranslate
  emit('drag', newTranslate)
}

function onMouseUp(e: MouseEvent) {
  if (!isDragging.value) return
  isDragging.value = false
  
  if (import.meta.client) {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }
  
  const duration = Date.now() - touchStartTime
  const deltaY = translateY.value - startTranslateY
  
  if (duration < 350 && Math.abs(deltaY) < 25) {
    toggleState()
  } else {
    snapState(deltaY, duration)
  }
}

function toggleState() {
  if (props.lockAtMid) return
  if (state.value === 'peek') {
    setState('mid')
  } else if (state.value === 'mid') {
    setState('full')
  } else {
    setState('peek')
  }
}

function snapState(deltaY: number, duration: number) {
  if (props.lockAtMid) {
    if (deltaY > 40) {
      applyTargetState('hidden')
      emit('state-change', 'peek')
    } else {
      setState('mid')
    }
    return
  }

  const velocity = duration > 0 ? deltaY / duration : 0
  const midPoint = windowHeight.value / 2
  const thresholdFullMid = midPoint / 2
  const thresholdMidPeek = (midPoint + maxTranslate.value) / 2

  let targetState: DrawerState = 'peek'

  if (velocity < -0.8) {
    targetState = 'full'
  } else if (velocity > 0.8) {
    targetState = 'peek'
  } else if (velocity >= -0.8 && velocity < -0.3) {
    if (translateY.value < midPoint) {
      targetState = 'full'
    } else {
      targetState = 'mid'
    }
  } else if (velocity > 0.3 && velocity <= 0.8) {
    if (translateY.value < midPoint) {
      targetState = 'mid'
    } else {
      targetState = 'peek'
    }
  } else {
    // Slow drag
    if (translateY.value < thresholdFullMid) {
      targetState = 'full'
    } else if (translateY.value < thresholdMidPeek) {
      targetState = 'mid'
    } else {
      targetState = 'peek'
    }
  }

  setState(targetState)
}

function onCollapseClick(e: MouseEvent) {
  e.stopPropagation()
  setState('peek')
}

function applyTargetState(targetState: DrawerTargetState) {
  if (targetState === 'hidden') {
    translateY.value = windowHeight.value
    return
  }

  setState(targetState)
}

function setState(newState: DrawerState) {
  state.value = newState
  if (newState === 'peek') {
    translateY.value = maxTranslate.value
  } else if (newState === 'mid') {
    translateY.value = windowHeight.value / 2
  } else {
    translateY.value = 0
  }
  emit('state-change', newState)
}

defineExpose({
  state,
  setState
})
</script>

<style scoped>
.drawer-container {
  --safe-area-top: var(--safe-area-inset-top);
}
</style>
