export interface FlagNotification {
  message?: string | null
  visualizacion?: string | null
}

export function getVisibleFlagNotificationMessage(notifications: FlagNotification[] | null | undefined) {
  const visibleNotification = notifications?.find(notification => {
    return notification.visualizacion === 'mostrar' && notification.message?.trim()
  })

  return visibleNotification?.message?.trim() || ''
}

export function shouldOpenFlagNotificationModal(
  message: string | null | undefined,
  dismissedMessage: string | null | undefined
) {
  return Boolean(message && message !== dismissedMessage)
}

export function getDismissedFlagNotificationMessage(message: string | null | undefined) {
  return message || null
}

export interface FlagNotificationModalState {
  open: boolean
  dismissedMessage: string | null
}

export function syncFlagNotificationModalState(
  state: FlagNotificationModalState,
  message: string | null | undefined
) {
  if (!message) {
    state.open = false
    return state
  }

  if (shouldOpenFlagNotificationModal(message, state.dismissedMessage)) {
    state.open = true
  }

  return state
}

export function closeFlagNotificationModalState(
  state: FlagNotificationModalState,
  message: string | null | undefined
) {
  state.dismissedMessage = getDismissedFlagNotificationMessage(message)
  state.open = false
  return state
}
