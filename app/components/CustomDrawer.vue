<template>
  <div 
    :style="drawerStyle"
    :class="[
      'fixed left-0 right-0 mx-auto bg-white flex flex-col',
      !isDragging ? 'transition-[max-width,border-radius] duration-350 ease-out' : '',
      state === 'full' 
        ? 'max-w-none rounded-t-none border-t-0 shadow-none' 
        : 'max-w-[1024px] rounded-t-2xl border-t border-gray-100 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]'
    ]"
  >
    <!-- Handle de arrastre -->
    <div 
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @mousedown="onMouseDown"
      class="w-full py-3 flex justify-center cursor-grab active:cursor-grabbing select-none shrink-0"
    >
      <div class="w-12 h-1 bg-gray-300 rounded-full" />
    </div>

    <!-- Cabecera -->
    <div 
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @mousedown="onMouseDown"
      :class="[
        'px-4 pb-3 border-b border-gray-100 flex items-center justify-between relative select-none shrink-0 transition-[padding-top] duration-300',
        translateY === 0 ? 'custom-header' : ''
      ]"
    >
      <!-- Botón para colapsar (solo visible en full o mid) -->
      <Button 
        v-if="state === 'full' || state === 'mid'"
        variant="ghost"
        size="icon"
        @click="onCollapseClick"
        @touchstart.stop
        @mousedown.stop
        class="size-10 text-gray-500 hover:text-emerald-600 hover:bg-gray-100 rounded-full transition-all"
      >
        <ChevronDown class="size-5" />
      </Button>
      <div v-if="state === 'peek'" class="w-8 h-8 flex-shrink-0"></div> <!-- Espaciador para centrar título -->

      <div class="flex flex-col items-center select-none text-center min-w-0 flex-1 mx-2">
        <div class="flex items-center gap-2 justify-center flex-wrap">
          <span class="text-[11px] font-extrabold text-gray-600 truncate">
            <template v-if="lastModified && lastModified.length >= 12">
              {{ $t('last_update_label') }} 
            </template>
            {{ formattedDate }}
          </span>
          <span 
            v-if="lastModified && lastModified.length >= 12"
            class="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full text-white shadow-sm shrink-0"
            :class="isProvisional ? 'bg-amber-500' : 'bg-emerald-600'"
          >
            {{ isProvisional ? $t('provisional') : $t('definitivo') }}
          </span>
        </div>
      </div>
      
      <div class="w-8 h-8 flex-shrink-0"></div> <!-- Espaciador para centrar título -->
    </div>

    <!-- Contenido deslizable -->
    <div 
      class="flex-1 overflow-y-auto p-5 pb-24"
      :class="{ 'pointer-events-none': isDragging }"
      :style="{ maxHeight: scrollMaxHeight }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDown } from '@lucide/vue'
import Button from '@/components/ui/button/Button.vue'
import { useI18n } from '#imports'

const { t } = useI18n()

interface Props {
  lastModified?: string
  isProvisional?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  lastModified: '',
  isProvisional: false
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

const state = ref<'peek' | 'mid' | 'full'>('peek')
const isDragging = ref(false)
const windowHeight = ref(800)
const translateY = ref(550) // Valor por defecto antes de montar

const maxTranslate = computed(() => windowHeight.value - 140)

// Calcula la altura máxima del scroll en tiempo real
const scrollMaxHeight = computed(() => {
  const headerFooterOffset = 130 // Espacio aproximado para el tirador, la cabecera y el BottomNav
  
  if (isDragging.value) {
    const visibleHeight = windowHeight.value - translateY.value
    return `${Math.max(120, visibleHeight - headerFooterOffset)}px`
  }
  
  if (state.value === 'peek') {
    return '120px'
  } else if (state.value === 'mid') {
    const visibleHeight = windowHeight.value / 2
    return `${Math.max(120, visibleHeight - headerFooterOffset)}px`
  } else {
    return 'none'
  }
})

const drawerStyle = computed(() => {
  return {
    height: '100dvh',
    zIndex: state.value === 'full' ? 45 : 40,
    bottom: 0,
    transform: `translateY(${translateY.value}px)`,
    // Sin retraso en la transición durante el arrastre
    transition: isDragging.value 
      ? 'none' 
      : 'transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)'
  }
})

onMounted(() => {
  if (import.meta.client) {
    windowHeight.value = window.innerHeight
    translateY.value = maxTranslate.value
    
    window.addEventListener('resize', onResize)
  }
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
  if (state.value === 'peek') {
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
  console.log('onTouchStart', e.touches[0].clientY)
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
  console.log('onTouchEnd', { duration, deltaY })
  
  if (duration < 350 && Math.abs(deltaY) < 25) {
    toggleState()
  } else {
    snapState(deltaY, duration)
  }
}

// GESTIÓN RATÓN (ESCRITORIO)
function onMouseDown(e: MouseEvent) {
  console.log('onMouseDown', { button: e.button, isDragging: isDragging.value })
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
  console.log('onMouseUp', { duration, deltaY })
  
  if (duration < 350 && Math.abs(deltaY) < 25) {
    toggleState()
  } else {
    snapState(deltaY, duration)
  }
}

function toggleState() {
  console.log('toggleState called', { state: state.value, translateY: translateY.value })
  if (state.value === 'peek') {
    setState('mid')
  } else if (state.value === 'mid') {
    setState('full')
  } else {
    setState('peek')
  }
}

function snapState(deltaY: number, duration: number) {
  const velocity = duration > 0 ? deltaY / duration : 0
  const midPoint = windowHeight.value / 2
  const thresholdFullMid = midPoint / 2
  const thresholdMidPeek = (midPoint + maxTranslate.value) / 2

  let targetState: 'peek' | 'mid' | 'full' = 'peek'

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

function setState(newState: 'peek' | 'mid' | 'full') {
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
