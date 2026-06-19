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
  description: 'Detailed description'
}

async function loadUseBeaches() {
  vi.resetModules()
  return import('./useBeaches')
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('useBeaches', () => {
  it('loads beaches and notifications from a valid flags response', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(createFlagsResponse(JSON.stringify({
        states: [{ id: 'ply_test', title: 'Flag Test Beach', state: 'verde' }],
        ocupacion: [{ id: 'ocupacion_test', state: 'red' }],
        notificacion: [{ message: 'Mensaje de prueba', visualizacion: 'mostrar' }],
        fechas_del_servicio_de_banderas: 'Servicio activo',
        last_modified: '202606191200',
        provisionales: 'si'
      })))
      .mockResolvedValueOnce(createBeachesResponse({ states: [detailedBeach] }))
    vi.stubGlobal('fetch', fetchMock)

    const { useBeaches } = await loadUseBeaches()
    const beachesState = useBeaches()

    await beachesState.fetchBeaches()

    expect(beachesState.isError.value).toBe(false)
    expect(beachesState.beaches.value).toHaveLength(1)
    expect(beachesState.beaches.value[0]).toMatchObject({
      id: 'ply_test',
      src: '/test.jpg',
      description: 'Detailed description',
      ocupacion: { state: 'red' }
    })
    expect(beachesState.visibleNotificationMessage.value).toBe('Mensaje de prueba')
    expect(beachesState.fechasServicio.value).toBe('Servicio activo')
    expect(beachesState.lastModified.value).toBe('202606191200')
    expect(beachesState.isProvisional.value).toBe(true)
  })

  it('loads a visible notification when the flags response contains raw newlines inside the message string', async () => {
    const rawFlagsJson = '{"states":[{"id":"ply_test","title":"Flag Test Beach","state":"verde"}],"notificacion":[{"message":"Mensaje de prueba\n\nMensaje de prueba","visualizacion":"mostrar"}]}'
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(createFlagsResponse(rawFlagsJson))
      .mockResolvedValueOnce(createBeachesResponse({ states: [detailedBeach] }))
    vi.stubGlobal('fetch', fetchMock)

    const { useBeaches } = await loadUseBeaches()
    const beachesState = useBeaches()

    await beachesState.fetchBeaches()

    expect(beachesState.isError.value).toBe(false)
    expect(beachesState.visibleNotificationMessage.value).toBe('Mensaje de prueba\n\nMensaje de prueba')
  })

  it('uses cached beaches unless force is requested', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(createFlagsResponse(JSON.stringify({
        states: [{ id: 'ply_test', title: 'Flag Test Beach', state: 'verde' }]
      })))
      .mockResolvedValueOnce(createBeachesResponse({ states: [detailedBeach] }))
    vi.stubGlobal('fetch', fetchMock)

    const { useBeaches } = await loadUseBeaches()
    const beachesState = useBeaches()

    await beachesState.fetchBeaches()
    await beachesState.fetchBeaches()

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('sets the error state when either API response fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(createFlagsResponse('{}', false))
      .mockResolvedValueOnce(createBeachesResponse({ states: [] }))
    vi.stubGlobal('fetch', fetchMock)

    const { useBeaches } = await loadUseBeaches()
    const beachesState = useBeaches()

    await beachesState.fetchBeaches(true)

    expect(beachesState.isError.value).toBe(true)
    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})
