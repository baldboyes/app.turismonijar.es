import { computed, ref } from 'vue'
import type { Beach } from '~/types/beach'
import { getVisibleFlagNotificationMessage, type FlagNotification } from '~/utils/flagNotification'
import { parseTolerantJson } from '~/utils/tolerantJson'

// Module-level state shared across components
const beaches = ref<Beach[]>([])
const fechasServicio = ref<string>('')
const lastModified = ref<string>('')
const isProvisional = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const isError = ref<boolean>(false)
const flagNotifications = ref<FlagNotification[]>([])
const visibleNotificationMessage = computed(() => getVisibleFlagNotificationMessage(flagNotifications.value))

export function useBeaches() {
  async function fetchBeaches(force = false) {
    // Avoid double fetching unless forced
    if (beaches.value.length > 0 && !force) return

    isLoading.value = true
    isError.value = false
    try {
      const [flagsRes, playasRes] = await Promise.all([
        fetch('https://turismonijar.es/estado-de-las-banderas/'),
        fetch('https://turismonijar.es/estado-de-las-banderas/?tipo=playas')
      ])
      
      if (!flagsRes.ok || !playasRes.ok) throw new Error('API request failed')
      
      const flagsData = parseTolerantJson<any>(await flagsRes.text())
      const playasData = await playasRes.json()

      const flagStates = flagsData.states || []
      const ocupacion = flagsData.ocupacion || []
      const detailedBeaches = playasData.states || []
      flagNotifications.value = Array.isArray(flagsData.notificacion) ? flagsData.notificacion : []

      const OCUPACION_MAP: Record<string, string> = {
        'ply_la_isleta_del_moro': 'ocupacion_la_isleta',
        'ply_cala_del_plomo': 'ocupacion_el_plomo',
        'ply_los_genoveses': 'ocupacion_genoveses',
      }

      const flagMapping: Record<string, string> = {
        'ply_la_isleta_del_moro': 'ply_penon_blanco',
        'ply_los_escullos': 'ply_escullos',
        'ply_media_luna': 'ply_cala_media_luna',
        'ply_cala_del_plomo': 'ply_del_plomo',
        'ply_cala_de_los_toros': 'ply_barranco_negro'
      }

      beaches.value = flagStates.map((flagItem: any) => {
        const detailedId = flagMapping[flagItem.id] || flagItem.id
        const detailedBeach = detailedBeaches.find((b: any) => b.id === detailedId)
        
        const targetOcupacionId = OCUPACION_MAP[flagItem.id] || String(flagItem.id).replace('ply_', 'ocupacion_')
        const oItem = ocupacion.find((o: any) => o.id === targetOcupacionId)

        return {
          ...flagItem,
          id: detailedId,
          src: detailedBeach?.src || flagItem.src,
          description: detailedBeach?.description || '',
          ocupacion: oItem ? { state: oItem.state } : undefined
        }
      })
      fechasServicio.value = flagsData.fechas_del_servicio_de_banderas || ''
      lastModified.value = flagsData.last_modified || ''
      isProvisional.value = flagsData.provisionales === 'si'
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
    flagNotifications,
    visibleNotificationMessage,
    fetchBeaches
  }
}
