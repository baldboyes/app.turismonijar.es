<template>
  <ion-page>
    <!-- Header with Back Button -->
    <header class="custom-header bg-white border-b border-gray-100 p-4 shrink-0 select-none">
      <div class="max-w-[1024px] mx-auto flex items-center gap-3 lg:pt-3">
        <button
          @click="goBack"
          class="p-2 -ml-2 rounded-xl hover:bg-gray-50 text-gray-500 active:scale-95 transition-all"
        >
          <ChevronLeft class="w-6 h-6" />
        </button>
        <h1 class="!text-lg font-extrabold text-gray-800 truncate !m-0 !p-0">
          {{ article ? article.title : $t('noticias_page.loading') }}
        </h1>
      </div>
    </header>

    <!-- Content -->
    <ion-content class="custom-content">
      <!-- Loading state -->
      <div v-if="isLoading && !article" class="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
        <Newspaper class="w-12 h-12 text-emerald-600 animate-bounce mb-3" />
        <p class="text-xs text-gray-500 font-semibold">{{ $t('noticias_page.loading') }}</p>
      </div>

      <!-- Error state -->
      <div v-else-if="isError && !article" class="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center max-w-sm mx-auto">
        <div class="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3">
          <AlertCircle class="w-6 h-6" />
        </div>
        <h3 class="font-bold text-gray-800 text-base mb-1">{{ $t('error_overlay.title') }}</h3>
        <p class="text-xs text-gray-500 mb-4">{{ $t('error_overlay.message') }}</p>
        <button
          @click="goBack"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.97]"
        >
          {{ $t('noticias_page.back_to_list') }}
        </button>
      </div>

      <!-- Detail View -->
      <div v-else-if="article" class="max-w-[1024px] mx-auto p-4 space-y-5 pb-28">
        <!-- Hero image with date and category badges -->
        <div 
          class="relative w-full h-64 rounded-3xl overflow-hidden shrink-0 cursor-zoom-in group"
          @click="openLightbox(0)"
        >
          <NuxtImg
            v-if="article.cover?.url"
            :src="getMediaUrl(article.cover.url)"
            :alt="article.title"
            class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
          <div v-else class="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-800">
            <Newspaper class="w-16 h-16 opacity-30" />
          </div>

          <!-- Category Badge overlay -->
          <div 
            v-if="article.categories && article.categories.length > 0"
            class="absolute bottom-4 left-4 flex flex-wrap gap-1.5"
          >
            <span 
              v-for="cat in article.categories"
              :key="cat.id"
              class="px-3 py-1 rounded-2xl text-xs font-black tracking-wider uppercase bg-emerald-600/90 text-white backdrop-blur-sm shadow-md"
            >
              {{ cat.name }}
            </span>
          </div>
        </div>

        <!-- Date & Article Heading -->
        <div class="bg-white rounded-3xl p-4 space-y-2">
          <span class="text-xs font-bold text-emerald-600 uppercase tracking-wide block">
            {{ formattedDate }}
          </span>
          <h2 class="text-xl font-extrabold text-gray-800 leading-tight block !mt-0 !pt-0">
            {{ article.title }}
          </h2>
          <p v-if="article.description" class="text-sm text-gray-500 font-semibold italic border-l-2 border-emerald-500 pl-3 py-0.5 leading-relaxed">
            {{ article.description }}
          </p>
        </div>

        <!-- Content Section -->
        <div v-if="article.content" class="bg-white rounded-3xl p-4 lg:p-6">
          <div 
            class="text-sm text-gray-700 leading-relaxed font-normal prose prose-emerald max-w-none" 
            v-html="parsedContent"
          ></div>
        </div>

        <!-- Audio Notes Section -->
        <div v-if="article.audios && article.audios.length > 0" class="bg-white rounded-3xl p-4 lg:p-6 pt-2 lg:pt-6 space-y-3">
          <h3 class="!text-sm uppercase font-extrabold tracking-wider text-gray-600 flex items-center gap-1.5">
            <Volume2 class="w-4 h-4 text-emerald-600" />
            {{ $t('noticias_page.audio_clips') }}
          </h3>
          <div class="space-y-3 pt-1">
            <div v-for="audio in article.audios" :key="audio.id" class="flex flex-col gap-2">
              <span class="text-xs font-bold text-gray-700 truncate block">
                {{ audio.name }}
              </span>
              <audio :src="getMediaUrl(audio.url)" controls class="w-full h-10 rounded-lg outline-none bg-transparent" />
            </div>
          </div>
        </div>

        <!-- Gallery Section -->
        <div v-if="article.gallery && article.gallery.length > 0" class="bg-white rounded-3xl p-4 pt-2 lg:p-6 lg:pt-6 space-y-3">
          <h3 class="!text-sm uppercase font-extrabold tracking-wider text-gray-600 flex items-center gap-1.5">
            <ImageIcon class="w-4 h-4 text-emerald-600" />
            {{ $t('noticias_page.gallery') }}
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
            <div 
              v-for="(img, idx) in article.gallery" 
              :key="img.id" 
              class="relative aspect-video rounded-2xl overflow-hidden group cursor-zoom-in"
              @click="openGalleryLightbox(idx)"
            >
              <NuxtImg 
                :src="getMediaUrl(img.url)" 
                :alt="img.alternativeText || img.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <!-- Image Lightbox Overlay -->
    <Teleport to="body">
      <ImageLightbox
        v-if="isLightboxOpen"
        :images="allImages"
        :initial-index="activeLightboxIndex"
        @close="isLightboxOpen = false"
      />
    </Teleport>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import { ChevronLeft, Newspaper, AlertCircle, Volume2, Image as ImageIcon } from '@lucide/vue'
