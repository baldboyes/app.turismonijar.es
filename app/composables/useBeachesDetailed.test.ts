import { afterEach, describe, expect, it, vi } from 'vitest'

function createFlagsResponse(body: string, ok = true) {
  return {
    ok,
    text: vi.fn().mockResolvedValue(body)
  }
}

function createBeachesResponse(body: unknown, ok = true) {
  return {
    ok,
    json: vi.fn().mockResolvedValue(body)
  }
}

const detailedBeach = {
  id: 'ply_test',
  title: 'Detailed Test Beach',
  src: '/test.jpg',
  description: 'Detailed description',
  lat: '36.1',
  lng: '-2.1',
  bandera: 'amarilla'
}

async function loadUseBeachesDetailed() {
  vi.resetModules()
  return import('./useBeachesDetailed')
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('useBeachesDetailed', () => {
  it('merges live flag and occupancy from a valid flags response', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(createBeachesResponse({ states: [detailedBeach] }))
      .mockResolvedValueOnce(createFlagsResponse(JSON.stringify({
        states: [{ id: 'ply_test', state: 'verde' }],
        ocupacion: [{ id: 'ocupacion_test', state: 'alta' }]
      })))
    vi.stubGlobal('fetch', fetchMock)

    const { useBeachesDetailed } = await loadUseBeachesDetailed()
    const beachesState = useBeachesDetailed()

    await beachesState.fetchDetailedBeaches(true)

    expect(beachesState.isError.value).toBe(false)
    expect(beachesState.beachesDetailed.value).toHaveLength(1)
    expect(beachesState.beachesDetailed.value[0]).toMatchObject({
      id: 'ply_test',
      bandera: 'verde',
      ocupacion: { state: 'alta' },
      lat: 36.1,
      lng: -2.1
    })
  })

  it('loads the list when the flags response contains raw newlines inside notification messages', async () => {
    const rawFlagsJson = '{"states":[{"id":"ply_test","state":"verde"}],"notificacion":[{"message":"Mensaje de prueba\n\nMensaje de prueba","visualizacion":"mostrar"}]}'
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(createBeachesResponse({ states: [detailedBeach] }))
      .mockResolvedValueOnce(createFlagsResponse(rawFlagsJson))
    vi.stubGlobal('fetch', fetchMock)

    const { useBeachesDetailed } = await loadUseBeachesDetailed()
    const beachesState = useBeachesDetailed()

    await beachesState.fetchDetailedBeaches(true)

    expect(beachesState.isError.value).toBe(false)
    expect(beachesState.beachesDetailed.value).toHaveLength(1)
    expect(beachesState.beachesDetailed.value[0]).toMatchObject({
      id: 'ply_test',
      bandera: 'verde'
    })
  })

  it('loads detailed beaches without live flags when the optional flags response fails', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(createBeachesResponse({ states: [detailedBeach] }))
      .mockResolvedValueOnce(createFlagsResponse('{}', false))
    vi.stubGlobal('fetch', fetchMock)

    const { useBeachesDetailed } = await loadUseBeachesDetailed()
    const beachesState = useBeachesDetailed()

    await beachesState.fetchDetailedBeaches(true)

    expect(beachesState.isError.value).toBe(false)
    expect(beachesState.beachesDetailed.value).toHaveLength(1)
    expect(beachesState.beachesDetailed.value[0]).toMatchObject({
      id: 'ply_test',
      bandera: 'amarilla'
    })
  })
})
