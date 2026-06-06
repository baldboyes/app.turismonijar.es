import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/image',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    'shadcn-nuxt',
    '@nuxtjs/ionic'
  ],
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
      { code: 'es', language: 'es-ES' },
      { code: 'en', language: 'en-US' }
    ],
    defaultLocale: 'es',
  }
})