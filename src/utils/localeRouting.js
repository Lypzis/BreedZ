import { DEFAULT_LOCALE, normalizeLocale } from 'src/i18n/localePreference'

const ROUTE_SEGMENT_TO_LOCALE = {
  en: 'en',
  'pt-br': 'pt-BR',
  es: 'es',
}

const LOCALE_TO_ROUTE_SEGMENT = {
  en: 'en',
  'pt-BR': 'pt-br',
  es: 'es',
}

const LOCALIZED_PUBLIC_PATHS = {
  en: {
    '/': '/',
    '/guides/track-cattle-breeding-dates': '/guides/track-cattle-breeding-dates',
    '/guides/how-to-track-cattle-lineage': '/guides/how-to-track-cattle-lineage',
    '/about': '/about',
    '/contact': '/contact',
    '/privacy': '/privacy',
    '/terms': '/terms',
  },
  'pt-BR': {
    '/': '/',
    '/guides/track-cattle-breeding-dates': '/guias/acompanhar-datas-de-cobertura-no-gado',
    '/guides/how-to-track-cattle-lineage': '/guias/como-acompanhar-linhagem-no-gado',
    '/about': '/sobre',
    '/contact': '/contato',
    '/privacy': '/privacidade',
    '/terms': '/termos',
  },
  es: {
    '/': '/',
    '/guides/track-cattle-breeding-dates': '/guias/registrar-fechas-de-reproduccion-del-ganado',
    '/guides/how-to-track-cattle-lineage': '/guias/como-rastrear-el-linaje-del-ganado',
    '/about': '/acerca-de',
    '/contact': '/contacto',
    '/privacy': '/privacidad',
    '/terms': '/terminos',
  },
}

const REVERSE_LOCALIZED_PUBLIC_PATHS = Object.fromEntries(
  Object.entries(LOCALIZED_PUBLIC_PATHS).map(([locale, pathMap]) => [
    locale,
    Object.fromEntries(Object.entries(pathMap).map(([internalPath, localizedPath]) => [localizedPath, internalPath])),
  ]),
)

function splitPathAndSuffix(value = '/') {
  const rawValue = String(value || '/')
  const suffixIndex = rawValue.search(/[?#]/)

  if (suffixIndex === -1) {
    return { path: rawValue || '/', suffix: '' }
  }

  return {
    path: rawValue.slice(0, suffixIndex) || '/',
    suffix: rawValue.slice(suffixIndex),
  }
}

function normalizeLocalizedPublicPath(locale, path) {
  const normalizedLocale = normalizeLocale(locale)
  const reversePathMap = REVERSE_LOCALIZED_PUBLIC_PATHS[normalizedLocale] || {}
  return reversePathMap[path] || path
}

function localizePublicPath(locale, path) {
  const normalizedLocale = normalizeLocale(locale)
  const localizedPathMap = LOCALIZED_PUBLIC_PATHS[normalizedLocale] || {}
  return localizedPathMap[path] || path
}

export function routeSegmentToLocale(value) {
  const segment = String(value || '').trim().toLowerCase()
  return ROUTE_SEGMENT_TO_LOCALE[segment] || DEFAULT_LOCALE
}

export function localeFromPath(value = '/') {
  const { path } = splitPathAndSuffix(value)
  const localeMatch = path.match(/^\/(en|pt-br|es)(?=\/|$)/i)

  if (!localeMatch) {
    return ''
  }

  return routeSegmentToLocale(localeMatch[1])
}

export function localeToRouteSegment(value) {
  const locale = normalizeLocale(value)
  return LOCALE_TO_ROUTE_SEGMENT[locale] || LOCALE_TO_ROUTE_SEGMENT[DEFAULT_LOCALE]
}

export function stripLocaleFromPath(value = '/') {
  const { path, suffix } = splitPathAndSuffix(value)
  const localeMatch = path.match(/^\/(en|pt-br|es)(?=\/|$)/i)
  const stripped = path.replace(/^\/(en|pt-br|es)(?=\/|$)/i, '') || '/'

  if (!localeMatch) {
    return `${stripped}${suffix}`
  }

  const routeLocale = routeSegmentToLocale(localeMatch[1])
  const normalizedPath = normalizeLocalizedPublicPath(routeLocale, stripped)
  return `${normalizedPath}${suffix}`
}

export function isAppShellPath(path = '/') {
  const normalizedPath = String(path || '/')

  return (
    normalizedPath === '/'
    || normalizedPath === '/tutorial'
    || normalizedPath.startsWith('/animals')
    || normalizedPath.startsWith('/events')
    || normalizedPath.startsWith('/account')
    || normalizedPath.startsWith('/settings')
  )
}

export function buildLocalizedPath(locale, path = '/') {
  const { path: normalizedPathWithNoLocale, suffix } = splitPathAndSuffix(stripLocaleFromPath(path))
  const normalizedPath = normalizedPathWithNoLocale || '/'

  const localeSegment = localeToRouteSegment(locale)
  const localizedPath = localizePublicPath(locale, normalizedPath)

  return localizedPath === '/'
    ? `/${localeSegment}${suffix}`
    : `/${localeSegment}${localizedPath}${suffix}`
}
