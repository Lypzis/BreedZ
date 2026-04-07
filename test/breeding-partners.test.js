import test from 'node:test'
import assert from 'node:assert/strict'
import {
  filterBreedingPartnerCandidates,
  validateBreedingPartnerSelection,
} from '../src/utils/breeding-partners.js'

const animals = [
  { id: 'self-female', tag: '001', name: 'Bella', species: 'Cow', sex: 'female', status: 'active' },
  { id: 'self-male', tag: '002', name: 'Ranger', species: 'Cow', sex: 'male', status: 'active' },
  { id: 'same-sex', tag: '003', name: 'Daisy', species: 'Cow', sex: 'female', status: 'active' },
  { id: 'opposite-sex', tag: '004', name: 'Titan', species: 'Cow', sex: 'male', status: 'active' },
  { id: 'unknown-sex', tag: '005', name: 'Mystery', species: 'Cow', sex: 'unknown', status: 'active' },
  { id: 'other-species', tag: '006', name: 'Goat One', species: 'Goat', sex: 'male', status: 'active' },
  { id: 'inactive-partner', tag: '007', name: 'Old Bull', species: 'Cow', sex: 'male', status: 'sold' },
]

test('filters breeding partner candidates by active status, species, opposite sex, and self exclusion', () => {
  const candidates = filterBreedingPartnerCandidates({
    animals,
    animalId: 'self-female',
    query: '',
  })

  assert.deepEqual(
    candidates.map((animal) => animal.id),
    ['unknown-sex', 'self-male', 'opposite-sex'],
  )
})

test('keeps the currently selected breeding partner visible in edit mode even if it no longer matches filters', () => {
  const candidates = filterBreedingPartnerCandidates({
    animals,
    animalId: 'self-female',
    currentPartnerId: 'inactive-partner',
    query: '',
  })

  assert.ok(candidates.some((animal) => animal.id === 'inactive-partner'))
})

test('rejects missing breeding partner selection', () => {
  assert.equal(
    validateBreedingPartnerSelection({
      animals,
      animalId: 'self-female',
      partnerAnimalId: '',
    }),
    'events.breedingPartnerRequired',
  )
})

test('rejects same-animal breeding selection', () => {
  assert.equal(
    validateBreedingPartnerSelection({
      animals,
      animalId: 'self-female',
      partnerAnimalId: 'self-female',
    }),
    'events.breedingPartnerSameAnimal',
  )
})

test('rejects inactive breeding partners', () => {
  assert.equal(
    validateBreedingPartnerSelection({
      animals,
      animalId: 'self-female',
      partnerAnimalId: 'inactive-partner',
    }),
    'events.breedingPartnerMustBeActive',
  )
})

test('rejects species mismatch when both animals have species', () => {
  assert.equal(
    validateBreedingPartnerSelection({
      animals,
      animalId: 'self-female',
      partnerAnimalId: 'other-species',
    }),
    'events.breedingPartnerSpeciesMismatch',
  )
})

test('rejects same-sex breeding when both sexes are known', () => {
  assert.equal(
    validateBreedingPartnerSelection({
      animals,
      animalId: 'self-female',
      partnerAnimalId: 'same-sex',
    }),
    'events.breedingPartnerSexMismatch',
  )
})

test('allows breeding when partner sex is unknown', () => {
  assert.equal(
    validateBreedingPartnerSelection({
      animals,
      animalId: 'self-female',
      partnerAnimalId: 'unknown-sex',
    }),
    '',
  )
})
