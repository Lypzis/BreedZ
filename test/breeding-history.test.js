import test from 'node:test'
import assert from 'node:assert/strict'
import { groupBreedingsByPartner } from '../src/utils/breeding-history.js'

const animals = [
  { id: 'current', name: 'Ranger', tag: '004' },
  { id: 'bella', name: 'Bella', tag: '014' },
  { id: 'daisy', name: 'Daisy', tag: '022' },
  { id: 'nora', name: 'Nora', tag: '012', damId: 'bella', sireId: 'current', birthDate: '2025-05-10' },
  { id: 'milo', name: 'Milo', tag: '011', damId: 'bella', sireId: 'current', birthDate: '2025-01-08' },
  { id: 'storm', name: 'Storm', tag: '009', damId: 'daisy', sireId: 'current', birthDate: '2024-03-04' },
]

test('groups breeding events by partner and counts latest date', () => {
  const events = [
    { id: 'event-1', animalId: 'current', type: 'breeding', partnerAnimalId: 'bella', date: '2026-01-10' },
    { id: 'event-2', animalId: 'current', type: 'breeding', partnerAnimalId: 'bella', date: '2026-02-15' },
    { id: 'event-3', animalId: 'current', type: 'breeding', partnerAnimalId: 'daisy', date: '2025-03-05' },
    { id: 'event-4', animalId: 'current', type: 'vaccination', partnerAnimalId: 'bella', date: '2026-02-18' },
    { id: 'event-5', animalId: 'other', type: 'breeding', partnerAnimalId: 'bella', date: '2026-04-01' },
  ]

  const groups = groupBreedingsByPartner('current', animals, events)

  assert.equal(groups.length, 2)
  assert.equal(groups[0].partnerAnimalId, 'bella')
  assert.equal(groups[0].count, 2)
  assert.equal(groups[0].latestDate, '2026-02-15')
  assert.deepEqual(groups[0].offspringAnimals.map((animal) => animal.id), ['nora', 'milo'])
  assert.equal(groups[1].partnerAnimalId, 'daisy')
  assert.equal(groups[1].count, 1)
  assert.deepEqual(groups[1].offspringAnimals.map((animal) => animal.id), ['storm'])
})

test('adds lifecycle context from linked expected birth and pregnancy check events', () => {
  const events = [
    {
      id: 'breeding-1',
      animalId: 'current',
      type: 'breeding',
      partnerAnimalId: 'bella',
      linkedEventId: 'expected-1',
      date: '2026-02-15',
    },
    {
      id: 'expected-1',
      animalId: 'bella',
      type: 'expected_birth',
      linkedEventId: 'breeding-1',
      date: '2026-11-25',
    },
    {
      id: 'check-1',
      animalId: 'bella',
      type: 'pregnancy_check',
      details: {
        result: 'pregnant',
        method: 'ultrasound',
        linkedBreedingEventId: 'breeding-1',
      },
      date: '2026-03-20',
    },
  ]

  const groups = groupBreedingsByPartner('current', animals, events)

  assert.equal(groups.length, 1)
  assert.equal(groups[0].latestEvent.id, 'breeding-1')
  assert.equal(groups[0].expectedBirthEvent.id, 'expected-1')
  assert.equal(groups[0].pregnancyCheckEvent.id, 'check-1')
  assert.equal(groups[0].pregnancyCheckEvent.details.result, 'pregnant')
})

test('shows breeding history when current animal is the selected partner on the event', () => {
  const events = [
    { id: 'event-1', animalId: 'daisy', type: 'breeding', partnerAnimalId: 'current', date: '2025-03-05' },
    { id: 'event-2', animalId: 'bella', type: 'breeding', partnerAnimalId: 'current', date: '2026-02-15' },
  ]

  const groups = groupBreedingsByPartner('current', animals, events)

  assert.equal(groups.length, 2)
  assert.equal(groups[0].partnerAnimalId, 'bella')
  assert.equal(groups[0].count, 1)
  assert.equal(groups[1].partnerAnimalId, 'daisy')
  assert.equal(groups[1].count, 1)
})

test('ignores breeding events without partnerAnimalId', () => {
  const groups = groupBreedingsByPartner('current', animals, [
    { id: 'event-1', animalId: 'current', type: 'breeding', partnerAnimalId: '', date: '2026-01-10' },
  ])

  assert.deepEqual(groups, [])
})
