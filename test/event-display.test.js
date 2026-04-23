import test from 'node:test'
import assert from 'node:assert/strict'

import {
  formatEventAmount,
  formatEventAnimalsSummary,
  formatEventSpeciesBreedSummary,
  getEventAnimalIds,
} from '../src/utils/event-display.js'

const animals = new Map([
  ['animal-1', { id: 'animal-1', name: 'Bella', tag: 'A1', species: 'Cattle', breed: 'Nelore' }],
  ['animal-2', { id: 'animal-2', name: 'Luna', tag: 'A2', species: 'Cattle', breed: 'Nelore' }],
  ['animal-3', { id: 'animal-3', name: 'Mia', tag: 'A3', species: 'Goat', breed: 'Boer' }],
])

function animalById(id) {
  return animals.get(id) ?? null
}

test('returns canonical event animal ids for legacy and shared events', () => {
  assert.deepEqual(
    getEventAnimalIds({
      type: 'breeding',
      animalId: 'animal-1',
      partnerAnimalId: 'animal-2',
    }),
    ['animal-1', 'animal-2'],
  )

  assert.deepEqual(
    getEventAnimalIds({
      type: 'vaccination',
      animalIds: ['animal-1', 'animal-3'],
    }),
    ['animal-1', 'animal-3'],
  )
})

test('formats shared event animal summaries compactly', () => {
  assert.equal(
    formatEventAnimalsSummary(
      { type: 'vaccination', animalIds: ['animal-1', 'animal-2', 'animal-3'] },
      animalById,
    ),
    'Bella - A1, Luna - A2 +1',
  )
})

test('formats unique species and breed labels for affected animals', () => {
  assert.equal(
    formatEventSpeciesBreedSummary(
      { type: 'vaccination', animalIds: ['animal-1', 'animal-2', 'animal-3'] },
      animalById,
    ),
    'Cattle • Nelore, Goat • Boer',
  )
})

test('formats event amounts with locale-specific decimals without currency symbols', () => {
  assert.equal(formatEventAmount(1000, 'en'), '1,000.00')
  assert.equal(formatEventAmount(1000.5, 'pt-BR'), '1.000,50')
  assert.equal(formatEventAmount(''), '')
})
