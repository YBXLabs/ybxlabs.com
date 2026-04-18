import { repositoryName } from './slicemachine.config.json';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4
  },

  devtools: { enabled: true },

  app: {
    head: {
      title: 'YBX Labs',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    }
  },

  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxt/eslint',
    '@nuxtjs/prismic',
    '@nuxtjs/tailwindcss',
    '@nuxt/fonts',
    '@nuxt/icon',
  ],

  prismic: {
    endpoint: repositoryName,
    preview: '/api/preview',
    clientConfig: {
      routes: [
        {
          type: 'case_study',
          path: '/services/:uid',
        },
        {
          type: 'page',
          path: '/:uid',
        },
        {
          type: 'page',
          uid: 'home',
          path: '/',
        },
      ]
    }
  },

  compatibilityDate: '2025-01-06',
  
  // Add runtime config for head management
  runtimeConfig: {
    // Private keys (only available on the server-side)
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || process.env.NUXT_RAZORPAY_KEY_ID,
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || process.env.NUXT_RAZORPAY_KEY_SECRET,
    // PhonePe credentials
    phonepeClientId: process.env.PHONEPE_CLIENT_ID || process.env.NUXT_PHONEPE_CLIENT_ID,
    phonepeApiKey: process.env.PHONEPE_API_KEY || process.env.NUXT_PHONEPE_API_KEY,
    
    // Public keys (exposed to the client-side)
    public: {
      siteUrl: process.env.NUXT_PUBLIC_APP_URL || 
               process.env.NODE_ENV === 'production' 
                 ? 'https://ybxlabs.com'  // Replace with your actual domain
                 : 'http://localhost:3000'
    }
  }
}) 