import { ref, computed } from 'vue'
import type { Article } from '~/types/article'

const articles = ref<Article[]>([])
const isLoading = ref<boolean>(false)
const isError = ref<boolean>(false)
const searchQuery = ref<string>('')
const currentPage = ref<number>(1)
const pageCount = ref<number>(1)
const totalArticles = ref<number>(0)

export function useArticles() {
  async function fetchArticles(page = 1, force = false) {
    if (currentPage.value === page && articles.value.length > 0 && !force) return

    isLoading.value = true
    isError.value = false

    try {
      const response = await fetch(
        `https://api.nijaraldia.es/api/articles?filters[projects][documentId][$eq]=bs261ckcuumnj68xcjncw7rf&pagination[page]=${page}&pagination[pageSize]=12&sort[0]=publishedAt:desc&filters[categories][slug][$in][0]=turismo&populate[0]=cover&populate[1]=categories&populate[2]=gallery&populate[3]=videos&populate[4]=audios`
      )

      if (!response.ok) throw new Error('Failed to fetch articles')
      const result = await response.json()
      articles.value = result.data || []

      if (result.meta?.pagination) {
        currentPage.value = result.meta.pagination.page
        pageCount.value = result.meta.pagination.pageCount
        totalArticles.value = result.meta.pagination.total
      }
    } catch (err) {
      console.error('Error fetching articles:', err)
      isError.value = true
    } finally {
      isLoading.value = false
    }
  }

  async function fetchArticle(documentId: string) {
    const existing = articles.value.find(a => a.documentId === documentId)
    if (existing) return existing

    isLoading.value = true
    isError.value = false

    try {
      const response = await fetch(
        `https://api.nijaraldia.es/api/articles?filters[documentId][$eq]=${documentId}&populate[0]=cover&populate[1]=categories&populate[2]=gallery&populate[3]=videos&populate[4]=audios`
      )

      if (!response.ok) throw new Error('Failed to fetch article')
      const result = await response.json()
      const fetchedArticle = result.data?.[0] || null

      if (fetchedArticle) {
        const index = articles.value.findIndex(a => a.documentId === documentId)
        if (index !== -1) {
          articles.value[index] = fetchedArticle
        } else {
          articles.value.push(fetchedArticle)
        }
        return fetchedArticle
      }
      return null
    } catch (err) {
      console.error(`Error fetching article with documentId ${documentId}:`, err)
      isError.value = true
      return null
    } finally {
      isLoading.value = false
    }
  }

  function normalizeText(text: string) {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
  }

  const filteredArticles = computed(() => {
    if (!searchQuery.value.trim()) return articles.value
    const search = normalizeText(searchQuery.value)
    return articles.value.filter(article => {
      const titleMatches = article.title ? normalizeText(article.title).includes(search) : false
      const descriptionMatches = article.description ? normalizeText(article.description).includes(search) : false
      const contentMatches = article.content ? normalizeText(article.content).includes(search) : false
      return titleMatches || descriptionMatches || contentMatches
    })
  })

  function getMediaUrl(url: string | undefined) {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return `https://api.nijaraldia.es${url}`
  }

  return {
    articles,
    isLoading,
    isError,
    searchQuery,
    currentPage,
    pageCount,
    totalArticles,
    filteredArticles,
    fetchArticles,
    fetchArticle,
    getMediaUrl
  }
}
