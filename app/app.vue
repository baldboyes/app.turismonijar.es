<template>
  <ion-app>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </ion-app>
</template>
<script setup lang="ts">
  import { defineCustomElements } from '@ionic/pwa-elements/loader'
  import { StatusBar, Style } from '@capacitor/status-bar';
  

  defineNuxtPlugin(async () => {
    defineCustomElements(window)
    if (import.meta.client) {
      try {
        // Pone el texto de la hora/batería en oscuro o claro
        await StatusBar.setStyle({ style: Style.Light });
        
        // En Android, pintar el fondo de la barra de blanco
        await StatusBar.setBackgroundColor({ color: '#ffffff' });

        // Asegurar que el WebView se superpone detrás de la barra de estado
        await StatusBar.setOverlaysWebView({ overlay: true });
      } catch (e) {
        // Ignorar en web
      }
    }
  })
  

  // Meta tags para PWA
  useSeoMeta({
    title: 'Turismo Níjar',
    description: 'Aplicación para el turismo de Níjar',
    themeColor: '#ffffff',
    viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover',
    appleItunesApp: undefined,
    ogImage: 'https://app.turismonijar.es/icon-512x512.png',
  })

  // Head adicional para PWA
  useHead({
    titleTemplate: (title) => title && title !== 'Turismo Níjar' ? `${title} | Turismo Níjar` : 'Turismo Níjar',
    meta: [
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'Turismo Níjar' },
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