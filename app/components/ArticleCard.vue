<template>
  <div
    @click="$emit('click')"
    class="w-full text-left bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md active:scale-[0.99] transition-all duration-300 flex flex-col group select-none"
  >
    <!-- Card Image Header -->
    <div class="relative w-full h-44 overflow-hidden bg-gray-100 shrink-0">
      <NuxtImg
        v-if="article.cover?.url"
        :src="getMediaUrl(article.cover.url)"
        :alt="article.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <!-- Fallback when image is not present -->
      <div v-else class="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-800">
        <Newspaper class="w-12 h-12 opacity-30 animate-pulse" />
      </div>

      <!-- Categories Badge Overlay
      <div 
        v-if="article.categories && article.categories.length > 0" 
        class="absolute top-3 left-3 flex flex-wrap gap-1"
      >
        <span 
          v-for="cat in article.categories"
          :key="cat.id"
          class="px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase bg-emerald-600/90 text-white backdrop-blur-sm shadow-sm"
        >
          {{ cat.name }}
        </span>
      </div>
      -->
    </div>

    <!-- Card Content -->
    <div class="p-4 flex-1 flex flex-col justify-between min-w-0">
      <div>
        <!-- Date -->
        <span class="text-[10px] font-bold text-emerald-600 uppercase tracking-wide block mb-1">
          {{ formattedDate }}
        </span>

        <h3 class="font-extrabold text-gray-800 text-base mb-1.5 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug">
          {{ article.title }}
        </h3>
        
        <!-- Clean Description Text -->
        <p class="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {{ cleanDescription }}
        </p>
      </div>

      <!-- Footer action -->
      <div class="pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] font-bold text-emerald-600">
        <span>{{ $t('noticias_page.read_more') }}</span>
        <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Newspaper, ArrowRight } from '@lucide/vue'
import { useI18n } from '#imports'
import type { Article } from '~/types/article'
import { useArticles } from '~/composables/useArticles'

const props = defineProps<{
  article: Article
}>()

defineEmits(['click'])

const { locale } = useI18n()
const { getMediaUrl } = useArticles()

// Format the date based on active locale
const formattedDate = computed(() => {
  const dateStr = props.article.publishedAt || props.article.date
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : 'es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
})

// Strip HTML tags and entities for clean preview text
const cleanDescription = computed(() => {
  if (!props.article.description) return ''
  return props.article.description
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
})
</script>
