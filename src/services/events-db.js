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

function sortEvents(events) {
  return [...events].sort((left, right) => {
    const leftValue = left.date ?? left.updatedAt ?? left.createdAt ?? ''
    const rightValue = right.date ?? right.updatedAt ?? right.createdAt ?? ''

    return rightValue.localeCompare(leftValue)
  })
}

export async function listEvents() {
  await migrateStoredEventsToCanonicalShape()
  const events = (await withStore(STORE_NAMES.events, 'readonly', (store) => store.getAll())) ?? []
  return sortEvents(events.map(normalizeEventRecord))
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

  const updatedAnimal = {
    ...existingAnimal,
    baseStatus,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  }

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
  const event = normalizeEventRecord({
    id: createId('event'),
    animalId: input.animalId,
    animalIds: input.animalIds,
    scope: input.scope,
    type: input.type,
    partnerAnimalId: input.partnerAnimalId,
    linkedEventId: input.linkedEventId,
    confirmationStatus: resolveConfirmationStatus(input),
    amount: input.amount,
    date: input.date,
    notes: input.notes?.trim() ?? '',
    createdAt: timestamp,
    updatedAt: timestamp,
  })

  await withStore(STORE_NAMES.events, 'readwrite', (store) => store.put(event))
  await syncAnimalStatusesByIds(event.animalIds)

  return event
}

export async function updateEvent(id, input) {
  const existingEvent = await getEvent(id)

  if (!existingEvent) {
    throw new Error('Event not found.')
  }

  const updatedEvent = normalizeEventRecord({
    ...existingEvent,
    animalId: input.animalId ?? existingEvent.animalId,
    animalIds: input.animalIds ?? existingEvent.animalIds,
    scope: input.scope ?? existingEvent.scope,
    type: input.type ?? existingEvent.type,
    partnerAnimalId: input.partnerAnimalId ?? existingEvent.partnerAnimalId,
    linkedEventId: input.linkedEventId ?? existingEvent.linkedEventId,
    confirmationStatus: resolveConfirmationStatus(input, existingEvent),
    amount: input.amount ?? existingEvent.amount,
    date: input.date ?? existingEvent.date,
    notes: input.notes?.trim() ?? '',
    updatedAt: new Date().toISOString(),
  })

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

  const confirmedEvent = normalizeEventRecord({
    ...existingEvent,
    confirmationStatus: 'confirmed',
    updatedAt: new Date().toISOString(),
  })

  await withStore(STORE_NAMES.events, 'readwrite', (store) => store.put(confirmedEvent))
  await syncAnimalStatusesByIds(confirmedEvent.animalIds)

  return confirmedEvent
}

export async function deleteEvent(id) {
  const event = await getEvent(id)

  if (!event) {
    return null
  }

  await withStore(STORE_NAMES.events, 'readwrite', (store) => store.delete(id))
  await syncAnimalStatusesByIds(event.animalIds)

  return event
}

export async function getEvent(id) {
  if (!id) {
    return null
  }

  const event = (await withStore(STORE_NAMES.events, 'readonly', (store) => store.get(id))) ?? null

  return event ? normalizeEventRecord(event) : null
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
      await withStore(STORE_NAMES.events, 'readwrite', (store) => store.delete(event.id))

      if (event.linkedEventId) {
        await withStore(STORE_NAMES.events, 'readwrite', (store) => store.delete(event.linkedEventId))
      }

      continue
    }

    const updatedEvent = normalizeEventRecord({
      ...event,
      animalIds: remainingAnimalIds,
      updatedAt: new Date().toISOString(),
    })

    await withStore(STORE_NAMES.events, 'readwrite', (store) => store.put(updatedEvent))
  }

  await syncAnimalStatusesByIds([...affectedAnimalIds])
}
