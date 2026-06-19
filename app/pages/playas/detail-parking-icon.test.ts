import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const detailPagePath = fileURLToPath(new URL('./[id].vue', import.meta.url))

describe('beach detail parking full badge', () => {
  it('renders the approved parking icon before the warning text on the red badge', () => {
    const source = readFileSync(detailPagePath, 'utf8')

    expect(source).toContain('bg-red-600/90 text-white')
    expect(source).toContain('<ParkingFullIcon class="size-3.5 text-white" />')
    expect(source.indexOf('<ParkingFullIcon class="size-3.5 text-white" />'))
      .toBeLessThan(source.indexOf("$t('playas_page.parking_full')"))
  })
})
