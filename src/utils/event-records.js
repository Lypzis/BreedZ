import { todayDateString } from './dates.js'

const PREGNANCY_CHECK_RESULTS = new Set(['pregnant', 'open', 'unknown'])
const PREGNANCY_CHECK_METHODS = new Set(['palpation', 'ultrasound', 'blood_test', 'visual', 'other'])
export const EXPECTED_BIRTH_OUTCOME_TYPES = new Set([
  'birth',
  'breeding_failed',
  'abortion',
  'pregnancy_check',
])

function normalizeString(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback
}

function normalizeScopeValue(value, animalIds = []) {
  const normalizedValue = normalizeString(value).toLowerCase()

  if (normalizedValue === 'herd') {
    return 'herd'
  }

  if (normalizedValue === 'animals') {
    return 'animals'
  }

  return animalIds.length === 0 ? 'herd' : 'animals'
}

function uniqueStrings(values = []) {
  const seen = new Set()
  const normalized = []

  for (const value of values) {
    const nextValue = normalizeString(value)

    if (!nextValue || seen.has(nextValue)) {
      continue
    }

    seen.add(nextValue)
    normalized.push(nextValue)
  }

  return normalized
}

function normalizeAnimalIdsValue(value) {
  if (Array.isArray(value)) {
    return uniqueStrings(value)
  }

  const rawValue = normalizeString(value)

  if (!rawValue) {
    return []
  }

  return uniqueStrings(rawValue.split(','))
}

function normalizeConfirmationStatusValue(value, eventDate, referenceDate = todayDateString()) {
  const normalizedValue = normalizeString(value).toLowerCase()

  if (normalizedValue === 'pending' || normalizedValue === 'confirmed') {
    return normalizedValue
  }

  if (normalizeString(eventDate) > normalizeString(referenceDate)) {
    return 'pending'
  }

  return 'confirmed'
}

function parseLocaleAgnosticNumber(value) {
  const rawValue = normalizeString(value)

  if (!rawValue) {
    return Number.NaN
  }

  const compactValue = rawValue.replace(/\s+/g, '')
  const lastCommaIndex = compactValue.lastIndexOf(',')
  const lastDotIndex = compactValue.lastIndexOf('.')

  if (lastCommaIndex !== -1 && lastDotIndex !== -1) {
    const decimalSeparator = lastCommaIndex > lastDotIndex ? ',' : '.'
    const thousandsSeparator = decimalSeparator === ',' ? '.' : ','

    return Number(
      compactValue
        .split(thousandsSeparator)
        .join('')
        .replace(decimalSeparator, '.'),
    )
  }

  if (lastCommaIndex !== -1) {
    const decimalDigits = compactValue.length - lastCommaIndex - 1

    return Number(
      decimalDigits > 0 && decimalDigits <= 2
        ? compactValue.replace(',', '.')
        : compactValue.replaceAll(',', ''),
    )
  }

  if (lastDotIndex !== -1) {
    const decimalDigits = compactValue.length - lastDotIndex - 1

    return Number(
      decimalDigits > 0 && decimalDigits <= 2
        ? compactValue
        : compactValue.replaceAll('.', ''),
    )
  }

  return Number(compactValue)
}

export function normalizeEventAmount(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  const parsedValue = parseLocaleAgnosticNumber(value)
  return Number.isFinite(parsedValue) ? parsedValue : null
}

export function sanitizeNonNegativeAmountInput(value) {
  const rawValue = normalizeString(value)

  if (!rawValue) {
    return ''
  }

  const sanitizedValue = rawValue.replace(/[^0-9.,]/g, '')

  if (!sanitizedValue) {
    return ''
  }

  if (sanitizedValue.startsWith('.') || sanitizedValue.startsWith(',')) {
    return `0${sanitizedValue}`
  }

  return sanitizedValue
}

function normalizeDetailsValue(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }

  return { ...value }
}

