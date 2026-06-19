import { describe, expect, it } from 'vitest'
import {
  closeFlagNotificationModalState,
  getDismissedFlagNotificationMessage,
  getVisibleFlagNotificationMessage,
  shouldOpenFlagNotificationModal,
  syncFlagNotificationModalState
} from './flagNotification'

describe('getVisibleFlagNotificationMessage', () => {
  it('returns the first non-empty message marked to be shown', () => {
    expect(getVisibleFlagNotificationMessage([
      { message: 'Hidden message', visualizacion: 'ocultar' },
      { message: '  Mensaje de prueba  ', visualizacion: 'mostrar' }
    ])).toBe('Mensaje de prueba')
  })

  it('returns an empty string when there is no visible message', () => {
    expect(getVisibleFlagNotificationMessage([
      { message: '   ', visualizacion: 'mostrar' },
      { message: 'Hidden message', visualizacion: 'ocultar' }
    ])).toBe('')
  })

  it('preserves internal newlines in visible messages', () => {
    const message = 'Mensaje de prueba\n\nMensaje de prueba con una URL larga https://example.com/playas/mensaje-de-prueba-muy-largo'

    expect(getVisibleFlagNotificationMessage([
      { message: `  ${message}  `, visualizacion: 'mostrar' }
    ])).toBe(message)
  })
})

describe('flag notification modal state', () => {
  it('opens for a visible notification unless that exact message was dismissed', () => {
    const firstMessage = getVisibleFlagNotificationMessage([
      { message: 'Mensaje de prueba', visualizacion: 'mostrar' }
    ])

    expect(shouldOpenFlagNotificationModal(firstMessage, null)).toBe(true)

    const dismissedMessage = getDismissedFlagNotificationMessage(firstMessage)

    expect(dismissedMessage).toBe('Mensaje de prueba')
    expect(shouldOpenFlagNotificationModal(firstMessage, dismissedMessage)).toBe(false)
    expect(shouldOpenFlagNotificationModal('Nuevo mensaje', dismissedMessage)).toBe(true)
  })

  it('matches the page behavior: open, close from modal event, and do not reopen the same message immediately', () => {
    const state = { open: false, dismissedMessage: null }
    const message = getVisibleFlagNotificationMessage([
      { message: 'Mensaje de prueba', visualizacion: 'mostrar' }
    ])

    syncFlagNotificationModalState(state, message)

    expect(state.open).toBe(true)
    expect(state.dismissedMessage).toBeNull()

    closeFlagNotificationModalState(state, message)

    expect(state.open).toBe(false)
    expect(state.dismissedMessage).toBe('Mensaje de prueba')

    syncFlagNotificationModalState(state, message)

    expect(state.open).toBe(false)

    syncFlagNotificationModalState(state, 'Nuevo mensaje')

    expect(state.open).toBe(true)
  })
})
