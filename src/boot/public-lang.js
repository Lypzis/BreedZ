import { defineBoot } from '#q-app/wrappers'
import { Lang } from 'quasar'
import enUs from 'quasar/lang/en-US.js'
import es from 'quasar/lang/es.js'
import ptBr from 'quasar/lang/pt-BR.js'
import { localeFromPath } from 'src/utils/localeRouting'

const QUASAR_LANG_BY_LOCALE = {
  en: enUs,
  'pt-BR': ptBr,
  es,
}

export default defineBoot(({ router, ssrContext }) => {
  router.beforeEach((to) => {
    const locale = localeFromPath(to.path) || 'en'
    Lang.set(QUASAR_LANG_BY_LOCALE[locale] || enUs, ssrContext)
    return true
  })
})
