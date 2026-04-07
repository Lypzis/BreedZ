import { todayDateString } from './dates.js'

function isDatedOnOrBefore(value, referenceDate = todayDateString()) {
  if (!value) {
    return false
  }

  return String(value) <= String(referenceDate)
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

  if (baseStatus !== 'sold' && events.some((event) => event.type === 'sale' && isDatedOnOrBefore(event.date, referenceDate))) {
    return 'sold'
  }

  return baseStatus
}
