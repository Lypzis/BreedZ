import test from 'node:test'
import assert from 'node:assert/strict'

import {
  deriveEventAnimalIds,
  eventIncludesAnimal,
  normalizeEventAmount,
  normalizeEventRecord,
} from '../src/utils/event-records.js'

test('derives legacy breeding animalIds from animalId and partnerAnimalId', () => {
  assert.deepEqual(
    deriveEventAnimalIds({
      type: 'breeding',
      animalId: 'animal-1',
      partnerAnimalId: 'animal-2',
    }),
    ['animal-1', 'animal-2'],
  )
})

test('prefers explicit animalIds while keeping breeding partner included', () => {
  assert.deepEqual(
    deriveEventAnimalIds({
      type: 'breeding',
      animalIds: ['animal-1'],
      partnerAnimalId: 'animal-2',
    }),
    ['animal-1', 'animal-2'],
  )
})

test('normalizes event records with canonical animalIds, legacy compatibility fields, and amount', () => {
  const normalized = normalizeEventRecord({
    id: 'event-1',
    type: 'vaccination',
    animalIds: ['animal-2', 'animal-1', 'animal-2'],
    amount: '1.250,50',
  })

  assert.deepEqual(normalized.animalIds, ['animal-2', 'animal-1'])
  assert.equal(normalized.animalId, 'animal-2')
  assert.equal(normalized.partnerAnimalId, '')
  assert.equal(normalized.amount, 1250.5)
})

test('normalizes herd-scoped events with no animal ids', () => {
  const normalized = normalizeEventRecord({
    id: 'event-1',
    scope: 'herd',
    type: 'feed_cost',
    amount: '500',
  })

  assert.equal(normalized.scope, 'herd')
  assert.deepEqual(normalized.animalIds, [])
  assert.equal(normalized.animalId, '')
  assert.equal(normalized.amount, 500)
})

test('normalizes locale-agnostic amount strings', () => {
  assert.equal(normalizeEventAmount('1,250.50'), 1250.5)
  assert.equal(normalizeEventAmount('1.250,50'), 1250.5)
  assert.equal(normalizeEventAmount('1250'), 1250)
  assert.equal(normalizeEventAmount(''), null)
})

test('matches shared events against any included animal', () => {
  const event = normalizeEventRecord({
    id: 'event-1',
    type: 'sale',
    animalIds: ['animal-1', 'animal-3'],
  })

  assert.equal(eventIncludesAnimal(event, 'animal-1'), true)
  assert.equal(eventIncludesAnimal(event, 'animal-3'), true)
  assert.equal(eventIncludesAnimal(event, 'animal-2'), false)
})
