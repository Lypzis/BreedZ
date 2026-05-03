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

function normalizeConfirmationStatusValue(value) {
  const normalizedValue = String(value || '').trim().toLowerCase()

  if (normalizedValue === 'pending' || normalizedValue === 'confirmed') {
    return normalizedValue
  }

  return 'confirmed'
}

function isConfirmedDatedEvent(event, type, referenceDate = todayDateString()) {
  return event.type === type
    && normalizeConfirmationStatusValue(event.confirmationStatus) === 'confirmed'
    && isDatedOnOrBefore(event.date, referenceDate)
}

export function resolveBaseStatus(baseStatus, currentStatus, events = []) {
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
    && events.some((event) => event.type === 'sale')
  ) {
    return 'active'
  }

  return fallbackStatus
}

export function resolveStatusAfterEvent(
  currentStatus,
  eventType,
  eventDate,
  referenceDate = todayDateString(),
  confirmationStatus = 'confirmed',
) {
  if (
    eventType === 'death'
    && normalizeConfirmationStatusValue(confirmationStatus) === 'confirmed'
    && isDatedOnOrBefore(eventDate, referenceDate)
  ) {
    return 'dead'
  }

  if (
    eventType === 'sale'
    && normalizeConfirmationStatusValue(confirmationStatus) === 'confirmed'
    && isDatedOnOrBefore(eventDate, referenceDate)
  ) {
    return 'sold'
  }

  return currentStatus ?? 'active'
}

export function resolveStatusFromTimeline(currentStatus, events = [], referenceDate = todayDateString()) {
  const baseStatus = currentStatus ?? 'active'

  if (baseStatus === 'dead') {
    return 'dead'
  }

  if (events.some((event) => isConfirmedDatedEvent(event, 'death', referenceDate))) {
    return 'dead'
  }

  if (
    baseStatus !== 'sold'
    && events.some((event) => isConfirmedDatedEvent(event, 'sale', referenceDate))
  ) {
    return 'sold'
  }

  return baseStatus
}
