/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config file > pwa > workboxMode is set to "InjectManifest"
 */

import { clientsClaim } from 'workbox-core'
import {
  matchPrecache,
  precacheAndRoute,
  cleanupOutdatedCaches,
} from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'

self.skipWaiting()
clientsClaim()

const APP_START_URL = '/'
const precacheEntries = [...self.__WB_MANIFEST]
const indexHtmlEntry = precacheEntries.find((entry) => entry.url === 'index.html')
const fallbackHtmlEntry = precacheEntries.find((entry) => entry.url === process.env.PWA_FALLBACK_HTML)
const appStartEntry = indexHtmlEntry || fallbackHtmlEntry

if (appStartEntry) {
  precacheEntries.push({
    url: APP_START_URL,
    revision: appStartEntry.revision,
  })
}

// Use with precache injection
precacheAndRoute(precacheEntries)

cleanupOutdatedCaches()

// Navigation requests should use live SSR HTML when available.
// When offline (or if the fetch fails), fall back to the cached offline shell.
if (process.env.PROD) {
  registerRoute(
    ({ request }) => request.mode === 'navigate',
    async ({ event }) => {
      try {
        return await fetch(event.request)
      } catch {
        return (
          (await matchPrecache(APP_START_URL))
          || (await matchPrecache(process.env.PWA_FALLBACK_HTML))
          || Response.error()
        )
      }
    },
  )
}
