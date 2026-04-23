import { buildAnimalRecord } from './animals-db.js'
import { createId, openAppDatabase, STORE_NAMES } from './app-db.js'
import { normalizeEventRecord } from '../utils/event-records.js'

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

export function createPurchaseEventWithAnimals(input = {}) {
  return openAppDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const timestamp = new Date().toISOString()
        const newAnimals = (input.newAnimals ?? []).map((animal) =>
          buildAnimalRecord(
            {
              ...animal,
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
          reject(new Error('Purchase must include at least one animal.'))
          return
        }

        const event = normalizeEventRecord({
          id: createId('event'),
          animalId: animalIds[0],
          animalIds,
          type: 'purchase',
          amount: input.amount,
          date: input.date,
          notes: input.notes?.trim() ?? '',
          createdAt: timestamp,
          updatedAt: timestamp,
        })

        const transaction = db.transaction([STORE_NAMES.animals, STORE_NAMES.events], 'readwrite')
        const animalsStore = transaction.objectStore(STORE_NAMES.animals)
        const eventsStore = transaction.objectStore(STORE_NAMES.events)

        for (const animal of newAnimals) {
          animalsStore.put(animal)
        }

        eventsStore.put(event)

        transaction.oncomplete = () => resolve({ event, animals: newAnimals })
        transaction.onerror = () => reject(transaction.error ?? new Error('Failed to save purchase event.'))
        transaction.onabort = () => reject(transaction.error ?? new Error('Purchase event save was aborted.'))
      }),
  )
}
