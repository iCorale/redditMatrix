if(!self.define){let s,e={};const l=(l,i)=>(l=new URL(l+".js",i).href,e[l]||new Promise((e=>{if("document"in self){const s=document.createElement("script");s.src=l,s.onload=e,document.head.appendChild(s)}else s=l,importScripts(l),e()})).then((()=>{let s=e[l];if(!s)throw new Error(`Module ${l} didn’t register its module`);return s})));self.define=(i,n)=>{const r=s||("document"in self?document.currentScript.src:"")||location.href;if(e[r])return;let a={};const u=s=>l(s,r),t={module:{uri:r},exports:a,require:u};e[r]=Promise.all(i.map((s=>t[s]||u(s)))).then((s=>(n(...s),a)))}}define(["./workbox-3e4da89b"],(function(s){"use strict";self.addEventListener("message",(s=>{s.data&&"SKIP_WAITING"===s.data.type&&self.skipWaiting()})),s.precacheAndRoute([{url:"assets/_fallback.31644b71.css",revision:null},{url:"assets/_fallback.4cfdd99c.js",revision:null},{url:"assets/_layout.5b3d3815.js",revision:null},{url:"assets/_layout.eb722484.css",revision:null},{url:"assets/_subreddit_.5508ddf3.css",revision:null},{url:"assets/_subreddit_.6824c6fd.js",revision:null},{url:"assets/aria-property.797fe874.js",revision:null},{url:"assets/CancellableList.15ab555b.js",revision:null},{url:"assets/CancellableList.e08264e0.css",revision:null},{url:"assets/Card.1b95d5a1.css",revision:null},{url:"assets/Card.4f5ef0cb.js",revision:null},{url:"assets/if-defined.6486e9c9.js",revision:null},{url:"assets/index.3a6f08c7.css",revision:null},{url:"assets/index.7184bdcf.js",revision:null},{url:"assets/index.bb1110f9.js",revision:null},{url:"assets/index.c5e38cdc.js",revision:null},{url:"assets/index.f581e6e2.css",revision:null},{url:"assets/mwc-list.64318535.js",revision:null},{url:"assets/search.85302df6.js",revision:null},{url:"assets/settings.94998b63.css",revision:null},{url:"assets/settings.bcedddf0.js",revision:null},{url:"assets/test.17f353c8.js",revision:null},{url:"assets/test.328eea4a.css",revision:null},{url:"assets/transition.171a74a8.js",revision:null},{url:"assets/vendor.0ae95c6a.js",revision:null},{url:"assets/web.4eda06fe.js",revision:null},{url:"assets/web.8d7e82a8.js",revision:null},{url:"assets/web.fbc0e260.js",revision:null},{url:"index.html",revision:"ae1fecbe3cd1867a7586da87349d161a"},{url:"robots.txt",revision:"5e0bd1c281a62a380d7a948085bfe2d1"},{url:"apple-touch-icon.png",revision:"417ac0b1905f415266814984bd35d61b"},{url:"android-chrome-192x192.png",revision:"393bb74036ba9a9a2f10f4fc015a0a37"},{url:"android-chrome-512x512.png",revision:"1db72aef407daa7f0c77e3a1f600ca5f"},{url:"manifest.webmanifest",revision:"a6ee9c5e6517c69d013b39a8bd827cea"}],{}),s.cleanupOutdatedCaches(),s.registerRoute(new s.NavigationRoute(s.createHandlerBoundToURL("index.html")))}));
