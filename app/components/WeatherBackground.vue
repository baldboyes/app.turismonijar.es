<template>
  <div 
    class="inset-0 w-full h-full overflow-hidden select-none pointer-events-none z-0 transition-all duration-700 ease-in-out bg-gradient-to-br"
    :class="[backgroundClass, isFixed ? 'fixed' : 'absolute']"
  >
    <!-- 1. SUNNY / SOLAR FLARE OVERLAY (Day only) -->
    <div 
      v-if="weatherState === 'sunny' && isDay" 
      class="absolute -top-1/4 -right-1/4 w-[90%] aspect-square rounded-full bg-white/20 blur-3xl animate-solar-flare"
    ></div>


    <!-- 2. CLOUDY OVERLAYS (Day or Night) -->
    <div 
      v-if="weatherState === 'cloudy' || (weatherState === 'rainy' && isDay)" 
      class="absolute inset-0 w-full h-full overflow-hidden opacity-60"
    >
      <!-- Cloud 1 (Back, slower, smaller) -->
      <svg 
        class="absolute top-[5%] h-auto text-white/30 fill-current animate-cloud-drift-1"
        viewBox="0 0 100 40"
      >
        <path d="M10,30 Q20,10 35,20 Q50,10 65,25 Q80,15 90,30 Z" />
      </svg>
      
      <!-- Cloud 2 (Mid, normal speed) -->
      <svg 
        class="absolute top-[15%] h-auto text-white/45 fill-current animate-cloud-drift-2"
        viewBox="0 0 100 40"
      >
        <path d="M5,35 Q20,15 40,25 Q60,10 80,30 Q90,20 95,35 Z" />
      </svg>

      <!-- Cloud 3 (Front, faster, lower opacity) -->
      <svg 
        class="absolute top-[28%] h-auto text-white/20 fill-current animate-cloud-drift-3"
        viewBox="0 0 100 40"
      >
        <path d="M20,30 Q40,5 65,20 Q80,10 90,30 Z" />
      </svg>
    </div>

    <!-- 3. RAINY OVERLAYS (Day or Night) -->
    <div 
      v-if="weatherState === 'rainy'" 
      class="absolute inset-0 w-full h-full overflow-hidden"
    >
      <!-- Rain Drops (Various delays and horizontal positions) -->
      <div 
        v-for="n in 14" 
        :key="`rain-${n}`"
        class="absolute w-[1.5px] h-[16px] bg-white/40 rounded-full animate-rain-fall"
        :style="getRainDropStyle(n)"
      ></div>
    </div>

    <!-- 4. NIGHT / STARS OVERLAY (Night only, clear/cloudy) -->
    <div 
      v-if="!isDay" 
      class="absolute inset-0 w-full h-full overflow-hidden"
    >
      <!-- Faint glowing moon (Clear night only) -->
      <div 
        v-if="weatherState === 'sunny'"
        class="absolute top-[12%] right-[12%] w-[44px] h-[44px] rounded-full bg-amber-100/15 shadow-[0_0_15px_rgba(254,243,199,0.3)] flex items-center justify-center"
      >
        <!-- Crescent moon silhouette inside the glow -->
        <div class="w-[30px] h-[30px] rounded-full bg-transparent shadow-[-8px_-6px_0_0_#fef3c7] -mr-2 -mt-2"></div>
      </div>

      <!-- Twinkling Stars (only visible on clear nights, or faint on cloudy nights) -->
      <div 
        v-for="n in 10" 
        :key="`star-${n}`"
        class="absolute w-[2px] h-[2px] bg-white rounded-full animate-star-twinkle"
        :style="getStarStyle(n)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  weatherState: 'sunny' | 'cloudy' | 'rainy' | 'snowy'
  isDay: boolean
  isFixed?: boolean
}>(), {
  isFixed: false
})

