import test from 'node:test'
import assert from 'node:assert/strict'
import 'fake-indexeddb/auto'

import {
  closeAppDatabase,
  DB_NAME,
  migrateStoredEventsToCanonicalShape,
  STORE_NAMES,
  withStore,
} from '../src/services/app-db.js'
import { createAnimal, deleteAnimal, getAnimal, listAnimals } from '../src/services/animals-db.js'
import { createPurchaseEventWithAnimals } from '../src/services/purchase-events-db.js'
import { listPendingSyncRecords, pushPendingSyncRecords } from '../src/services/sync-queue.js'
import { stripLocalSyncMetadataFromRecords } from '../src/utils/sync-metadata.js'

async function deleteDatabase() {
  await closeAppDatabase()

  await new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error ?? new Error('Failed to delete test database.'))
    request.onblocked = () => reject(new Error('Test database deletion was blocked.'))
  })
}

test('migrates legacy IndexedDB events to the canonical event shape', async (t) => {
  await deleteDatabase()
  t.after(deleteDatabase)

  await withStore(STORE_NAMES.events, 'readwrite', (store) => {
    store.put({
      id: 'breeding-legacy',
      animalId: 'cow-1',
      partnerAnimalId: 'bull-1',
      type: 'breeding',
      date: '2026-04-01',
    })
    store.put({
      id: 'sale-legacy',
      animalId: 'cow-2',
      type: 'sale',
      amount: '1.000,00',
      date: '2026-04-02',
    })
  })

  const result = await migrateStoredEventsToCanonicalShape()

  assert.deepEqual(result, { checked: 2, migrated: 2 })

  const storedEvents = await withStore(STORE_NAMES.events, 'readonly', (store) => store.getAll())
  const breedingEvent = storedEvents.find((event) => event.id === 'breeding-legacy')
  const saleEvent = storedEvents.find((event) => event.id === 'sale-legacy')

  assert.deepEqual(breedingEvent.animalIds, ['cow-1', 'bull-1'])
  assert.equal(breedingEvent.animalId, 'cow-1')
  assert.equal(breedingEvent.partnerAnimalId, 'bull-1')
  assert.equal(breedingEvent.amount, null)
  assert.deepEqual(saleEvent.animalIds, ['cow-2'])
  assert.equal(saleEvent.animalId, 'cow-2')
  assert.equal(saleEvent.partnerAnimalId, '')
  assert.equal(saleEvent.amount, 1000)

  const eventsForCow2 = await withStore(
    STORE_NAMES.events,
    'readonly',
    (store) => store.index('animalIds').getAll('cow-2'),
  )

  assert.deepEqual(eventsForCow2.map((event) => event.id), ['sale-legacy'])

  const secondResult = await migrateStoredEventsToCanonicalShape()
  assert.deepEqual(secondResult, { checked: 2, migrated: 0 })
})

test('creates purchased animals and one shared purchase event in IndexedDB', async (t) => {
  await deleteDatabase()
  t.after(deleteDatabase)

  await withStore(STORE_NAMES.animals, 'readwrite', (store) => {
    store.put({
      id: 'existing-cow',
      tag: 'Existing 001',
      status: 'active',
      baseStatus: 'active',
      createdAt: '2026-04-01T00:00:00.000Z',
      updatedAt: '2026-04-01T00:00:00.000Z',
    })
  })

  const { animals, event } = await createPurchaseEventWithAnimals({
    existingAnimalIds: ['existing-cow'],
    newAnimals: [
      {
        tag: 'New 002',
        species: 'Cow',
        sex: 'female',
      },
    ],
    amount: '3.500,00',
    date: '2026-04-03',
    notes: 'Auction purchase',
  })

  assert.equal(animals.length, 1)
  assert.equal(animals[0].tag, 'New 002')
  assert.equal(animals[0].status, 'active')
  assert.equal(animals[0].sync.dirty, true)
  assert.equal(animals[0].sync.deleted, false)
  assert.equal(event.type, 'purchase')
  assert.equal(event.amount, 3500)
  assert.deepEqual(event.animalIds, ['existing-cow', animals[0].id])
  assert.equal(event.sync.dirty, true)
  assert.equal(event.sync.deleted, false)

  const storedAnimals = await withStore(STORE_NAMES.animals, 'readonly', (store) => store.getAll())
  const storedEvents = await withStore(STORE_NAMES.events, 'readonly', (store) => store.getAll())

  assert.equal(storedAnimals.length, 2)
  assert.equal(storedEvents.length, 1)
  assert.deepEqual(storedEvents[0].animalIds, event.animalIds)
  assert.equal(storedAnimals.find((animal) => animal.id === animals[0].id).sync.dirty, true)
  assert.equal(storedEvents[0].sync.dirty, true)

  assert.equal('sync' in stripLocalSyncMetadataFromRecords(storedAnimals)[0], false)
  assert.equal('sync' in stripLocalSyncMetadataFromRecords(storedEvents)[0], false)
})

