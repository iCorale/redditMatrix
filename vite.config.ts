import { defineConfig } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import wasmPack from 'vite-plugin-wasm-pack'
import Icons from 'unplugin-icons/vite'
import comlink from 'vite-plugin-comlink'

const __dirname = dirname(fileURLToPath(import.meta.url))

const BASE_URL = process.env.NODE_ENV === 'production' ? '/redditMatrix/' : '/'

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
        if (warning.code.startsWith('a11y-')) return
        handler(warning)
      }
    }),
    Icons({ compiler: 'svelte' }),
    wasmPack(['./fuzzy_complete']),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  preview: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
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
