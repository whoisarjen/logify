import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },

  app: {
    head: {
      title: 'Logify - Open Source Log Management',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Open source log management platform. Ingest, search, and visualize your application logs in real-time.' },
        { property: 'og:title', content: 'Logify - Open Source Log Management' },
        { property: 'og:description', content: 'Open source log management platform. Ingest, search, and visualize your application logs in real-time.' },
        { property: 'og:url', content: 'https://logify.whoisarjen.com' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
      htmlAttrs: {
        lang: 'en',
      },
    },
  },

  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxtjs/color-mode',
    '@nuxtjs/google-fonts',
    '@vueuse/nuxt',
  ],

  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'dark',
  },

  googleFonts: {
    families: {
      Inter: [300, 400, 500, 600, 700, 800],
      'JetBrains Mono': [400, 500, 600],
    },
    display: 'swap',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  nitro: {
    preset: 'vercel',
    vercel: {
      functions: {
        maxDuration: 60,
      },
    },
  },

  routeRules: {
    '/register': { redirect: '/login' },
    '/api/v1/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      },
    },
    '/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    },
  },
})
