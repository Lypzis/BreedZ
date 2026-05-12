import {
  createId,
  migrateStoredEventsToCanonicalShape,
  STORE_NAMES,
  withStore,
} from 'src/services/app-db'
import { getAnimal, touchAnimalUpdatedAt } from 'src/services/animals-db'
import { todayDateString } from 'src/utils/dates'
import { resolveBaseStatus, resolveStatusFromTimeline } from 'src/utils/event-status'
import { eventIncludesAnimal, normalizeEventRecord } from 'src/utils/event-records'
import {
  isRecordDeleted,
  markRecordDeleted,
  markRecordDirty,
  normalizeLocalSyncMetadata,
} from 'src/utils/sync-metadata'

function sortEvents(events) {
  return [...events].sort((left, right) => {
    const leftValue = left.date ?? left.updatedAt ?? left.createdAt ?? ''
    const rightValue = right.date ?? right.updatedAt ?? right.createdAt ?? ''

    return rightValue.localeCompare(leftValue)
  })
}

function normalizeStoredEvent(event) {
  const normalizedEvent = normalizeEventRecord(event)

  return {
    ...normalizedEvent,
    sync: normalizeLocalSyncMetadata(normalizedEvent.sync),
  }
}

export async function listEvents(options = {}) {
  await migrateStoredEventsToCanonicalShape()
  const events = (await withStore(STORE_NAMES.events, 'readonly', (store) => store.getAll())) ?? []
  return sortEvents(
    events
      .map(normalizeStoredEvent)
      .filter((event) => options.includeDeleted === true || !isRecordDeleted(event)),
  )
}

export async function listEventsByAnimalId(animalId) {
  const events = await listEvents()
  return events.filter((event) => eventIncludesAnimal(event, animalId))
}

async function syncAnimalStatusFromTimeline(animalId) {
  const existingAnimal = await getAnimal(animalId)

  if (!existingAnimal) {
    return null
  }

  const relatedEvents = await listEventsByAnimalId(animalId)
  const baseStatus = resolveBaseStatus(existingAnimal.baseStatus, existingAnimal.status, relatedEvents)
  const nextStatus = resolveStatusFromTimeline(baseStatus, relatedEvents)

  if (nextStatus === existingAnimal.status && baseStatus === existingAnimal.baseStatus) {
    return touchAnimalUpdatedAt(animalId)
  }

  const updatedAnimal = markRecordDirty({
    ...existingAnimal,
    baseStatus,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  })

  await withStore(STORE_NAMES.animals, 'readwrite', (store) => store.put(updatedAnimal))

  return updatedAnimal
}

async function syncAnimalStatusesByIds(ids = []) {
  const uniqueIds = [...new Set(ids.filter(Boolean))]

  for (const animalId of uniqueIds) {
    await syncAnimalStatusFromTimeline(animalId)
  }
}

function resolveConfirmationStatus(input = {}, existingEvent = null, referenceDate = todayDateString()) {
  const explicitStatus = String(input.confirmationStatus ?? '').trim().toLowerCase()

  if (explicitStatus === 'pending' || explicitStatus === 'confirmed') {
    return explicitStatus
  }

  const nextDate = String(input.date ?? existingEvent?.date ?? '').trim()
  const existingStatus = String(existingEvent?.confirmationStatus ?? '').trim().toLowerCase()

  if (nextDate > String(referenceDate)) {
    return 'pending'
  }

  if (existingStatus === 'pending') {
    return 'pending'
  }

  return 'confirmed'
}

export async function createEvent(input) {
  const timestamp = new Date().toISOString()
  const event = markRecordDirty(normalizeEventRecord({
    id: createId('event'),
    animalId: input.animalId,
    animalIds: input.animalIds,
    scope: input.scope,
    type: input.type,
    partnerAnimalId: input.partnerAnimalId,
    details: input.details,
    linkedEventId: input.linkedEventId,
    confirmationStatus: resolveConfirmationStatus(input),
    amount: input.amount,
    date: input.date,
    notes: input.notes?.trim() ?? '',
    createdAt: timestamp,
    updatedAt: timestamp,
  }))

  await withStore(STORE_NAMES.events, 'readwrite', (store) => store.put(event))
  await syncAnimalStatusesByIds(event.animalIds)

  return event
}

