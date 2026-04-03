const DB_NAME = 'breedz-db'
const DB_VERSION = 2

export const STORE_NAMES = {
  animals: 'animals',
  events: 'events',
}

let dbPromise

function ensureIndex(store, name, keyPath) {
  if (!store.indexNames.contains(name)) {
    store.createIndex(name, keyPath)
  }
}

export function openAppDatabase() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not available in this environment.'))
        return
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION)

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

        let eventsStore

        if (!db.objectStoreNames.contains(STORE_NAMES.events)) {
          eventsStore = db.createObjectStore(STORE_NAMES.events, { keyPath: 'id' })
        } else {
          eventsStore = request.transaction.objectStore(STORE_NAMES.events)
        }

        ensureIndex(eventsStore, 'animalId', 'animalId')
        ensureIndex(eventsStore, 'date', 'date')
        ensureIndex(eventsStore, 'updatedAt', 'updatedAt')
      }

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB.'))
    })
  }

  return dbPromise
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

export function createId(prefix = 'item') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}
