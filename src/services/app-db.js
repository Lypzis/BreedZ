import { normalizeEventRecord } from '../utils/event-records.js'

export const DB_NAME = 'breedz-db'
const DB_VERSION = 4

export const STORE_NAMES = {
  animals: 'animals',
  events: 'events',
}

let dbPromise

function getIndexedDB() {
  return globalThis.indexedDB ?? globalThis.window?.indexedDB
}

function isEventCanonicallyStored(event, normalizedEvent) {
  return (
    JSON.stringify(event.animalIds ?? []) === JSON.stringify(normalizedEvent.animalIds) &&
    (event.animalId ?? '') === normalizedEvent.animalId &&
    (event.partnerAnimalId ?? '') === normalizedEvent.partnerAnimalId &&
    (event.linkedEventId ?? '') === normalizedEvent.linkedEventId &&
    (event.confirmationStatus ?? '') === normalizedEvent.confirmationStatus &&
    (event.amount ?? null) === normalizedEvent.amount
  )
}

function ensureIndex(store, name, keyPath, options) {
  if (!store.indexNames.contains(name)) {
    store.createIndex(name, keyPath, options)
  }
}

export function openAppDatabase() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const indexedDB = getIndexedDB()

      if (!indexedDB) {
        reject(new Error('IndexedDB is not available in this environment.'))
        return
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = () => {
        const db = request.result

        let animalsStore

        if (!db.objectStoreNames.contains(STORE_NAMES.animals)) {
          animalsStore = db.createObjectStore(STORE_NAMES.animals, { keyPath: 'id' })
        } else {
          animalsStore = request.transaction.objectStore(STORE_NAMES.animals)
        }

        ensureIndex(animalsStore, 'updatedAt', 'updatedAt')
        ensureIndex(animalsStore, 'status', 'status')
        ensureIndex(animalsStore, 'syncDirty', 'sync.dirty')
        ensureIndex(animalsStore, 'syncDeleted', 'sync.deleted')

        let eventsStore

        if (!db.objectStoreNames.contains(STORE_NAMES.events)) {
          eventsStore = db.createObjectStore(STORE_NAMES.events, { keyPath: 'id' })
        } else {
          eventsStore = request.transaction.objectStore(STORE_NAMES.events)
        }

        ensureIndex(eventsStore, 'animalId', 'animalId')
        ensureIndex(eventsStore, 'animalIds', 'animalIds', { multiEntry: true })
        ensureIndex(eventsStore, 'date', 'date')
        ensureIndex(eventsStore, 'updatedAt', 'updatedAt')
        ensureIndex(eventsStore, 'syncDirty', 'sync.dirty')
        ensureIndex(eventsStore, 'syncDeleted', 'sync.deleted')
      }

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB.'))
    })
  }

  return dbPromise
}

export async function closeAppDatabase() {
  const db = await dbPromise?.catch(() => null)

  db?.close()
  dbPromise = undefined
}

export function withStore(storeName, mode, callback) {
  return openAppDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, mode)
        const store = transaction.objectStore(storeName)

        let requestResult

        try {
          requestResult = callback(store)
        } catch (error) {
          reject(error)
          return
        }

        transaction.oncomplete = () => resolve(requestResult?.result)
        transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed.'))
        transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted.'))
      }),
  )
}

export function replaceAppData({ animals, events }) {
  return openAppDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAMES.animals, STORE_NAMES.events], 'readwrite')
        const animalsStore = transaction.objectStore(STORE_NAMES.animals)
        const eventsStore = transaction.objectStore(STORE_NAMES.events)

        animalsStore.clear()
        eventsStore.clear()

        for (const animal of animals) {
          animalsStore.put(animal)
        }

        for (const event of events) {
          eventsStore.put(event)
        }

        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error ?? new Error('Failed to replace app data.'))
        transaction.onabort = () => reject(transaction.error ?? new Error('App data replacement was aborted.'))
      }),
  )
}

export function migrateStoredEventsToCanonicalShape() {
  return openAppDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAMES.events, 'readwrite')
        const eventsStore = transaction.objectStore(STORE_NAMES.events)
        const request = eventsStore.getAll()
        let checked = 0
        let migrated = 0

        request.onsuccess = () => {
          const events = request.result ?? []
          checked = events.length

          for (const event of events) {
            const normalizedEvent = normalizeEventRecord(event)

            if (isEventCanonicallyStored(event, normalizedEvent)) {
              continue
            }

            eventsStore.put(normalizedEvent)
            migrated += 1
          }
        }

        request.onerror = () => reject(request.error ?? new Error('Failed to read stored events.'))
        transaction.oncomplete = () => resolve({ checked, migrated })
        transaction.onerror = () => reject(transaction.error ?? new Error('Failed to migrate stored events.'))
        transaction.onabort = () => reject(transaction.error ?? new Error('Stored event migration was aborted.'))
      }),
  )
}

export function createId(prefix = 'item') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}
