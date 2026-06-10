/**
 * Helper to measure the current safe area insets via DOM layout.
 * This reads either the CSS custom property or the system environment variables.
 */
export function getSafeAreaInsets() {
  if (!import.meta.client) return { top: 0, bottom: 0 }
  
  const div = document.createElement('div')
  div.style.position = 'fixed'
  div.style.top = '0'
  div.style.left = '0'
  div.style.height = '0'
  div.style.width = '0'
  div.style.visibility = 'hidden'
  div.style.marginTop = 'var(--safe-area-inset-top, env(safe-area-inset-top, 0px))'
  div.style.marginBottom = 'var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))'
  
  document.body.appendChild(div)
  const styles = window.getComputedStyle(div)
  const top = parseFloat(styles.marginTop) || 0
  const bottom = parseFloat(styles.marginBottom) || 0
  document.body.removeChild(div)
  
  return { top, bottom }
}
