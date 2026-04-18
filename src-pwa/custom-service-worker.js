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
  createHandlerBoundToURL,
} from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'

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

// Non-SSR fallbacks to index.html
// Production SSR fallbacks to offline.html (except for dev)
if (process.env.PROD) {
  registerRoute(
    ({ request, url }) => request.mode === 'navigate' && url.pathname === APP_START_URL,
    async () => matchPrecache(APP_START_URL) || matchPrecache(process.env.PWA_FALLBACK_HTML),
  )

  registerRoute(
    new NavigationRoute(createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML), {
      denylist: [new RegExp(process.env.PWA_SERVICE_WORKER_REGEX), /workbox-(.)*\.js$/],
    }),
  )
}
