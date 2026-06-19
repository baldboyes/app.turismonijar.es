import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import BeachStatusFlagIcon from './BeachStatusFlagIcon.vue'

const FLAG_PATH = 'M19.27,4.68a1.79,1.79,0,0,0-1.6-.25,7.53,7.53,0,0,1-2.17.28,8.54,8.54,0,0,1-3.13-.78A10.15,10.15,0,0,0,8.5,3c-2.89,0-4,1-4.2,1.14a1,1,0,0,0-.3.72V20a1,1,0,0,0,2,0V15.7a6.28,6.28,0,0,1,2.5-.41,8.54,8.54,0,0,1,3.13.78A10.15,10.15,0,0,0,15.5,17,7.66,7.66,0,0,0,19,16.3a1.74,1.74,0,0,0,1-1.55V6.11A1.77,1.77,0,0,0,19.27,4.68Z'

async function renderIcon(props: { status?: string; class?: string }) {
  const app = createSSRApp({
    render: () => h(BeachStatusFlagIcon, props)
  })

  return renderToString(app)
}

describe('BeachStatusFlagIcon', () => {
  it('renders the approved flag SVG as a decorative colored icon', async () => {
    const html = await renderIcon({ status: 'roja', class: 'size-4' })

    expect(html).toContain('viewbox="0 0 24 24"')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('fill="currentColor"')
    expect(html).toContain('stroke="white"')
    expect(html).toContain('stroke-width="2.5"')
    expect(html).toContain('stroke-linecap="round"')
    expect(html).toContain('var(--color-status-roja)')
    expect(html).toContain(FLAG_PATH)
  })
})
