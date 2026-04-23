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
import { createPurchaseEventWithAnimals } from '../src/services/purchase-events-db.js'

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
  assert.equal(event.type, 'purchase')
  assert.equal(event.amount, 3500)
  assert.deepEqual(event.animalIds, ['existing-cow', animals[0].id])

  const storedAnimals = await withStore(STORE_NAMES.animals, 'readonly', (store) => store.getAll())
  const storedEvents = await withStore(STORE_NAMES.events, 'readonly', (store) => store.getAll())

  assert.equal(storedAnimals.length, 2)
  assert.equal(storedEvents.length, 1)
  assert.deepEqual(storedEvents[0].animalIds, event.animalIds)
})
