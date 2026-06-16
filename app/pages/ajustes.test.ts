import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it, vi } from 'vitest'
import AjustesPage from './ajustes.vue'

const translations: Record<string, string> = {
  ajustes: 'Settings',
  title1: 'Turismo Níjar',
  'settings_panel.language_title': 'Language',
  'settings_panel.language_subtitle': 'Choose your preferred language',
  'settings_panel.version': 'Version',
  'languages.es': 'Spanish',
  'languages.en': 'English',
  'seo.settings.title': 'Settings page',
  'seo.settings.description': 'Manage settings'
}

function t(key: string) {
  return translations[key] ?? key
}

vi.mock('#imports', () => ({
  useI18n: () => ({ locale: 'es', t }),
  useSeoMeta: vi.fn(),
  useSwitchLocalePath: () => (locale: string) => `/${locale}`
}), { virtual: true })

async function renderAjustesPage() {
  const app = createSSRApp({
    render: () => h(AjustesPage)
  })

  app.config.globalProperties.$t = t
  app.component('NuxtLink', {
    props: ['to'],
    template: '<a :href="to"><slot /></a>'
  })

  return renderToString(app)
}

describe('ajustes page', () => {
  it('omits the removed app info panel while keeping settings essentials', async () => {
    const html = await renderAjustesPage()

    expect(html).not.toContain('settings_panel.info_title')
    expect(html).not.toContain('settings_panel.framework')
    expect(html).not.toContain('settings_panel.environment')
    expect(html).toContain('Settings')
    expect(html).toContain('Language')
    expect(html).toContain('Spanish')
    expect(html).toContain('English')
    expect(html).toContain('src="/turismonijar.svg"')
    expect(html).toContain('alt="Turismo Níjar"')
    expect(html).toContain('turismonijar.es')
    expect(html).toContain('turismo@nijar.es')
    expect(html).toContain('+34950612165')
    expect(html).toContain('Version')
    expect(html).toContain('0.65')
  })
})
