import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: [
    '@nuxt/image',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    'shadcn-nuxt',
    '@nuxtjs/ionic',
    '@vite-pwa/nuxt',
  ],
  app: {
    head: {
      htmlAttrs: {
        lang: 'es'
      }
    },
    pageTransition: { name: 'page' },
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "@/components/ui"
     */
    componentDir: 'components/ui',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    locales: [
      { code: 'es', language: 'es-ES', dir: 'ltr' },
      { code: 'en', language: 'en-US', dir: 'ltr' }
    ],
    defaultLocale: 'es',
    strategy: 'prefix',
  },
  pwa: {
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    registerWebManifestInRouteRules: true,
    base: '/',
    scope: '/',
    includeAssets: ['favicon.ico', 'favicon.png', 'icon.svg', 'robots.txt'],
    manifest: {
      name: 'Turismo Níjar',
      short_name: 'Turismo Níjar',
      description: 'Guía de turismo y eventos',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      lang: 'es',
      categories: ['travel'],
      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable'
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
    workbox: {
      maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB to avoid build errors
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
      cleanupOutdatedCaches: true,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/nominatim\.openstreetmap\.org\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'geocoding-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /^https:\/\/api\.mapbox\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'mapbox-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/',
      type: 'module'
    }
  },

})