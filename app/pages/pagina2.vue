<template>
  <ion-page>
    <header class="custom-header p-4">
      <h1 class="text-xl font-bold text-gray-800">{{ $t('title2') }}</h1>
    </header>
    <ion-content :fullscreen="false">
      <div class="p-4">
        <NuxtLink :to="localePath('/')" class="text-emerald-600 hover:underline font-semibold block mb-4">
          &larr; {{ $t('page1') }}
        </NuxtLink>
        <p v-for="n in 30" :key="n" class="text-red-500 mb-2">
          {{ $t('text_red') }}
        </p>
      </div>
    </ion-content>
    <ion-footer>
      <BottomNav />
    </ion-footer>
  </ion-page>
</template>
<style scoped>


</style>
<script setup lang="ts">
  import { useSeoMeta, useI18n } from '#imports'
  const localePath = useLocalePath()
  const { t } = useI18n()

  useSeoMeta({
    title: () => t('seo.page2.title'),
    description: () => t('seo.page2.description'),
  })
</script>