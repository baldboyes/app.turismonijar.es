export type BeachStatus = 'verde' | 'amarilla' | 'amarilla_por_medusa' | 'roja'

function normalizeBeachStatus(status?: string): BeachStatus | null {
  const value = status?.toLowerCase()
  if (value === 'verde' || value === 'amarilla' || value === 'amarilla_por_medusa' || value === 'roja') {
    return value
  }

  return null
}

export function getBeachStatusCssColor(status?: string) {
  switch (normalizeBeachStatus(status)) {
    case 'verde': return 'var(--color-status-verde)'
    case 'amarilla': return 'var(--color-status-amarilla)'
    case 'amarilla_por_medusa': return 'var(--color-status-medusa)'
    case 'roja': return 'var(--color-status-roja)'
    default: return 'var(--color-slate-500)'
  }
}

export function getBeachStatusBadgeClass(status?: string) {
  switch (normalizeBeachStatus(status)) {
    case 'verde': return 'bg-status-verde/90 text-white'
    case 'amarilla': return 'bg-status-amarilla/90 text-gray-900'
    case 'amarilla_por_medusa': return 'bg-status-medusa/90 text-white'
    case 'roja': return 'bg-status-roja/90 text-white'
    default: return 'bg-gray-500/90 text-white'
  }
}

export function getBeachStatusCardClass(status?: string) {
  switch (normalizeBeachStatus(status)) {
    case 'verde': return 'bg-status-verde'
    case 'amarilla': return 'bg-status-amarilla'
    case 'amarilla_por_medusa': return 'bg-status-medusa'
    case 'roja': return 'bg-status-roja'
    default: return 'bg-slate-500'
  }
}

export function getBeachStatusPopupClass(status?: string) {
  switch (normalizeBeachStatus(status)) {
    case 'verde': return 'bg-status-verde'
    case 'amarilla': return 'bg-status-amarilla text-gray-900'
    case 'amarilla_por_medusa': return 'bg-status-medusa'
    case 'roja': return 'bg-status-roja'
    default: return 'bg-gray-500'
  }
}
