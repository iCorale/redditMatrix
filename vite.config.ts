import { defineConfig } from 'vite'
import { getAliases } from 'vite-aliases'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import wasmPack from 'vite-plugin-wasm-pack'
import { VitePWA } from 'vite-plugin-pwa'
import preprocess from 'svelte-preprocess'
import Icons from 'unplugin-icons/vite'
import comlink from 'vite-plugin-comlink'
import worker, { pluginHelper } from 'vite-plugin-worker'

const BASE_URL = process.env.NODE_ENV === 'production' ? '/redditMatrix/' : '/'
// https://vitejs.dev/config/
export default defineConfig({
  base: BASE_URL,
  plugins: [
    comlink({
      /**
       * Filename of type file
       * Set to a filename (releative to root) if you want to have
       * auto generated type files for your imports.
       * HIGHLY RECOMENDED WHEN USEING TYPESCRIPT!
       * @default false
       */
      typeFile: 'comlink-workers.d.ts'
    }),
    pluginHelper(),
    worker({}),
    svelte({
      preprocess: preprocess({
        scss: { prependData: '@import "src/variables";' }
      })
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
    wasmPack(['./fuzzy_complete'], [])
  ],
  publicDir: './assets/',
  build: {
    outDir: './dist/'
  },
  resolve: {
    alias: getAliases()
  },
  assetsInclude: ['**/*.svg'],
  optimizeDeps: {
    exclude: ['@roxi/routify', '@urql/svelte'],
    include: ['@roxi/routify/decorators']
  }
})
