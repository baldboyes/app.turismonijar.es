import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it, vi } from 'vitest'
import CustomDrawer from './CustomDrawer.vue'

const translations: Record<string, string> = {
  'drawer.explore_fallback': 'Explore beaches',
  last_update_label: 'Last update',
  provisional: 'Provisional',
  definitivo: 'Definitive',
  'drawer.collapse': 'Collapse drawer'
}

function t(key: string) {
  return translations[key] ?? key
}

vi.mock('#imports', () => ({
  useI18n: () => ({ t })
}), { virtual: true })

async function renderCustomDrawer(props: { lastModified?: string; isProvisional?: boolean; startHidden?: boolean; targetState?: 'hidden' | 'peek' | 'mid' | 'full' }) {
  const app = createSSRApp({
    render: () => h(CustomDrawer, props)
  })

  app.config.globalProperties.$t = t

  return renderToString(app)
}

describe('CustomDrawer', () => {
  it('renders the update label separately above the formatted date', async () => {
    const html = await renderCustomDrawer({ lastModified: '202606151430' })

    expect(html).toContain('Last update')
    expect(html).toContain('15/06/2026 14:30')
    expect(html).toMatch(/<span class="block text-\[9px\] leading-none"[^>]*>Last update<\/span><span class="block text-\[11px\] leading-tight"[^>]*>15\/06\/2026 14:30<\/span>/)
  })

  it('renders the provisional status with the aligned trailing class', async () => {
    const html = await renderCustomDrawer({ lastModified: '202606151430', isProvisional: true })

    expect(html).toContain('Provisional')
    expect(html).toContain('text-amber-700')
    expect(html).toContain('ml-auto shrink-0 text-[9px] font-extrabold uppercase tracking-wider')
  })

  it('renders the definitive status when data is not provisional', async () => {
    const html = await renderCustomDrawer({ lastModified: '202606151430', isProvisional: false })

    expect(html).toContain('Definitive')
    expect(html).toContain('text-emerald-700')
  })

  it('keeps a start-hidden drawer offscreen before the mounted target-state animation runs', async () => {
    const html = await renderCustomDrawer({ startHidden: true, targetState: 'mid' })

    expect(html).toContain('transform:translateY(calc(1000px + var(--safe-area-top, 0px)))')
  })
})
