<template>
  <ion-app>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ClientOnly>
      <Teleport to="body">
        <BottomNav :style="{ zIndex: bottomNavZIndex }" />
      </Teleport>
    </ClientOnly>
  </ion-app>
</template>
<script setup lang="ts">
  import { defineCustomElements } from '@ionic/pwa-elements/loader'
  import { StatusBar, Style } from '@capacitor/status-bar';
  import { Capacitor } from '@capacitor/core';
  import { onMounted, computed } from 'vue';
  import { useI18n, useSeoMeta, useHead, useState } from '#imports'
  import { getSafeAreaInsets } from '~/utils/safeArea'
  
  const { t } = useI18n()
  const appTitle = computed(() => t('seo.app.title'))
  const bottomNavZIndex = useState('bottomNavZIndex', () => 9999)

  onMounted(async () => {
    if (import.meta.client) {
      try {
        defineCustomElements(window);
        // Pone el texto de la hora/batería en oscuro (Style.Light) o claro (Style.Dark)
        await StatusBar.setStyle({ style: Style.Light });
        
        // En Android, pintar el fondo de la barra de blanco
        //await StatusBar.setBackgroundColor({ color: '#ffffff' });

        // Asegurar que el WebView se superpone detrás de la barra de estado
        await StatusBar.setOverlaysWebView({ overlay: true });

        // Resuelve el problema del safe-area-inset-top en dispositivos Android con Notch que devuelven 0px
        const info = await StatusBar.getInfo();
        if (info && typeof info.height === 'number' && info.height > 0) {
          const insets = getSafeAreaInsets();
          if (insets.top === 0) {
            document.documentElement.style.setProperty('--safe-area-inset-top', `${info.height}px`);
          }
        }
      } catch (e) {
        // Ignorar en web o si falla
        console.warn('Error configurando StatusBar:', e);
      }
    }
  })
  

  // Meta tags para PWA
  useSeoMeta({
    title: () => t('seo.app.title'),
    description: () => t('seo.app.description'),
    themeColor: '#ffffff',
    viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover',
    appleItunesApp: undefined,
    ogImage: 'https://app.turismonijar.es/icon-512x512.png',
  })

  // Head adicional para PWA
  useHead({
    titleTemplate: (title) => title && title !== appTitle.value ? `${title} | ${appTitle.value}` : appTitle.value,
    meta: [
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: () => appTitle.value },
    ],
    link: [
      { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      { rel: 'apple-touch-icon', href: '/icon-192x192.png' },
      { rel: 'manifest', href: '/manifest.webmanifest' }
    ],
    bodyAttrs: {
      /* class: 'overflow-hidden' */
    }
  })

</script>

<style>
  .page-enter-active,
  .page-leave-active {
    transition: all 0.4s;
  }
  .page-enter-from,
  .page-leave-to {
    opacity: 0;
    filter: blur(0.5rem);
  }
</style>