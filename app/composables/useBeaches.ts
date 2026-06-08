import { ref } from 'vue'
import type { Beach } from '~/types/beach'

// Module-level state shared across components
const beaches = ref<Beach[]>([])
const fechasServicio = ref<string>('')
const lastModified = ref<string>('')
const isProvisional = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const isError = ref<boolean>(false)

export function useBeaches() {
  async function fetchBeaches(force = false) {
    // Avoid double fetching unless forced
    if (beaches.value.length > 0 && !force) return

    isLoading.value = true
    isError.value = false
    try {
      const response = await fetch('https://turismonijar.es/estado-de-las-banderas/')
      if (!response.ok) throw new Error('API request failed')
      const data = await response.json()
      
      beaches.value = data.states || []
      fechasServicio.value = data.fechas_del_servicio_de_banderas || ''
      lastModified.value = data.last_modified || ''
      isProvisional.value = data.provisionales === 'si'
    } catch (error) {
      console.error('Error fetching beach flags data:', error)
      isError.value = true
    } finally {
      isLoading.value = false
    }
  }

  return {
    beaches,
    fechasServicio,
    lastModified,
    isProvisional,
    isLoading,
    isError,
    fetchBeaches
  }
}