import { useRoute, useRouter, useLocalePath, useSeoMeta, useI18n } from '#imports'
import { useArticles } from '~/composables/useArticles'
import ImageLightbox from '~/components/ImageLightbox.vue'
import { marked } from 'marked'

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { t, locale } = useI18n()

const {
  articles,
  isLoading,
  isError,
  fetchArticle,
  getMediaUrl
} = useArticles()

const isLightboxOpen = ref(false)
const activeLightboxIndex = ref(0)

const article = computed(() => {
  return articles.value.find(a => a.documentId === route.params.id)
})

// Compute all image URLs in order: Cover followed by Gallery Images
const allImages = computed(() => {
  if (!article.value) return []
  const list: string[] = []
  if (article.value.cover?.url) {
    list.push(getMediaUrl(article.value.cover.url))
  }
  if (article.value.gallery && article.value.gallery.length > 0) {
    article.value.gallery.forEach(img => {
      if (img.url) {
        list.push(getMediaUrl(img.url))
      }
    })
  }
  return list
})

// Format the date based on active locale
const formattedDate = computed(() => {
  const dateStr = article.value?.publishedAt || article.value?.date
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : 'es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
})

const parsedContent = computed(() => {
  if (!article.value?.content) return ''
  return marked.parse(article.value.content)
})

function goBack() {
  router.push(localePath('/noticias'))
}

function openLightbox(index = 0) {
  if (allImages.value.length === 0) return
  activeLightboxIndex.value = index
  isLightboxOpen.value = true
}

function openGalleryLightbox(galleryIndex: number) {
  const offset = article.value?.cover?.url ? 1 : 0
  openLightbox(galleryIndex + offset)
}

onMounted(async () => {
  if (!article.value) {
    await fetchArticle(String(route.params.id))
  }
})

useSeoMeta({
  title: () => {
    const title = article.value ? article.value.title : ''
    return t('seo.noticia_detail.title', { title })
  },
  description: () => {
    const desc = article.value ? (article.value.description || article.value.title) : ''
    return t('seo.noticia_detail.description', { description: desc })
  }
})
</script>

<style scoped>
.custom-content {
  --background: #f9fafb;
}

/* Ensure rich text paragraphs and lists render beautifully */
.prose :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.625;
}
.prose :deep(p:last-child) {
  margin-bottom: 0;
}
.prose :deep(ul) {
  list-style-type: disc;
  padding-left: 1.25rem;
  margin-bottom: 1rem;
}
.prose :deep(ol) {
  list-style-type: decimal;
  padding-left: 1.25rem;
  margin-bottom: 1rem;
}
.prose :deep(li) {
  margin-bottom: 0.25rem;
}
</style>