test('soft-deletes animals as local tombstones for sync', async (t) => {
  await deleteDatabase()
  t.after(deleteDatabase)

  const animal = await createAnimal({
    tag: 'Delete 001',
    status: 'active',
  })

  const deletedAnimal = await deleteAnimal(animal.id)

  assert.equal(deletedAnimal.id, animal.id)
  assert.equal(deletedAnimal.sync.dirty, true)
  assert.equal(deletedAnimal.sync.deleted, true)
  assert.equal(typeof deletedAnimal.deletedAt, 'string')

  assert.equal(await getAnimal(animal.id), null)

  const visibleAnimals = await listAnimals()
  assert.deepEqual(visibleAnimals.map((item) => item.id), [])

  const allAnimals = await listAnimals({ includeDeleted: true })
  assert.deepEqual(allAnimals.map((item) => item.id), [animal.id])
  assert.equal(allAnimals[0].sync.deleted, true)
})

test('pushes pending sync records and marks local records clean', async (t) => {
  await deleteDatabase()
  t.after(deleteDatabase)

  const animal = await createAnimal({
    tag: 'Sync 001',
    status: 'active',
  })

  await withStore(STORE_NAMES.events, 'readwrite', (store) => {
    store.put({
      id: 'event-sync-1',
      animalId: animal.id,
      animalIds: [animal.id],
      scope: 'animals',
      type: 'custom',
      confirmationStatus: 'confirmed',
      date: '2026-05-04',
      notes: 'Sync test',
      createdAt: '2026-05-04T00:00:00.000Z',
      updatedAt: '2026-05-04T00:00:00.000Z',
      sync: {
        dirty: true,
        deleted: false,
      },
    })
  })

  const pendingBefore = await listPendingSyncRecords()
  assert.deepEqual(pendingBefore.animals.map((item) => item.id), [animal.id])
  assert.deepEqual(pendingBefore.events.map((item) => item.id), ['event-sync-1'])

  const pushedAnimals = []
  const pushedEvents = []
  const serverDate = new Date('2026-05-04T12:00:00.000Z')
  const result = await pushPendingSyncRecords('user-1', {
    deviceId: 'device-1',
    pushAnimalToCloud: async (uid, record, deviceId) => {
      pushedAnimals.push({ uid, record, deviceId })
      return { serverUpdatedAt: { toDate: () => serverDate } }
    },
    pushEventToCloud: async (uid, record, deviceId) => {
      pushedEvents.push({ uid, record, deviceId })
      return { serverUpdatedAt: { toDate: () => serverDate } }
    },
  })

  assert.equal(result.attempted, 2)
  assert.equal(result.pushed, 2)
  assert.equal(result.failed, 0)
  assert.equal(result.skipped, 0)
  assert.equal(pushedAnimals[0].uid, 'user-1')
  assert.equal(pushedAnimals[0].deviceId, 'device-1')
  assert.equal(pushedEvents[0].uid, 'user-1')
  assert.equal(pushedEvents[0].deviceId, 'device-1')

  const pendingAfter = await listPendingSyncRecords()
  assert.deepEqual(pendingAfter.animals, [])
  assert.deepEqual(pendingAfter.events, [])

  const storedAnimal = await withStore(STORE_NAMES.animals, 'readonly', (store) => store.get(animal.id))
  const storedEvent = await withStore(STORE_NAMES.events, 'readonly', (store) => store.get('event-sync-1'))

  assert.equal(storedAnimal.sync.dirty, false)
  assert.equal(storedAnimal.sync.deviceId, 'device-1')
  assert.equal(storedAnimal.sync.cloudUpdatedAt, '2026-05-04T12:00:00.000Z')
  assert.equal(storedEvent.sync.dirty, false)
  assert.equal(storedEvent.sync.deviceId, 'device-1')
  assert.equal(storedEvent.sync.cloudUpdatedAt, '2026-05-04T12:00:00.000Z')
})

