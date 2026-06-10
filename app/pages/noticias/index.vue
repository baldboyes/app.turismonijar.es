<template>
  <ion-page>
    <!-- Header -->
    <header class="custom-header bg-white border-b border-gray-100 p-4 shrink-0 select-none">
      <div class="max-w-[1024px] mx-auto flex items-center justify-between">
        <h1 class="text-xl font-extrabold text-gray-800">{{ $t('noticias_page.title') }}</h1>
        <div class="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
          <Newspaper class="w-5 h-5" />
        </div>
      </div>
    </header>

    <!-- Content -->
    <ion-content ref="contentRef" class="custom-content">
      <div class="max-w-[1024px] mx-auto p-4 space-y-4 pb-20">
        <!-- Search Input 
        <div class="relative flex items-center bg-white rounded-2xl border border-gray-100 shadow-sm p-1">
          <Search class="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            v-model="searchQuery"
            :placeholder="$t('noticias_page.search_placeholder')"
            class="w-full bg-transparent pl-10 pr-10 py-2.5 text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none border-none"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-3 p-1 rounded-full hover:bg-gray-100 text-gray-400 active:scale-95 transition-all"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
        -->

        <!-- Skeleton Loading State -->
        <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="n in 6" :key="n" class="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse flex flex-col h-76">
            <div class="w-full h-44 bg-gray-200"></div>
            <div class="p-4 flex-1 space-y-3">
              <div class="h-3 bg-gray-200 rounded w-1/4"></div>
              <div class="h-4 bg-gray-200 rounded w-2/3"></div>
              <div class="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="isError" class="bg-white rounded-2xl border border-red-100 p-8 text-center max-w-md mx-auto shadow-sm">
          <div class="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle class="w-6 h-6" />
          </div>
          <h3 class="font-bold text-gray-800 text-base mb-1">{{ $t('error_overlay.title') }}</h3>
          <p class="text-xs text-gray-500 mb-4">{{ $t('error_overlay.message') }}</p>
          <button
            @click="fetchArticles(currentPage, true)"
            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.97]"
          >
            {{ $t('error_overlay.retry') }}
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredArticles.length === 0" class="bg-white rounded-2xl border border-gray-100 p-8 text-center max-w-md mx-auto shadow-sm">
          <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search class="w-6 h-6" />
          </div>
          <h3 class="font-bold text-gray-800 text-base mb-1">{{ $t('noticias_page.no_results') }}</h3>
        </div>

        <!-- Articles List Grid -->
        <div v-else class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ArticleCard
              v-for="article in filteredArticles"
              :key="article.documentId"
              :article="article"
              @click="navigateToArticle(article.documentId)"
            />
          </div>

          <!-- Pagination Controls -->
          <div v-if="pageCount > 1" class="flex items-center justify-between my-4 pb-4 select-none">
            <div
              @click="changePage(currentPage - 1)"
              class="px-4 py-2 text-xs font-bold rounded-xl border border-gray-100 bg-white hover:border-gray-200 text-gray-600 active:scale-[0.98] transition-all flex items-center gap-1 shadow-sm cursor-pointer"
              :class="{ 'hidden': currentPage === 1 || isLoading }"
            >
              <ChevronLeft class="w-4 h-4" />
              {{ $t('noticias_page.prev') }}
            </div>
            
            <span class="text-xs font-bold text-gray-500">
              {{ $t('noticias_page.page_info', { current: currentPage, total: pageCount }) }}
            </span>
            
            <div
              @click="changePage(currentPage + 1)"
              class="px-4 py-2 text-xs font-bold rounded-xl border border-gray-100 bg-white hover:border-gray-200 text-gray-600 active:scale-[0.98] transition-all flex items-center gap-1 shadow-sm cursor-pointer"
              :class="{ 'hidden': currentPage === pageCount || isLoading }"
            >
              {{ $t('noticias_page.next') }}
              <ChevronRight class="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import { Newspaper, Search, X, AlertCircle, ChevronLeft, ChevronRight } from '@lucide/vue'
import { useLocalePath, useSeoMeta, useI18n, useRouter } from '#imports'
import { useArticles } from '~/composables/useArticles'
import ArticleCard from '~/components/ArticleCard.vue'

const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()

const contentRef = ref<any>(null)

const {
  isLoading,
  isError,
  searchQuery,
  filteredArticles,
  currentPage,
  pageCount,
  fetchArticles
} = useArticles()

function navigateToArticle(docId: string) {
  router.push(localePath(`/noticias/${docId}`))
}

async function changePage(page: number) {
  await fetchArticles(page)
  await nextTick()
  if (contentRef.value) {
    const target = contentRef.value.$el || contentRef.value
    if (target && typeof target.scrollToTop === 'function') {
      await target.scrollToTop(300)
    }
  }
}

onMounted(async () => {
  await fetchArticles(currentPage.value)
})

useSeoMeta({
  title: () => t('seo.noticias.title'),
  description: () => t('seo.noticias.description'),
})
</script>

<style scoped>
.custom-content {
  --background: #f9fafb;
}
</style>
