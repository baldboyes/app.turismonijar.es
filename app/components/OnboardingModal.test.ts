import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const componentPath = fileURLToPath(new URL('./OnboardingModal.vue', import.meta.url))

describe('OnboardingModal', () => {
  it('has the correct dialog structures and transition elements', () => {
    const source = readFileSync(componentPath, 'utf8')

    // Accessibility & Reka UI components
    expect(source).toContain('DialogRoot')
    expect(source).toContain('DialogPortal')
    expect(source).toContain('DialogOverlay')
    expect(source).toContain('DialogContent')
    expect(source).toContain('DialogTitle')
    expect(source).toContain('role="dialog"')
    expect(source).toContain('aria-modal="true"')

    // Custom fade transitions
    expect(source).toContain('name="fade"')
    expect(source).toContain('name="onboarding-fade"')

    // Logo image paths and AppVersion component
    expect(source).toContain('src="/turismonijar.svg"')
    expect(source).toContain('src="/logos/01.webp"')
    expect(source).toContain('src="/logos/02.webp"')
    expect(source).toContain('src="/logos/03.webp"')
    expect(source).toContain('src="/logos/04.webp"')
    expect(source).toContain('<AppVersion')
  })

  it('implements sessionStorage check and 3-second auto-dismiss timer on mount', () => {
    const source = readFileSync(componentPath, 'utf8')

    expect(source).toContain('sessionStorage.getItem(\'turismonijar_onboarding_shown\')')
    expect(source).toContain('sessionStorage.setItem(\'turismonijar_onboarding_shown\', \'true\')')
    expect(source).toContain('setTimeout')
    expect(source).toContain('3000')
    expect(source).toContain('isOpen.value = false')
  })
})
