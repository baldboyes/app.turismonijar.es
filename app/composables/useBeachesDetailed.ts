import { ref, computed } from 'vue'
import type { Beach } from '~/types/beach'
import { parseTolerantJson } from '~/utils/tolerantJson'

const beachesDetailed = ref<Beach[]>([])
const isLoading = ref<boolean>(false)
const isError = ref<boolean>(false)
const searchQuery = ref<string>('')
const selectedFlagFilter = ref<string>('all')

const flagMapping: Record<string, string> = {
  'ply_la_isleta_del_moro': 'ply_penon_blanco',
  'ply_los_escullos': 'ply_escullos',
  'ply_media_luna': 'ply_cala_media_luna',
  'ply_cala_del_plomo': 'ply_del_plomo',
  'ply_cala_de_los_toros': 'ply_barranco_negro'
}

export function useBeachesDetailed() {
  async function fetchDetailedBeaches(force = false) {
    if (beachesDetailed.value.length > 0 && !force) return

    isLoading.value = true
    isError.value = false

    try {
      const [playasRes, flagsRes] = await Promise.all([
        fetch('https://turismonijar.es/estado-de-las-banderas/?tipo=playas'),
        fetch('https://turismonijar.es/estado-de-las-banderas/').catch(() => null)
      ])

      if (!playasRes || !playasRes.ok) throw new Error('Failed to fetch beaches data')
      const playasData = await playasRes.json()
      
      let liveFlagsMap: Record<string, string> = {}
      let liveOcupacionMap: Record<string, string> = {}
      if (flagsRes && flagsRes.ok) {
        try {
          const flagsData = parseTolerantJson<any>(await flagsRes.text())
          const flagsList = flagsData.states || []
          const ocupacionList = flagsData.ocupacion || []
          
          const OCUPACION_MAP: Record<string, string> = {
            'ply_la_isleta_del_moro': 'ocupacion_la_isleta',
            'ply_cala_del_plomo': 'ocupacion_el_plomo',
            'ply_los_genoveses': 'ocupacion_genoveses',
          }

          flagsList.forEach((flagItem: any) => {
            let mappedId = flagItem.id
            if (flagMapping[flagItem.id]) {
              mappedId = flagMapping[flagItem.id]
            }
            liveFlagsMap[mappedId] = flagItem.state

            const targetOcupacionId = OCUPACION_MAP[flagItem.id] || String(flagItem.id).replace('ply_', 'ocupacion_')
            const oItem = ocupacionList.find((o: any) => o.id === targetOcupacionId)
            if (oItem) {
              liveOcupacionMap[mappedId] = oItem.state
            }
          })
        } catch (err) {
          console.warn('Error parsing live beach flags:', err)
        }
      }

      const rawBeaches = playasData.states || []
      beachesDetailed.value = rawBeaches.map((beach: any) => {
        // If there's a live flag state, merge it
        let mergedBandera = beach.bandera || beach.state
        if (liveFlagsMap[beach.id]) {
          mergedBandera = liveFlagsMap[beach.id]
        }
        
        return {
          ...beach,
          // Ensure coordinates are numbers
          lat: Number(beach.lat),
          lng: Number(beach.lng),
          bandera: mergedBandera,
          ocupacion: liveOcupacionMap[beach.id] ? { state: liveOcupacionMap[beach.id] } : undefined
        }
      })
    } catch (err) {
      console.error('Error fetching detailed beaches:', err)
      isError.value = true
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

  const filteredBeaches = computed(() => {
    return beachesDetailed.value.filter(beach => {
      // 1. Search filter (accent-insensitive)
      const matchesSearch = normalizeText(beach.title).includes(normalizeText(searchQuery.value))
      
      // 2. Flag filter
      let matchesFlag = true
      if (selectedFlagFilter.value !== 'all') {
        if (selectedFlagFilter.value === 'sin_bandera') {
          matchesFlag = !beach.bandera
        } else {
          matchesFlag = beach.bandera?.toLowerCase() === selectedFlagFilter.value.toLowerCase()
        }
      }

      return matchesSearch && matchesFlag
    })
  })

  return {
    beachesDetailed,
    isLoading,
    isError,
    searchQuery,
    selectedFlagFilter,
    filteredBeaches,
    fetchDetailedBeaches
  }
}