test('keeps failed sync records dirty with an error message', async (t) => {
  await deleteDatabase()
  t.after(deleteDatabase)

  const animal = await createAnimal({
    tag: 'Failure 001',
    status: 'active',
  })

  const result = await pushPendingSyncRecords('user-1', {
    deviceId: 'device-1',
    pushAnimalToCloud: async () => {
      throw new Error('Firestore unavailable')
    },
    pushEventToCloud: async () => {
      throw new Error('Should not be called')
    },
  })

  assert.equal(result.attempted, 1)
  assert.equal(result.pushed, 0)
  assert.equal(result.failed, 1)
  assert.equal(result.errors[0].id, animal.id)

  const storedAnimal = await withStore(STORE_NAMES.animals, 'readonly', (store) => store.get(animal.id))
  assert.equal(storedAnimal.sync.dirty, true)
  assert.equal(storedAnimal.sync.error, 'Firestore unavailable')
})

test('stops pending sync after a permission denied error', async (t) => {
  await deleteDatabase()
  t.after(deleteDatabase)

  const animal = await createAnimal({
    tag: 'Permission 001',
    status: 'active',
  })

  await withStore(STORE_NAMES.events, 'readwrite', (store) => {
    store.put({
      id: 'event-permission-1',
      animalId: animal.id,
      animalIds: [animal.id],
      scope: 'animals',
      type: 'custom',
      confirmationStatus: 'confirmed',
      date: '2026-05-04',
      createdAt: '2026-05-04T00:00:00.000Z',
      updatedAt: '2026-05-04T00:00:00.000Z',
      sync: {
        dirty: true,
        deleted: false,
      },
    })
  })

  let eventPushCount = 0
  const result = await pushPendingSyncRecords('user-1', {
    deviceId: 'device-1',
    pushAnimalToCloud: async () => {
      const error = new Error('Missing or insufficient permissions.')
      error.code = 'permission-denied'
      throw error
    },
    pushEventToCloud: async () => {
      eventPushCount += 1
    },
  })

  assert.equal(result.attempted, 2)
  assert.equal(result.failed, 1)
  assert.equal(result.errors[0].id, animal.id)
  assert.equal(eventPushCount, 0)

  const pendingAfter = await listPendingSyncRecords()
  assert.deepEqual(pendingAfter.animals.map((item) => item.id), [animal.id])
  assert.deepEqual(pendingAfter.events.map((item) => item.id), ['event-permission-1'])
})

test('pushes deleted tombstones through the pending sync queue', async (t) => {
  await deleteDatabase()
  t.after(deleteDatabase)

  const animal = await createAnimal({
    tag: 'Tombstone 001',
    status: 'active',
  })

  await deleteAnimal(animal.id)

  const pushedAnimals = []
  const result = await pushPendingSyncRecords('user-1', {
    deviceId: 'device-1',
    pushAnimalToCloud: async (uid, record, deviceId) => {
      pushedAnimals.push({ uid, record, deviceId })
      return { cloudUpdatedAt: '2026-05-04T13:00:00.000Z' }
    },
    pushEventToCloud: async () => {
      throw new Error('Should not be called')
    },
  })

  assert.equal(result.attempted, 1)
  assert.equal(result.pushed, 1)
  assert.equal(pushedAnimals[0].record.id, animal.id)
  assert.equal(pushedAnimals[0].record.sync.deleted, true)
  assert.equal(typeof pushedAnimals[0].record.deletedAt, 'string')

  const storedAnimal = await withStore(STORE_NAMES.animals, 'readonly', (store) => store.get(animal.id))
  assert.equal(storedAnimal.sync.dirty, false)
  assert.equal(storedAnimal.sync.deleted, true)
  assert.equal(storedAnimal.sync.cloudUpdatedAt, '2026-05-04T13:00:00.000Z')
})

test('does not mark a record clean if it changes during sync', async (t) => {
  await deleteDatabase()
  t.after(deleteDatabase)

  const animal = await createAnimal({
    tag: 'Race 001',
    status: 'active',
  })

  const result = await pushPendingSyncRecords('user-1', {
    deviceId: 'device-1',
    pushAnimalToCloud: async () => {
      await withStore(STORE_NAMES.animals, 'readwrite', (store) =>
        store.put({
          ...animal,
          tag: 'Race 001 updated',
          updatedAt: '2026-05-04T14:00:00.000Z',
          sync: {
            ...animal.sync,
            dirty: true,
          },
        }),
      )

      return { cloudUpdatedAt: '2026-05-04T13:30:00.000Z' }
    },
    pushEventToCloud: async () => {
      throw new Error('Should not be called')
    },
  })

  assert.equal(result.attempted, 1)
  assert.equal(result.pushed, 0)
  assert.equal(result.skipped, 1)

  const storedAnimal = await withStore(STORE_NAMES.animals, 'readonly', (store) => store.get(animal.id))
  assert.equal(storedAnimal.tag, 'Race 001 updated')
  assert.equal(storedAnimal.sync.dirty, true)
  assert.equal(storedAnimal.sync.cloudUpdatedAt ?? '', '')
})
