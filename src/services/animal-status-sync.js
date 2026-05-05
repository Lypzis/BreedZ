import { STORE_NAMES, withStore } from 'src/services/app-db'
import { listAnimals } from 'src/services/animals-db'
import { listEvents } from 'src/services/events-db'
import { resolveBaseStatus, resolveStatusFromTimeline } from 'src/utils/event-status'
import { markRecordDirty } from 'src/utils/sync-metadata'

export async function syncAnimalStatusesFromEvents(referenceDate) {
  const [animals, events] = await Promise.all([listAnimals(), listEvents()])
  const eventsByAnimalId = new Map()

  for (const event of events) {
    for (const animalId of event.animalIds ?? []) {
      const existingEvents = eventsByAnimalId.get(animalId) ?? []
      existingEvents.push(event)
      eventsByAnimalId.set(animalId, existingEvents)
    }
  }

  const animalsToUpdate = animals
    .map((animal) => {
      const relatedEvents = eventsByAnimalId.get(animal.id) ?? []
      const baseStatus = resolveBaseStatus(animal.baseStatus, animal.status, relatedEvents, referenceDate)
      const nextStatus = resolveStatusFromTimeline(
        baseStatus,
        relatedEvents,
        referenceDate,
      )

      if (nextStatus === animal.status && baseStatus === animal.baseStatus) {
        return null
      }

      return markRecordDirty({
        ...animal,
        baseStatus,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      })
    })
    .filter(Boolean)

  for (const animal of animalsToUpdate) {
    await withStore(STORE_NAMES.animals, 'readwrite', (store) => store.put(animal))
  }

  return animalsToUpdate.length
}
