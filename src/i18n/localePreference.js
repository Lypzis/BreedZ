export const LOCALE_STORAGE_KEY = 'breedz-locale'
export const LOCALE_COOKIE_KEY = 'breedz-locale'
export const DEFAULT_LOCALE = 'en'
export const SUPPORTED_LOCALES = ['en', 'pt-BR', 'es']
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function normalizeLocale(value) {
  const localeValue = String(value || '').trim()

  if (SUPPORTED_LOCALES.includes(localeValue)) {
    return localeValue
  }

  const lower = localeValue.toLowerCase()

  if (lower.startsWith('pt')) {
    return 'pt-BR'
  }

  if (lower.startsWith('es')) {
    return 'es'
  }

  return DEFAULT_LOCALE
}

export function readNavigatorLocaleSignal() {
  if (typeof window === 'undefined') {
    return {
      locale: DEFAULT_LOCALE,
      isSupported: true,
    }
  }

  const browserLanguage = String(window.navigator.language || '').trim()
  const lower = browserLanguage.toLowerCase()

  if (lower.startsWith('pt')) {
    return {
      locale: 'pt-BR',
      isSupported: true,
    }
  }

  if (lower.startsWith('es')) {
    return {
      locale: 'es',
      isSupported: true,
    }
  }

  if (lower.startsWith('en')) {
    return {
      locale: 'en',
      isSupported: true,
    }
  }

  return {
    locale: DEFAULT_LOCALE,
    isSupported: false,
  }
}

export function readLocaleFromPath(pathname = '') {
  const path = String(pathname || '').trim()
  const localeMatch = path.match(/^\/(en|pt-br|es)(?=\/|$)/i)

  if (!localeMatch) {
    return ''
  }

  return normalizeLocale(localeMatch[1])
}

export function readLocaleFromCookieHeader(cookieHeader = '') {
  const cookieValue = String(cookieHeader || '')
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LOCALE_COOKIE_KEY}=`))

  if (!cookieValue) {
    return ''
  }

  const [, rawValue = ''] = cookieValue.split('=')

  try {
    return normalizeLocale(decodeURIComponent(rawValue))
  } catch {
    return normalizeLocale(rawValue)
  }
}

function writeLocaleCookie(value) {
  if (typeof window === 'undefined') {
    return
  }

  const normalized = normalizeLocale(value)
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''

  window.document.cookie = `${LOCALE_COOKIE_KEY}=${encodeURIComponent(normalized)}; Max-Age=${LOCALE_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`
}

export function readStoredLocale() {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE
  }

  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)

  if (stored) {
    const normalized = normalizeLocale(stored)

    if (!readLocaleFromCookieHeader(window.document.cookie)) {
      writeLocaleCookie(normalized)
    }

    return normalized
  }

  const cookieLocale = readLocaleFromCookieHeader(window.document.cookie)

  if (cookieLocale) {
    return cookieLocale
  }

  return readNavigatorLocaleSignal().locale
}

export function readInitialLocale() {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE
  }

  const pathLocale = readLocaleFromPath(window.location.pathname)

  if (pathLocale) {
    return pathLocale
  }

  return readStoredLocale()
}

export function persistLocale(value) {
  if (typeof window === 'undefined') {
    return
  }

  const normalized = normalizeLocale(value)

  window.localStorage.setItem(LOCALE_STORAGE_KEY, normalized)
  writeLocaleCookie(normalized)
}
