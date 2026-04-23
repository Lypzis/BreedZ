import test from 'node:test'
import assert from 'node:assert/strict'
import { filterAnimalsList, filterEventsList } from '../src/utils/list-filters.js'

const animals = [
  { id: 'animal-1', tag: '001', name: 'Aurora', species: 'Cattle', status: 'active', isBreeder: true },
  { id: 'animal-2', tag: '002', name: 'Titan', species: 'Cattle', status: 'sold', isBreeder: false },
  { id: 'animal-3', tag: '003', name: 'Maple', species: 'Goat', status: 'active', isBreeder: false },
]

const events = [
  { id: 'event-1', animalId: 'animal-1', type: 'breeding', date: '2026-04-01', notes: 'Morning pen' },
  { id: 'event-2', animalId: 'animal-2', type: 'vaccination', date: '2026-04-10', notes: 'Booster shot' },
  { id: 'event-3', animalId: 'animal-3', type: 'custom', date: '2026-04-20', notes: 'Moved paddock' },
  {
    id: 'event-4',
    animalId: 'animal-1',
    animalIds: ['animal-1', 'animal-3'],
    type: 'sale',
    amount: 1500,
    date: '2026-04-15',
    notes: 'Shared batch sale',
  },
]

function resolveAnimalById(id) {
  return animals.find((animal) => animal.id === id)
}

test('animal filters are optional when empty', () => {
  const result = filterAnimalsList(animals, {
    searchTerm: '',
    status: '',
    species: '',
    breedersOnly: false,
  })

  assert.equal(result.length, animals.length)
})

test('animal filters combine search, status, and species', () => {
  const result = filterAnimalsList(animals, {
    searchTerm: 'aur',
    status: 'active',
    species: 'cattle',
    breedersOnly: false,
  })

  assert.deepEqual(result.map((animal) => animal.id), ['animal-1'])
})

test('animal species filter excludes non-matching species only when set', () => {
  const result = filterAnimalsList(animals, {
    searchTerm: '',
    status: '',
    species: 'goat',
    breedersOnly: false,
  })

  assert.deepEqual(result.map((animal) => animal.id), ['animal-3'])
})

test('animal breeders-only filter excludes non-breeders only when set', () => {
  const result = filterAnimalsList(animals, {
    searchTerm: '',
    status: '',
    species: '',
    breedersOnly: true,
  })

  assert.deepEqual(result.map((animal) => animal.id), ['animal-1'])
})

test('event filters are optional when empty', () => {
  const result = filterEventsList(events, resolveAnimalById, {
    searchTerm: '',
    eventType: '',
    startDate: '',
    endDate: '',
  })

  assert.equal(result.length, events.length)
})

test('event date range is inclusive on both boundaries', () => {
  const result = filterEventsList(events, resolveAnimalById, {
    searchTerm: '',
    eventType: '',
    startDate: '2026-04-10',
    endDate: '2026-04-20',
  })

  assert.deepEqual(result.map((event) => event.id), ['event-2', 'event-3', 'event-4'])
})

test('event filters combine type, search, and date range', () => {
  const result = filterEventsList(events, resolveAnimalById, {
    searchTerm: 'booster',
    eventType: 'vaccination',
    startDate: '2026-04-01',
    endDate: '2026-04-30',
  })

  assert.deepEqual(result.map((event) => event.id), ['event-2'])
})

test('event filters return no results for an inverted date range', () => {
  const result = filterEventsList(events, resolveAnimalById, {
    searchTerm: '',
    eventType: '',
    startDate: '2026-04-20',
    endDate: '2026-04-10',
  })

  assert.equal(result.length, 0)
})

test('event filters match shared events by any attached animal and amount', () => {
  const byAnimal = filterEventsList(events, resolveAnimalById, {
    searchTerm: 'shared batch',
    eventType: '',
    startDate: '',
    endDate: '',
  })

  const byAmount = filterEventsList(events, resolveAnimalById, {
    searchTerm: '1500',
    eventType: '',
    startDate: '',
    endDate: '',
  })

  assert.deepEqual(byAnimal.map((event) => event.id), ['event-4'])
  assert.deepEqual(byAmount.map((event) => event.id), ['event-4'])
})
