import { createId, STORE_NAMES, withStore } from 'src/services/app-db'
import { touchAnimalUpdatedAt } from 'src/services/animals-db'

function sortEvents(events) {
  return [...events].sort((left, right) => {
    const leftValue = left.date ?? left.updatedAt ?? left.createdAt ?? ''
    const rightValue = right.date ?? right.updatedAt ?? right.createdAt ?? ''

    return rightValue.localeCompare(leftValue)
  })
}

export async function listEvents() {
  const events = (await withStore(STORE_NAMES.events, 'readonly', (store) => store.getAll())) ?? []
  return sortEvents(events)
}

export async function listEventsByAnimalId(animalId) {
  const events = await listEvents()
  return events.filter((event) => event.animalId === animalId)
}

export async function createEvent(input) {
  const timestamp = new Date().toISOString()
  const event = {
    id: createId('event'),
    animalId: input.animalId,
    type: input.type,
    date: input.date,
    notes: input.notes?.trim() ?? '',
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  await withStore(STORE_NAMES.events, 'readwrite', (store) => store.put(event))
  await touchAnimalUpdatedAt(event.animalId)

  return event
}

export async function updateEvent(id, input) {
  const existingEvent = await getEvent(id)

  if (!existingEvent) {
    throw new Error('Event not found.')
  }

  const updatedEvent = {
    ...existingEvent,
    animalId: input.animalId,
    type: input.type,
    date: input.date,
    notes: input.notes?.trim() ?? '',
    updatedAt: new Date().toISOString(),
  }

  await withStore(STORE_NAMES.events, 'readwrite', (store) => store.put(updatedEvent))
  await touchAnimalUpdatedAt(updatedEvent.animalId)

  if (existingEvent.animalId && existingEvent.animalId !== updatedEvent.animalId) {
    await touchAnimalUpdatedAt(existingEvent.animalId)
  }

  return updatedEvent
}

export async function deleteEvent(id) {
  const event = await getEvent(id)

  if (!event) {
    return null
  }

  await withStore(STORE_NAMES.events, 'readwrite', (store) => store.delete(id))
  await touchAnimalUpdatedAt(event.animalId)

  return event
}

export async function getEvent(id) {
  if (!id) {
    return null
  }

  return (await withStore(STORE_NAMES.events, 'readonly', (store) => store.get(id))) ?? null
}

export async function deleteEventsForAnimal(animalId) {
  const events = await listEventsByAnimalId(animalId)

  for (const event of events) {
    await withStore(STORE_NAMES.events, 'readwrite', (store) => store.delete(event.id))
  }
}
