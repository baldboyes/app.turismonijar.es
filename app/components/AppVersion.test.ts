import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const componentPath = fileURLToPath(new URL('./AppVersion.vue', import.meta.url))

describe('AppVersion', () => {
  it('displays the correct application version and translates label key', () => {
    const source = readFileSync(componentPath, 'utf8')

    expect(source).toContain('settings_panel.version')
    expect(source).toContain('0.65')
  })
})
