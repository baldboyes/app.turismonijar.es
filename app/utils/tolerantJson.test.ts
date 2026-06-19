import { describe, expect, it } from 'vitest'
import { parseTolerantJson } from './tolerantJson'

interface FlagsApiResponse {
  notificacion?: Array<{
    message?: string
    visualizacion?: string
  }>
}

describe('parseTolerantJson', () => {
  it('parses valid JSON with a notification message', () => {
    const data = parseTolerantJson<FlagsApiResponse>(JSON.stringify({
      notificacion: [{
        message: 'Mensaje de prueba',
        visualizacion: 'mostrar'
      }]
    }))

    expect(data.notificacion?.[0]?.message).toBe('Mensaje de prueba')
    expect(data.notificacion?.[0]?.visualizacion).toBe('mostrar')
  })

  it('parses invalid JSON with raw newlines inside a message string', () => {
    const data = parseTolerantJson<FlagsApiResponse>('{"notificacion":[{"message":"Mensaje de prueba\n\nMensaje de prueba","visualizacion":"mostrar"}]}')

    expect(data.notificacion?.[0]?.message).toBe('Mensaje de prueba\n\nMensaje de prueba')
  })

  it('preserves parsed newlines so the modal can render them', () => {
    const data = parseTolerantJson<FlagsApiResponse>('{"notificacion":[{"message":"Primera línea\nSegunda línea\tcon tab","visualizacion":"mostrar"}]}')

    expect(data.notificacion?.[0]?.message).toContain('\n')
    expect(data.notificacion?.[0]?.message).toBe('Primera línea\nSegunda línea\tcon tab')
  })
})
