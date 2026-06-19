<script setup lang="ts">
import { AlertTriangle, X } from '@lucide/vue'
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle
} from 'reka-ui'

withDefaults(defineProps<{
  message: string
  title?: string
  closeLabel?: string
}>(), {
  title: 'Beach flag notification',
  closeLabel: 'Close'
})

const emit = defineEmits<{
  close: []
}>()

const titleId = 'flag-notification-modal-title'

function handleOpenChange(open: boolean) {
  if (!open) {
    emit('close')
  }
}
</script>

<template>
  <DialogRoot :open="true" @update:open="handleOpenChange">
    <DialogPortal disabled force-mount>
      <DialogOverlay class="fixed inset-0 z-[10000] bg-slate-950/55 backdrop-blur-sm" />
      <DialogContent
        class="fixed left-1/2 top-1/2 z-[10001] flex max-h-[min(82dvh,42rem)] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-amber-300 bg-amber-50 text-amber-950 shadow-2xl focus:outline-none"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <DialogTitle :id="titleId" class="sr-only">{{ title }}</DialogTitle>
        <DialogClose
          type="button"
          class="absolute right-3 top-3 z-10 inline-flex size-10 items-center justify-center rounded-full text-amber-900 transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-50"
          :aria-label="closeLabel"
        >
          <X class="size-5" aria-hidden="true" />
        </DialogClose>

        <div class="flex min-h-0 gap-4 p-6 pr-14">
          <div class="shrink-0 text-amber-600" aria-hidden="true">
            <AlertTriangle class="size-8" :stroke-width="2.4" />
          </div>
          <div class="min-h-0 flex-1 overflow-y-auto break-words pr-1 text-base font-medium leading-relaxed whitespace-pre-wrap">
            {{ message }}
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
