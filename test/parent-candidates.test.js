import test from 'node:test'
import assert from 'node:assert/strict'
import { filterAnimalCandidates, filterParentCandidates } from '../src/utils/parent-candidates.js'

const animals = [
  { id: 'self', tag: 'Cow 001', name: 'Self', species: 'Cow', sex: 'female', status: 'active' },
  { id: 'dam-1', tag: 'Cow 101', name: 'Bella', species: 'Cow', sex: 'female', status: 'active' },
  { id: 'sire-1', tag: 'Bull 201', name: 'Rex', species: 'Cow', sex: 'male', status: 'active' },
  { id: 'sire-sold', tag: 'Bull 202', name: 'Old Rex', species: 'Cow', sex: 'male', status: 'sold' },
  { id: 'other-species', tag: 'Goat 12', name: 'Nina', species: 'Goat', sex: 'female', status: 'active' },
  { id: 'unknown-sex', tag: 'Cow 999', name: 'Mystery', species: 'Cow', sex: 'unknown', status: 'active' },
]

test('filters parent candidates by current animal, species, sex, and active status', () => {
  const candidates = filterParentCandidates({
    animals,
    currentAnimalId: 'self',
    species: 'Cow',
    requiredSex: 'female',
    query: '',
  })

  assert.deepEqual(
    candidates.map((animal) => animal.id),
    ['dam-1'],
  )
})

test('filters parent candidates by search query', () => {
  const candidates = filterParentCandidates({
    animals,
    currentAnimalId: 'self',
    species: 'Cow',
    requiredSex: 'male',
    query: 'rex',
  })

  assert.deepEqual(
    candidates.map((animal) => animal.id),
    ['sire-1'],
  )
})

test('generic animal candidates keep all animals when query is empty', () => {
  const candidates = filterAnimalCandidates({
    animals,
    query: '',
  })

  assert.deepEqual(
    candidates.map((animal) => animal.id),
    ['dam-1', 'unknown-sex', 'other-species', 'sire-sold', 'sire-1', 'self'],
  )
})

test('generic animal candidates filter by search query without sex restriction', () => {
  const candidates = filterAnimalCandidates({
    animals,
    query: 'rex',
  })

  assert.deepEqual(
    candidates.map((animal) => animal.id),
    ['sire-sold', 'sire-1'],
  )
})