export function normalizeEventDetails(type, details = {}) {
  const normalizedType = normalizeString(type)
  const normalizedDetails = normalizeDetailsValue(details)

  if (normalizedType !== 'pregnancy_check') {
    if (normalizedType === 'expected_birth') {
      const resolutionStatus = normalizeString(normalizedDetails.resolutionStatus).toLowerCase()
      const outcomeType = normalizeString(normalizedDetails.outcomeType).toLowerCase()

      return {
        ...normalizedDetails,
        resolutionStatus: resolutionStatus === 'resolved' ? 'resolved' : '',
        outcomeType: EXPECTED_BIRTH_OUTCOME_TYPES.has(outcomeType) ? outcomeType : '',
        linkedOutcomeEventId: normalizeString(normalizedDetails.linkedOutcomeEventId),
        resolvedAt: normalizeString(normalizedDetails.resolvedAt),
      }
    }

    if (EXPECTED_BIRTH_OUTCOME_TYPES.has(normalizedType)) {
      return {
        ...normalizedDetails,
        linkedBreedingEventId: normalizeString(normalizedDetails.linkedBreedingEventId),
        linkedExpectedBirthEventId: normalizeString(normalizedDetails.linkedExpectedBirthEventId),
      }
    }

    if (normalizedType === 'weaning') {
      return {
        ...normalizedDetails,
        linkedBirthEventId: normalizeString(normalizedDetails.linkedBirthEventId),
      }
    }

    return normalizedDetails
  }

  const result = normalizeString(normalizedDetails.result).toLowerCase()
  const method = normalizeString(normalizedDetails.method).toLowerCase()

  return {
    ...normalizedDetails,
    result: PREGNANCY_CHECK_RESULTS.has(result) ? result : '',
    method: PREGNANCY_CHECK_METHODS.has(method) ? method : '',
    linkedBreedingEventId: normalizeString(normalizedDetails.linkedBreedingEventId),
    linkedExpectedBirthEventId: normalizeString(normalizedDetails.linkedExpectedBirthEventId),
  }
}

export function isExpectedBirthResolved(event = {}) {
  const normalizedEvent = normalizeEventRecord(event)

  return normalizedEvent.type === 'expected_birth'
    && normalizedEvent.details?.resolutionStatus === 'resolved'
    && Boolean(normalizedEvent.details?.linkedOutcomeEventId)
}

export function deriveEventAnimalIds(event = {}) {
  const type = normalizeString(event.type)
  const normalizedAnimalIds = normalizeAnimalIdsValue(event.animalIds)
  const legacyAnimalId = normalizeString(event.animalId)
  const legacyPartnerAnimalId = normalizeString(event.partnerAnimalId)

  if (normalizedAnimalIds.length > 0) {
    if (type !== 'breeding' || !legacyPartnerAnimalId) {
      return normalizedAnimalIds
    }

    return uniqueStrings([...normalizedAnimalIds, legacyPartnerAnimalId])
  }

  if (type === 'breeding') {
    return uniqueStrings([legacyAnimalId, legacyPartnerAnimalId])
  }

  return uniqueStrings([legacyAnimalId])
}

export function getEventAnimalIds(event = {}) {
  return deriveEventAnimalIds(event)
}

export function normalizeEventRecord(event = {}) {
  const type = normalizeString(event.type)
  const animalIds = deriveEventAnimalIds(event)
  const scope = normalizeScopeValue(event.scope, animalIds)
  const animalId = animalIds[0] ?? normalizeString(event.animalId)
  const partnerAnimalId = type === 'breeding'
    ? normalizeString(event.partnerAnimalId) || animalIds[1] || ''
    : ''

  return {
    ...event,
    scope,
    animalIds,
    animalId,
    partnerAnimalId,
    details: normalizeEventDetails(type, event.details),
    linkedEventId: normalizeString(event.linkedEventId),
    confirmationStatus: normalizeConfirmationStatusValue(event.confirmationStatus, event.date),
    amount: normalizeEventAmount(event.amount),
  }
}

export function eventIncludesAnimal(event, animalId) {
  const normalizedAnimalId = normalizeString(animalId)

  if (!normalizedAnimalId) {
    return false
  }

  return normalizeEventRecord(event).animalIds.includes(normalizedAnimalId)
}

export function isPendingEvent(event = {}) {
  return normalizeEventRecord(event).confirmationStatus === 'pending'
}

export function isFutureScheduledEvent(event = {}, referenceDate = todayDateString()) {
  const normalizedEvent = normalizeEventRecord(event)

  if (isExpectedBirthResolved(normalizedEvent)) {
    return false
  }

  return normalizedEvent.confirmationStatus === 'pending'
    && normalizeString(normalizedEvent.date) > normalizeString(referenceDate)
}

export function isEventNeedingConfirmation(event = {}, referenceDate = todayDateString()) {
  const normalizedEvent = normalizeEventRecord(event)

  if (isExpectedBirthResolved(normalizedEvent)) {
    return false
  }

  return normalizedEvent.confirmationStatus === 'pending'
    && normalizeString(normalizedEvent.date) !== ''
    && normalizeString(normalizedEvent.date) <= normalizeString(referenceDate)
}
