import { todayDateString } from './dates.js'

function isDatedOnOrBefore(value, referenceDate = todayDateString()) {
  if (!value) {
    return false
  }

  return String(value) <= String(referenceDate)
}

function normalizeStatusValue(value) {
  const normalizedValue = String(value || '').trim().toLowerCase()

  if (normalizedValue === 'sold' || normalizedValue === 'dead' || normalizedValue === 'active') {
    return normalizedValue
  }

  return ''
}

export function resolveBaseStatus(baseStatus, currentStatus, events = [], referenceDate = todayDateString()) {
  const persistedBaseStatus = normalizeStatusValue(baseStatus)

  if (persistedBaseStatus) {
    return persistedBaseStatus
  }

  const fallbackStatus = normalizeStatusValue(currentStatus) || 'active'

  if (fallbackStatus === 'dead' && events.some((event) => event.type === 'death')) {
    return 'active'
  }

  if (
    fallbackStatus === 'sold'
    && events.some((event) => event.type === 'sale' && isDatedOnOrBefore(event.date, referenceDate))
  ) {
    return 'active'
  }

  return fallbackStatus
}

export function resolveStatusAfterEvent(currentStatus, eventType, eventDate, referenceDate = todayDateString()) {
  if (eventType === 'death') {
    return 'dead'
  }

  if (eventType === 'sale' && isDatedOnOrBefore(eventDate, referenceDate)) {
    return 'sold'
  }

  return currentStatus ?? 'active'
}

export function resolveStatusFromTimeline(currentStatus, events = [], referenceDate = todayDateString()) {
  const baseStatus = currentStatus ?? 'active'

  if (baseStatus === 'dead') {
    return 'dead'
  }

  if (events.some((event) => event.type === 'death')) {
    return 'dead'
  }

  if (
    baseStatus !== 'sold'
    && events.some((event) => event.type === 'sale' && isDatedOnOrBefore(event.date, referenceDate))
  ) {
    return 'sold'
  }

  return baseStatus
}
