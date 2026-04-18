import { boot } from 'quasar/wrappers'
import { hasSavedAnimals } from 'src/services/animals-db'
import { stripLocaleFromPath } from 'src/utils/localeRouting'

function isStandaloneAppLaunch() {
  if (typeof window === 'undefined') {
    return false
  }

  return (
    window.matchMedia?.('(display-mode: standalone)').matches
    || window.navigator.standalone === true
  )
}

function shouldOpenSavedAppHome(path) {
  if (typeof window === 'undefined') {
    return false
  }

  if (path === '/') {
    return false
  }

  if (stripLocaleFromPath(path) !== '/') {
    return false
  }

  return isStandaloneAppLaunch() || !window.navigator.onLine
}

export default boot(({ router }) => {
  router.beforeEach(async (to) => {
    if (!shouldOpenSavedAppHome(to.path)) {
      return true
    }

    const hasAnimals = await hasSavedAnimals().catch(() => false)

    if (!hasAnimals) {
      return true
    }

    return '/'
  })
})
