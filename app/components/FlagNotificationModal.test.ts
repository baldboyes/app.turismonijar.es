import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import FlagNotificationModal from './FlagNotificationModal.vue'

const componentPath = fileURLToPath(new URL('./FlagNotificationModal.vue', import.meta.url))

async function renderModal(message: string) {
  const app = createSSRApp({
    render: () => h(FlagNotificationModal, {
      message,
      title: 'Beach flag notification',
      closeLabel: 'Cerrar'
    })
  })

  return renderToString(app)
}

describe('FlagNotificationModal', () => {
  it('renders an accessible alert modal with a scrollable message area', async () => {
    const html = await renderModal('Mensaje de prueba')

    expect(html).toContain('role="dialog"')
    expect(html).toContain('aria-modal="true"')
    expect(html).toContain('aria-labelledby="flag-notification-modal-title"')
    expect(html).toContain('id="flag-notification-modal-title"')
    expect(html).toContain('Beach flag notification')
    expect(html).toContain('aria-label="Cerrar"')
    expect(html).toContain('Mensaje de prueba')
    expect(html).toContain('bg-amber-50')
    expect(html).toContain('overflow-y-auto')
    expect(html).toContain('whitespace-pre-wrap')
    expect(html).toContain('break-words')
  })

  it('keeps the close and keyboard focus behavior wired in the modal component', () => {
    const source = readFileSync(componentPath, 'utf8')

    expect(source).toContain('DialogRoot')
    expect(source).toContain('@update:open="handleOpenChange"')
    expect(source).toContain('DialogContent')
    expect(source).toContain('DialogTitle')
    expect(source).toContain('DialogClose')
    expect(source).toContain('function handleOpenChange(open: boolean)')
    expect(source).toContain('if (!open)')
    expect(source).not.toContain('function handleKeydown')
  })
})
