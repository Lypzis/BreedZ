import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import { getCurrentLocaleValue, setLocale } from 'src/i18n'
import { readLocaleFromCookieHeader } from 'src/i18n/localePreference'
import { buildLocalizedPath, isAppShellPath, localeFromPath } from 'src/utils/localeRouting'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function ({ ssrContext }) {
  if (process.env.SERVER) {
    const cookieLocale = readLocaleFromCookieHeader(ssrContext?.req?.headers?.cookie)

    if (cookieLocale) {
      setLocale(cookieLocale, { persist: false })
    }
  }

  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  function normalizeTrailingSlash(path) {
    if (typeof path !== 'string' || path === '/' || !path.endsWith('/')) {
      return path
    }

    return path.replace(/\/+$/, '') || '/'
  }

  Router.beforeEach((to) => {
    const normalizedPath = normalizeTrailingSlash(to.path)

    if (normalizedPath !== to.path) {
      return {
        path: normalizedPath,
        query: to.query,
        hash: to.hash,
        replace: true,
      }
    }

    const isCatchAllRoute = to.matched.some((record) => record.path.includes(':catchAll'))

    if (isCatchAllRoute) {
      if (process.env.SERVER) {
        ssrContext?.res?.status?.(404)
      }

      return true
    }

    const routeLocale = localeFromPath(to.path)

    if (routeLocale) {
      setLocale(routeLocale, { persist: false })
      return true
    }

    if (isAppShellPath(to.path)) {
      return true
    }

    return buildLocalizedPath(getCurrentLocaleValue(), to.fullPath)
  })

  return Router
})
