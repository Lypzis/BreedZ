import { boot } from 'quasar/wrappers'
import { hasSavedAnimals } from 'src/services/animals-db'
import { setLocale } from 'src/i18n'
import { readStoredLocale } from 'src/i18n/localePreference'
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

    // When the installed/offline app reopens from a localized marketing URL,
    // return to the app shell using the user's saved in-app language.
    setLocale(readStoredLocale(), { persist: false })
    return '/'
  })
})
