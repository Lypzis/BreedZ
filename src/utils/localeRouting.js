import { DEFAULT_LOCALE, normalizeLocale } from 'src/i18n/localePreference'

const ROUTE_SEGMENT_TO_LOCALE = {
  en: 'en',
  'pt-br': 'pt-BR',
}

const LOCALE_TO_ROUTE_SEGMENT = {
  en: 'en',
  'pt-BR': 'pt-br',
}

export function routeSegmentToLocale(value) {
  const segment = String(value || '').trim().toLowerCase()
  return ROUTE_SEGMENT_TO_LOCALE[segment] || DEFAULT_LOCALE
}

export function localeToRouteSegment(value) {
  const locale = normalizeLocale(value)
  return LOCALE_TO_ROUTE_SEGMENT[locale] || LOCALE_TO_ROUTE_SEGMENT[DEFAULT_LOCALE]
}

export function stripLocaleFromPath(value = '/') {
  const stripped = String(value || '/').replace(/^\/(en|pt-br)(?=\/|$)/i, '')
  return stripped || '/'
}

export function buildLocalizedPath(locale, path = '/') {
  const normalizedPath = stripLocaleFromPath(path)

  if (normalizedPath.startsWith('/app')) {
    return normalizedPath
  }

  const localeSegment = localeToRouteSegment(locale)

  return normalizedPath === '/' ? `/${localeSegment}` : `/${localeSegment}${normalizedPath}`
}
