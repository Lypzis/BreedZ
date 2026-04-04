import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import { getCurrentLocaleValue, setLocale } from 'src/i18n'
import { buildLocalizedPath, isAppShellPath, routeSegmentToLocale, stripLocaleFromPath } from 'src/utils/localeRouting'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
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

  function isStandaloneAppLaunch() {
    if (typeof window === 'undefined') {
      return false
    }

    return (
      window.matchMedia?.('(display-mode: standalone)').matches
      || window.navigator.standalone === true
    )
  }

  Router.beforeEach((to) => {
    const isCatchAllRoute = to.matched.some((record) => record.path.includes(':catchAll'))

    if (isCatchAllRoute) {
      return true
    }

    const localeParam = typeof to.params.locale === 'string' ? to.params.locale : ''
    const strippedPath = stripLocaleFromPath(to.path)

    if (localeParam) {
      if (isStandaloneAppLaunch() && strippedPath === '/') {
        return '/'
      }

      setLocale(routeSegmentToLocale(localeParam), { persist: false })
      return true
    }

    if (isAppShellPath(to.path)) {
      return true
    }

    return buildLocalizedPath(getCurrentLocaleValue(), to.fullPath)
  })

  return Router
})
