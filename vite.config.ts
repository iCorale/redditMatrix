import { defineConfig } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import wasmPack from 'vite-plugin-wasm-pack'
import { VitePWA } from 'vite-plugin-pwa'
import Icons from 'unplugin-icons/vite'
import comlink from 'vite-plugin-comlink'

const __dirname = dirname(fileURLToPath(import.meta.url))

const BASE_URL = process.env.NODE_ENV === 'production' ? '/redditMatrix/' : '/'

// https://vitejs.dev/config/
export default defineConfig({
  base: BASE_URL,
  worker: {
    plugins: () => [comlink()]
  },
  plugins: [
    comlink(),
    svelte({
      preprocess: vitePreprocess(),
      onwarn: (warning, handler) => {
        // MWC custom elements handle accessibility internally; suppress false positives
        if (warning.code.startsWith('a11y-')) return
        handler(warning)
      }
    }),
    Icons({ compiler: 'svelte' }),
    VitePWA({
      includeAssets: ['robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Reddit Matrix',
        description: 'A viewer for image based subreddits.',
        theme_color: '#000000',
        background_color: '#000000',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    }),
    wasmPack(['./fuzzy_complete'])
  ],
  server: {
    proxy: {
      '/reddit-api': {
        target: 'https://www.reddit.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/reddit-api/, '')
      }
    }
  },
  preview: {
    proxy: {
      '/reddit-api': {
        target: 'https://www.reddit.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/reddit-api/, '')
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  },
  publicDir: './assets/',
  build: {
    outDir: './dist/'
  },
  resolve: {
    alias: {
      '@assets': resolve(__dirname, 'src/assets'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@store': resolve(__dirname, 'src/store'),
      '@utils': resolve(__dirname, 'src/utils')
    }
  },
  assetsInclude: ['**/*.svg'],
  optimizeDeps: {
    exclude: ['@roxi/routify', 'fsevents']
  }
})
