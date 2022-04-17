import App from './App.svelte'
import { SplashScreen } from '@capacitor/splash-screen'
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {},
  onOfflineReady() {}
})
SplashScreen.hide()

const app = new App({
  target: document.getElementById('app')
})

export default app
