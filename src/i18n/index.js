import { ref } from 'vue'
import { messages } from './messages.js'
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  normalizeLocale,
  persistLocale,
  readStoredLocale,
} from './localePreference.js'

function getPathValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return current[key]
    }

    return undefined
  }, obj)
}

function interpolate(template, params) {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    if (!(key in params)) {
      return match
    }

    return String(params[key])
  })
}

const locale = ref(readStoredLocale())

function applyHtmlLang(value) {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.setAttribute('lang', value)
}

function resolveMessage(key) {
  const currentLocaleMessage = getPathValue(messages[locale.value], key)

  if (currentLocaleMessage !== undefined) {
    return currentLocaleMessage
  }

  return getPathValue(messages[DEFAULT_LOCALE], key)
}

export function getCurrentLocaleValue() {
  return locale.value
}

export function setLocale(value, { persist = true } = {}) {
  const normalized = normalizeLocale(value)
  locale.value = normalized

  if (persist) {
    persistLocale(normalized)
  }

  applyHtmlLang(normalized)
}

export function t(key, params = {}) {
  const value = resolveMessage(key)

  if (typeof value !== 'string') {
    return key
  }

  return interpolate(value, params)
}

export function tm(key) {
  return resolveMessage(key)
}

export function useI18nText() {
  return {
    locale,
    setLocale,
    t,
    tm,
  }
}

applyHtmlLang(locale.value)

export const availableLocales = SUPPORTED_LOCALES
