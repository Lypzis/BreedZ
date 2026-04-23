import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildEventAnimalIds,
  getEventAmountLabelKey,
  getEventSelectionMode,
} from '../src/utils/event-participants.js'

test('uses breeding mode only for breeding events', () => {
  assert.equal(getEventSelectionMode('breeding'), 'breeding')
  assert.equal(getEventSelectionMode('feed_cost'), 'optionalMulti')
  assert.equal(getEventSelectionMode('birth'), 'single')
  assert.equal(getEventSelectionMode('sale'), 'multi')
})

test('builds single, breeding, and multi event animal ids correctly', () => {
  assert.deepEqual(
    buildEventAnimalIds({
      type: 'birth',
      animalId: 'animal-1',
    }),
    ['animal-1'],
  )

  assert.deepEqual(
    buildEventAnimalIds({
      type: 'breeding',
      animalId: 'animal-1',
      partnerAnimalId: 'animal-2',
    }),
    ['animal-1', 'animal-2'],
  )

  assert.deepEqual(
    buildEventAnimalIds({
      type: 'vaccination',
      animalIds: ['animal-1', 'animal-2', 'animal-1'],
    }),
    ['animal-1', 'animal-2'],
  )
})

test('builds animal ids with a fixed animal for animal detail flows', () => {
  assert.deepEqual(
    buildEventAnimalIds({
      type: 'vaccination',
      animalIds: ['animal-2'],
      fixedAnimalId: 'animal-1',
    }),
    ['animal-1', 'animal-2'],
  )
})

test('returns contextual amount labels by event type', () => {
  assert.equal(getEventAmountLabelKey('purchase'), 'events.price')
  assert.equal(getEventAmountLabelKey('sale'), 'events.price')
  assert.equal(getEventAmountLabelKey('feed_cost'), 'events.cost')
  assert.equal(getEventAmountLabelKey('vaccination'), 'events.cost')
  assert.equal(getEventAmountLabelKey('custom'), 'events.amount')
})
