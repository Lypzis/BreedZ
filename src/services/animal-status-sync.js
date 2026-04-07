import { STORE_NAMES, withStore } from 'src/services/app-db'
import { listAnimals } from 'src/services/animals-db'
import { listEvents } from 'src/services/events-db'
import { resolveStatusFromTimeline } from 'src/utils/event-status'

export async function syncAnimalStatusesFromEvents(referenceDate) {
  const [animals, events] = await Promise.all([listAnimals(), listEvents()])
  const eventsByAnimalId = new Map()

  for (const event of events) {
    const existingEvents = eventsByAnimalId.get(event.animalId) ?? []
    existingEvents.push(event)
    eventsByAnimalId.set(event.animalId, existingEvents)
  }

  const animalsToUpdate = animals
    .map((animal) => {
      const nextStatus = resolveStatusFromTimeline(
        animal.status,
        eventsByAnimalId.get(animal.id) ?? [],
        referenceDate,
      )

      if (nextStatus === animal.status) {
        return null
      }

      return {
        ...animal,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
      }
    })
    .filter(Boolean)

  for (const animal of animalsToUpdate) {
    await withStore(STORE_NAMES.animals, 'readwrite', (store) => store.put(animal))
  }

  return animalsToUpdate.length
}
