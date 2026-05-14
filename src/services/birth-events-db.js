import { buildAnimalRecord } from './animals-db.js'
import { createId, openAppDatabase, STORE_NAMES } from './app-db.js'
import { todayDateString } from '../utils/dates.js'
import { normalizeEventRecord } from '../utils/event-records.js'
import { markRecordDirty } from '../utils/sync-metadata.js'

function uniqueIds(values = []) {
  const seen = new Set()
  const ids = []

  for (const value of values) {
    const id = String(value || '').trim()

    if (!id || seen.has(id)) {
      continue
    }

    seen.add(id)
    ids.push(id)
  }

  return ids
}

function buildBirthRecords(input = {}, { expectedBirthEvent = null } = {}) {
  const timestamp = new Date().toISOString()
  const eventDate = input.date || todayDateString()
  const damId = String(input.damId || '').trim()
  const sireId = String(input.sireId || '').trim()
  const newAnimals = (input.newAnimals ?? []).map((animal) =>
    buildAnimalRecord(
      {
        ...animal,
        damId: animal.damId || damId,
        sireId: animal.sireId || sireId,
        birthDate: animal.birthDate || eventDate,
        status: 'active',
      },
      { timestamp },
    ),
  )
  const animalIds = uniqueIds([
    ...(input.existingAnimalIds ?? []),
    ...newAnimals.map((animal) => animal.id),
  ])

  if (animalIds.length === 0) {
    throw new Error('Birth must include at least one animal.')
  }

  const event = markRecordDirty(normalizeEventRecord({
    id: createId('event'),
    animalId: animalIds[0],
    animalIds,
    scope: 'animals',
    type: 'birth',
    linkedEventId: expectedBirthEvent?.id ?? input.linkedEventId ?? '',
    details: {
      ...(input.details ?? {}),
      linkedExpectedBirthEventId: expectedBirthEvent?.id ?? input.details?.linkedExpectedBirthEventId ?? '',
      linkedBreedingEventId: expectedBirthEvent?.linkedEventId ?? input.details?.linkedBreedingEventId ?? '',
    },
    confirmationStatus: eventDate > todayDateString() ? 'pending' : 'confirmed',
    amount: input.amount,
    date: eventDate,
    notes: input.notes?.trim() ?? '',
    createdAt: timestamp,
    updatedAt: timestamp,
  }))
  const updatedExpectedBirth = expectedBirthEvent
    ? markRecordDirty(normalizeEventRecord({
      ...expectedBirthEvent,
      details: {
        ...(expectedBirthEvent.details ?? {}),
        resolutionStatus: 'resolved',
        outcomeType: 'birth',
        linkedOutcomeEventId: event.id,
        resolvedAt: timestamp,
      },
      confirmationStatus: 'confirmed',
      updatedAt: timestamp,
    }))
    : null

  return {
    animals: newAnimals,
    damId,
    event,
    eventDate,
    existingAnimalIds: uniqueIds(input.existingAnimalIds ?? []),
    expectedBirth: updatedExpectedBirth,
    sireId,
    timestamp,
  }
}

function updateExistingOffspringRecords(animalsStore, records) {
  const shouldUpdateParents = Boolean(records.damId || records.sireId)

  if (!shouldUpdateParents && !records.eventDate) {
    return
  }

  for (const animalId of records.existingAnimalIds) {
    const request = animalsStore.get(animalId)

    request.onsuccess = () => {
      const existingAnimal = request.result

      if (!existingAnimal) {
        return
      }

      const updatedAnimal = {
        ...existingAnimal,
        birthDate: existingAnimal.birthDate || records.eventDate,
        damId: records.damId || existingAnimal.damId || '',
        sireId: records.sireId || existingAnimal.sireId || '',
        updatedAt: records.timestamp,
      }

      animalsStore.put(markRecordDirty(updatedAnimal))
    }
  }
}

export function createBirthEventWithAnimals(input = {}) {
  return openAppDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        let records

        try {
          records = buildBirthRecords(input)
        } catch (error) {
          reject(error)
          return
        }

        const transaction = db.transaction([STORE_NAMES.animals, STORE_NAMES.events], 'readwrite')
        const animalsStore = transaction.objectStore(STORE_NAMES.animals)
        const eventsStore = transaction.objectStore(STORE_NAMES.events)

        for (const animal of records.animals) {
          animalsStore.put(animal)
        }

        updateExistingOffspringRecords(animalsStore, records)
        eventsStore.put(records.event)

        transaction.oncomplete = () => resolve(records)
        transaction.onerror = () => reject(transaction.error ?? new Error('Failed to save birth event.'))
        transaction.onabort = () => reject(transaction.error ?? new Error('Birth event save was aborted.'))
      }),
  )
}

export function createBirthOutcomeWithAnimals(expectedBirthEvent, input = {}) {
  return openAppDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        if (!expectedBirthEvent?.id || expectedBirthEvent.type !== 'expected_birth') {
          reject(new Error('Expected birth event not found.'))
          return
        }

        let records

        try {
          records = buildBirthRecords(input, { expectedBirthEvent })
        } catch (error) {
          reject(error)
          return
        }

        const transaction = db.transaction([STORE_NAMES.animals, STORE_NAMES.events], 'readwrite')
        const animalsStore = transaction.objectStore(STORE_NAMES.animals)
        const eventsStore = transaction.objectStore(STORE_NAMES.events)

        for (const animal of records.animals) {
          animalsStore.put(animal)
        }

        updateExistingOffspringRecords(animalsStore, records)
        eventsStore.put(records.event)
        eventsStore.put(records.expectedBirth)

        transaction.oncomplete = () => resolve(records)
        transaction.onerror = () => reject(transaction.error ?? new Error('Failed to save birth event.'))
        transaction.onabort = () => reject(transaction.error ?? new Error('Birth event save was aborted.'))
      }),
  )
}