// Dynamic gradient background classes depending on weather state and time of day
const backgroundClass = computed(() => {
  if (props.isDay) {
    switch (props.weatherState) {
      case 'cloudy':
        return 'from-sky-300 via-slate-300 to-slate-400 bg-size-200 animate-gradient-shift'
      case 'rainy':
      case 'snowy':
        return 'from-slate-400 via-slate-300 to-blue-400 bg-size-200 animate-gradient-shift'
      case 'sunny':
      default:
        return 'from-sky-500 via-blue-600 to-amber-500 bg-size-200 animate-gradient-shift'
    }
  } else {
    // Night states
    switch (props.weatherState) {
      case 'cloudy':
        return 'from-slate-900 via-slate-800 to-indigo-950 bg-size-200 animate-gradient-shift'
      case 'rainy':
      case 'snowy':
        return 'from-slate-950 via-blue-950 to-slate-900 bg-size-200 animate-gradient-shift'
      case 'sunny':
      default:
        return 'from-slate-950 via-indigo-950 to-slate-900 bg-size-200 animate-gradient-shift'
    }
  }
})

// Generate style offsets for rain drops
function getRainDropStyle(index: number) {
  const left = (index * 7.5) % 100 // distribute across width
  const delay = (index * 0.17) % 2 // staggered delays
  const duration = 0.8 + (index * 0.08) % 0.6 // varied fall speeds
  const opacity = 0.25 + (index * 0.05) % 0.35 // varied visibility
  
  return {
    left: `${left}%`,
    top: `-20px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    opacity: opacity
  }
}

// Generate style offsets for stars
function getStarStyle(index: number) {
  const left = (index * 13) % 90 + 5
  const top = (index * 7) % 55 + 5
  const delay = (index * 0.35) % 3
  const duration = 1.5 + (index * 0.25) % 2.5
  const size = index % 3 === 0 ? '3px' : '2px'
  const opacity = props.weatherState === 'sunny' ? '0.8' : '0.25' // dimmer stars on cloudy nights

  return {
    left: `${left}%`,
    top: `${top}%`,
    width: size,
    height: size,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    opacity: opacity
  }
}
</script>

<style scoped>
/* Gradient Shift Background */
.bg-size-200 {
  background-size: 240% 240%;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-gradient-shift {
  animation: gradientShift 16s ease-in-out infinite;
}

/* Solar Flare Animation */
@keyframes solarPulse {
  0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.8; }
  50% { transform: scale(1.1) translate(-5px, 5px); opacity: 0.95; }
}

.animate-solar-flare {
  animation: solarPulse 12s ease-in-out infinite;
}

/* Cloud Drift Animations */
@keyframes cloudDrift {
  0% { transform: translateX(-120%); }
  100% { transform: translateX(200%); }
}

.animate-cloud-drift-1 {
  width: 140px;
  animation: cloudDrift 65s linear infinite;
}

.animate-cloud-drift-2 {
  width: 190px;
  animation: cloudDrift 45s linear infinite;
  animation-delay: -15s;
}

.animate-cloud-drift-3 {
  width: 120px;
  animation: cloudDrift 30s linear infinite;
  animation-delay: -5s;
}

/* Rain Fall Animation */
@keyframes rainFall {
  0% { transform: translateY(-10px) translateX(0) rotate(15deg); }
  100% { transform: translateY(320px) translateX(-20px) rotate(15deg); }
}

.animate-rain-fall {
  animation: rainFall 1.2s linear infinite;
}

/* Star Twinkle Animation */
@keyframes starTwinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

.animate-star-twinkle {
  animation: starTwinkle 3s ease-in-out infinite;
}

/* Respect user's preferences for reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animate-gradient-shift,
  .animate-solar-flare,
  .animate-cloud-drift-1,
  .animate-cloud-drift-2,
  .animate-cloud-drift-3,
  .animate-rain-fall,
  .animate-star-twinkle {
    animation: none !important;
    transform: none !important;
  }
}
</style>
