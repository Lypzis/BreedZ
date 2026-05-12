import { isExpectedBirthResolved, normalizeEventRecord } from './event-records.js'

export const PREGNANCY_CHECK_DUE_AFTER_DAYS = 30
export const EXPECTED_BIRTH_SOON_DAYS = 14

function parseDateParts(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value ?? ''))) {
    return null
  }

  const [year, month, day] = String(value).split('-').map(Number)

  return { year, month, day }
}

function dateStringToDayNumber(value) {
  const parts = parseDateParts(value)

  if (!parts) {
    return null
  }

  return Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / 86_400_000)
}

function daysBetween(leftDate, rightDate) {
  const leftDay = dateStringToDayNumber(leftDate)
  const rightDay = dateStringToDayNumber(rightDate)

  if (leftDay === null || rightDay === null) {
    return null
  }

  return rightDay - leftDay
}

function sortEventsByDateAsc(items) {
  return [...items].sort((left, right) => (left.date ?? '').localeCompare(right.date ?? ''))
}

function hasLinkedOutcomeEvent(events, breedingEventId) {
  return events.some((event) =>
    ['birth', 'breeding_failed', 'abortion'].includes(event.type)
    && event.details?.linkedBreedingEventId === breedingEventId,
  )
}

function hasLinkedPregnancyCheck(events, breedingEventId) {
  return events.some((event) =>
    event.type === 'pregnancy_check'
    && event.details?.linkedBreedingEventId === breedingEventId,
  )
}

function hasLinkedExpectedBirth(events, breedingEvent) {
  return events.some((event) =>
    event.type === 'expected_birth'
    && (
      event.linkedEventId === breedingEvent.id
      || (breedingEvent.linkedEventId && event.id === breedingEvent.linkedEventId)
    ),
  )
}

function isBreedingClosed(events, breedingEvent) {
  return hasLinkedOutcomeEvent(events, breedingEvent.id)
    || events.some((event) =>
      event.type === 'expected_birth'
      && isExpectedBirthResolved(event)
      && (
        event.linkedEventId === breedingEvent.id
        || (breedingEvent.linkedEventId && event.id === breedingEvent.linkedEventId)
      ),
    )
}

function isBreedingWaitingForPregnancyCheck(events, breedingEvent) {
  return !hasLinkedPregnancyCheck(events, breedingEvent.id) && !isBreedingClosed(events, breedingEvent)
}

export function buildDashboardLifecycleSections(events = [], referenceDate = '') {
  const normalizedEvents = events.map((event) => normalizeEventRecord(event))
  const breedingEvents = normalizedEvents.filter((event) => event.type === 'breeding')
  const expectedBirthEvents = normalizedEvents.filter((event) =>
    event.type === 'expected_birth' && !isExpectedBirthResolved(event),
  )
  const pregnancyChecksDue = breedingEvents.filter((event) => {
    if (!isBreedingWaitingForPregnancyCheck(normalizedEvents, event)) {
      return false
    }

    const ageInDays = daysBetween(event.date, referenceDate)

    return ageInDays !== null && ageInDays >= PREGNANCY_CHECK_DUE_AFTER_DAYS
  })
  const expectedBirthsDueSoon = expectedBirthEvents.filter((event) => {
    const daysUntilDue = daysBetween(referenceDate, event.date)

    return daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= EXPECTED_BIRTH_SOON_DAYS
  })
  const overdueExpectedBirths = expectedBirthEvents.filter((event) => {
    const daysUntilDue = daysBetween(referenceDate, event.date)

    return daysUntilDue !== null && daysUntilDue < 0
  })
  const unresolvedBreedings = breedingEvents.filter((event) => {
    if (!isBreedingWaitingForPregnancyCheck(normalizedEvents, event)) {
      return false
    }

    if (hasLinkedExpectedBirth(normalizedEvents, event)) {
      return false
    }

    return !pregnancyChecksDue.some((dueEvent) => dueEvent.id === event.id)
  })

  return {
    pregnancyChecksDue: sortEventsByDateAsc(pregnancyChecksDue),
    expectedBirthsDueSoon: sortEventsByDateAsc(expectedBirthsDueSoon),
    overdueExpectedBirths: sortEventsByDateAsc(overdueExpectedBirths),
    unresolvedBreedings: sortEventsByDateAsc(unresolvedBreedings),
  }
}
