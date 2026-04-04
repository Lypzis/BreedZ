import { boot } from 'quasar/wrappers'
import { getCurrentLocaleValue } from 'src/i18n'
import { hasSavedAnimals } from 'src/services/animals-db'
import { buildLocalizedPath, stripLocaleFromPath } from 'src/utils/localeRouting'

export default boot(({ router }) => {
  router.beforeEach(async (to) => {
    if (stripLocaleFromPath(to.path) !== '/') {
      return true
    }

    if (typeof window === 'undefined') {
      return true
    }

    const hasAnimals = await hasSavedAnimals()

    if (!hasAnimals) {
      return true
    }

    return buildLocalizedPath(getCurrentLocaleValue(), '/app')
  })
})
