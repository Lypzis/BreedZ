export const LOCALE_STORAGE_KEY = 'breedz-locale'
export const DEFAULT_LOCALE = 'en'
export const SUPPORTED_LOCALES = ['en', 'pt-BR']

export function normalizeLocale(value) {
  const localeValue = String(value || '').trim()

  if (SUPPORTED_LOCALES.includes(localeValue)) {
    return localeValue
  }

  const lower = localeValue.toLowerCase()

  if (lower.startsWith('pt')) {
    return 'pt-BR'
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

export function readStoredLocale() {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE
  }

  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)

  if (stored) {
    return normalizeLocale(stored)
  }

  return readNavigatorLocaleSignal().locale
}

export function persistLocale(value) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(LOCALE_STORAGE_KEY, value)
}
