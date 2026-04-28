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
