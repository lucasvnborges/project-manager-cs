import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['@pinia/nuxt', '@nuxt/eslint', '@nuxt/test-utils/module'],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: false },
  $development: {
    devtools: { enabled: true }
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
        interval: 300
      }
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'Gerenciador de Projetos',
      meta: [
        {
          name: 'description',
          content: 'Gerencie seus projetos: crie, edite, favorite, busque e organize.'
        }
      ]
    }
  }
})
