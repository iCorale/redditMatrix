import App from './App.svelte'
import { SplashScreen } from '@capacitor/splash-screen'

// Service Worker permanently disabled — iOS Safari has a bug where any SW
// registration on the origin causes cross-origin iframe 302 redirects to
// reload the parent page.
// PWA installation is still supported via manifest.webmanifest.

SplashScreen.hide()

const app = new App({
  target: document.getElementById('app')!
})

export default app