export async function updateEvent(id, input) {
  const existingEvent = await getEvent(id)

  if (!existingEvent) {
    throw new Error('Event not found.')
  }

  const updatedEvent = markRecordDirty(normalizeEventRecord({
    ...existingEvent,
    animalId: input.animalId ?? existingEvent.animalId,
    animalIds: input.animalIds ?? existingEvent.animalIds,
    scope: input.scope ?? existingEvent.scope,
    type: input.type ?? existingEvent.type,
    partnerAnimalId: input.partnerAnimalId ?? existingEvent.partnerAnimalId,
    details: input.details ?? existingEvent.details,
    linkedEventId: input.linkedEventId ?? existingEvent.linkedEventId,
    confirmationStatus: resolveConfirmationStatus(input, existingEvent),
    amount: input.amount ?? existingEvent.amount,
    date: input.date ?? existingEvent.date,
    notes: input.notes === undefined ? existingEvent.notes : (input.notes?.trim() ?? ''),
    updatedAt: new Date().toISOString(),
  }))

  await withStore(STORE_NAMES.events, 'readwrite', (store) => store.put(updatedEvent))
  await syncAnimalStatusesByIds([...existingEvent.animalIds, ...updatedEvent.animalIds])

  return updatedEvent
}

export async function confirmEvent(id) {
  const existingEvent = await getEvent(id)

  if (!existingEvent) {
    throw new Error('Event not found.')
  }

  if ((existingEvent.date ?? '') > todayDateString()) {
    throw new Error('Future events cannot be confirmed yet.')
  }

  const confirmedEvent = markRecordDirty(normalizeEventRecord({
    ...existingEvent,
    confirmationStatus: 'confirmed',
    updatedAt: new Date().toISOString(),
  }))

  await withStore(STORE_NAMES.events, 'readwrite', (store) => store.put(confirmedEvent))
  await syncAnimalStatusesByIds(confirmedEvent.animalIds)

  return confirmedEvent
}

export async function deleteEvent(id) {
  const event = await getEvent(id, { includeDeleted: true })

  if (!event || isRecordDeleted(event)) {
    return null
  }

  const deletedEvent = markRecordDeleted(event)

  await withStore(STORE_NAMES.events, 'readwrite', (store) => store.put(deletedEvent))
  await syncAnimalStatusesByIds(event.animalIds)

  return deletedEvent
}

export async function getEvent(id, options = {}) {
  if (!id) {
    return null
  }

  const event = (await withStore(STORE_NAMES.events, 'readonly', (store) => store.get(id))) ?? null

  if (!event) {
    return null
  }

  const normalizedEvent = normalizeStoredEvent(event)

  if (options.includeDeleted !== true && isRecordDeleted(normalizedEvent)) {
    return null
  }

  return normalizedEvent
}

export async function deleteEventsForAnimal(animalId) {
  const events = await listEventsByAnimalId(animalId)
  const affectedAnimalIds = new Set()

  for (const event of events) {
    for (const relatedAnimalId of event.animalIds) {
      if (relatedAnimalId !== animalId) {
        affectedAnimalIds.add(relatedAnimalId)
      }
    }

    const remainingAnimalIds = event.animalIds.filter((id) => id !== animalId)
    const shouldDeleteEvent = event.type === 'breeding' || remainingAnimalIds.length === 0

    if (shouldDeleteEvent) {
      await withStore(STORE_NAMES.events, 'readwrite', (store) => store.put(markRecordDeleted(event)))

      if (event.linkedEventId) {
        const linkedEvent = await getEvent(event.linkedEventId, { includeDeleted: true })

        if (linkedEvent && !isRecordDeleted(linkedEvent)) {
          await withStore(STORE_NAMES.events, 'readwrite', (store) => store.put(markRecordDeleted(linkedEvent)))
        }
      }

      continue
    }

    const updatedEvent = markRecordDirty(normalizeEventRecord({
      ...event,
      animalIds: remainingAnimalIds,
      updatedAt: new Date().toISOString(),
    }))

    await withStore(STORE_NAMES.events, 'readwrite', (store) => store.put(updatedEvent))
  }

  await syncAnimalStatusesByIds([...affectedAnimalIds])
}
