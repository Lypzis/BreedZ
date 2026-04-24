import { deriveEventAnimalIds, normalizeEventRecord } from './event-records.js'

const VALID_STATUSES = new Set(['active', 'sold', 'dead'])
const VALID_SEXES = new Set(['female', 'male', 'unknown'])
const VALID_EVENT_TYPES = new Set([
  'birth',
  'breeding',
  'purchase',
  'sale',
  'vaccination',
  'health_issue',
  'feed_cost',
  'labor_cost',
  'supply_cost',
  'maintenance_cost',
  'other_expense',
  'other_income',
  'death',
  'custom',
])
const HERD_SCOPE_EVENT_TYPES = new Set([
  'feed_cost',
  'labor_cost',
  'supply_cost',
  'maintenance_cost',
  'other_expense',
  'other_income',
])

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function normalizeString(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback
}

function normalizeTimestamp(value) {
  return isNonEmptyString(value) ? value : new Date().toISOString()
}

function normalizeBreederValue(value, legacyPurpose) {
  if (typeof value === 'boolean') {
    return value
  }

  const normalized = normalizeString(value).toLowerCase()

  if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
    return true
  }

  if (normalized === 'false' || normalized === '0' || normalized === 'no') {
    return false
  }

  return normalizeString(legacyPurpose).toLowerCase() === 'breeding'
}

function validateArray(name, value) {
  if (!Array.isArray(value)) {
    throw new Error(`Backup file is invalid: "${name}" must be an array.`)
  }
}

export function validateAndNormalizeBackupPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Backup file is invalid: expected an object payload.')
  }

  validateArray('animals', payload.animals)
  validateArray('events', payload.events)

  const seenAnimalIds = new Set()
  const normalizedAnimals = payload.animals.map((animal, index) => {
    if (!animal || typeof animal !== 'object' || Array.isArray(animal)) {
      throw new Error(`Backup file is invalid: animal at index ${index} must be an object.`)
    }

    const id = normalizeString(animal.id)

    if (!id) {
      throw new Error(`Backup file is invalid: animal at index ${index} is missing an id.`)
    }

    if (seenAnimalIds.has(id)) {
      throw new Error(`Backup file is invalid: duplicate animal id "${id}".`)
    }

    seenAnimalIds.add(id)

    const status = VALID_STATUSES.has(animal.status) ? animal.status : 'active'
    const baseStatus = VALID_STATUSES.has(animal.baseStatus) ? animal.baseStatus : ''
    const sex = VALID_SEXES.has(animal.sex) ? animal.sex : 'unknown'
    const isBreeder = normalizeBreederValue(animal.isBreeder, animal.purpose)

    return {
      id,
      tag: normalizeString(animal.tag),
      name: normalizeString(animal.name),
      species: normalizeString(animal.species),
      breed: normalizeString(animal.breed),
      weight: normalizeString(animal.weight),
      isBreeder,
      sex,
      birthDate: normalizeString(animal.birthDate),
      baseStatus,
      status,
      damId: normalizeString(animal.damId),
      sireId: normalizeString(animal.sireId),
      notes: normalizeString(animal.notes),
      createdAt: normalizeTimestamp(animal.createdAt),
      updatedAt: normalizeTimestamp(animal.updatedAt),
    }
  })

  for (const animal of normalizedAnimals) {
    if (!animal.tag && !animal.name) {
      throw new Error(`Backup file is invalid: animal "${animal.id}" must have a tag or name.`)
    }

    if (animal.damId && !seenAnimalIds.has(animal.damId)) {
      throw new Error(`Backup file is invalid: damId "${animal.damId}" does not exist.`)
    }

    if (animal.sireId && !seenAnimalIds.has(animal.sireId)) {
      throw new Error(`Backup file is invalid: sireId "${animal.sireId}" does not exist.`)
    }

    if (animal.damId && animal.sireId && animal.damId === animal.sireId) {
      throw new Error(`Backup file is invalid: animal "${animal.id}" has the same dam and sire.`)
    }
  }

  const seenEventIds = new Set()
  const normalizedEvents = payload.events.map((event, index) => {
    if (!event || typeof event !== 'object' || Array.isArray(event)) {
      throw new Error(`Backup file is invalid: event at index ${index} must be an object.`)
    }

    const id = normalizeString(event.id)

    if (!id) {
      throw new Error(`Backup file is invalid: event at index ${index} is missing an id.`)
    }

    if (seenEventIds.has(id)) {
      throw new Error(`Backup file is invalid: duplicate event id "${id}".`)
    }

    seenEventIds.add(id)

    const type = VALID_EVENT_TYPES.has(event.type) ? event.type : null

    if (!type) {
      throw new Error(`Backup file is invalid: event "${id}" has an unsupported type.`)
    }

    const scope = event.scope === 'herd' && HERD_SCOPE_EVENT_TYPES.has(type) ? 'herd' : 'animals'
    const animalId = normalizeString(event.animalId)
    const partnerAnimalId = normalizeString(event.partnerAnimalId)
    const animalIds = deriveEventAnimalIds({
      type,
      animalIds: event.animalIds,
      animalId,
      partnerAnimalId,
    })

    if (scope !== 'herd' && animalIds.length === 0) {
      throw new Error(`Backup file is invalid: event "${id}" references a missing animal.`)
    }

    for (const relatedAnimalId of animalIds) {
      if (!seenAnimalIds.has(relatedAnimalId)) {
        throw new Error(`Backup file is invalid: event "${id}" references a missing animal.`)
      }
    }

    if (type === 'breeding' && partnerAnimalId && !seenAnimalIds.has(partnerAnimalId)) {
      throw new Error(`Backup file is invalid: event "${id}" references a missing breeding partner.`)
    }

    return normalizeEventRecord({
      id,
      animalId,
      animalIds,
      scope,
      type,
      partnerAnimalId: type === 'breeding' ? partnerAnimalId : '',
      amount: event.amount,
      date: normalizeString(event.date),
      notes: normalizeString(event.notes),
      createdAt: normalizeTimestamp(event.createdAt),
      updatedAt: normalizeTimestamp(event.updatedAt),
    })
  })

  return {
    schemaVersion: typeof payload.schemaVersion === 'number' ? payload.schemaVersion : 3,
    exportedAt: normalizeTimestamp(payload.exportedAt),
    animals: normalizedAnimals,
    events: normalizedEvents,
  }
}
