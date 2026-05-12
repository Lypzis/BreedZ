import test from 'node:test'
import assert from 'node:assert/strict'
import { validateAndNormalizeBackupPayload } from '../src/utils/backup-data.js'

test('normalizes a valid backup payload', () => {
  const result = validateAndNormalizeBackupPayload({
    schemaVersion: 3,
    exportedAt: '2026-04-03T12:00:00.000Z',
    animals: [
      {
        id: 'animal-1',
        tag: 'Cow 001',
        name: 'Bella',
        species: 'Cow',
        weight: '420',
        isBreeder: true,
        sex: 'female',
        birthDate: '2024-01-10',
        baseStatus: 'active',
        status: 'active',
        damId: '',
        sireId: '',
        notes: 'Dam line',
      },
      {
        id: 'animal-2',
        tag: 'Bull 002',
        name: 'Ranger',
        species: 'Cow',
        weight: '710.5',
        isBreeder: true,
        sex: 'male',
        birthDate: '2023-01-10',
        baseStatus: 'active',
        status: 'active',
        damId: '',
        sireId: '',
        notes: 'Sire line',
      },
    ],
    events: [
      {
        id: 'event-1',
        animalId: 'animal-1',
        animalIds: ['animal-1', 'animal-2'],
        type: 'breeding',
        partnerAnimalId: 'animal-2',
        amount: '1.250,50',
        date: '2026-04-03',
        notes: 'Healthy calf',
      },
    ],
  })

  assert.equal(result.animals[0].sex, 'female')
  assert.equal(result.animals[0].isBreeder, true)
  assert.equal(result.animals[0].weight, '420')
  assert.equal(result.animals[0].baseStatus, 'active')
  assert.equal(result.events[0].animalId, 'animal-1')
  assert.deepEqual(result.events[0].animalIds, ['animal-1', 'animal-2'])
  assert.equal(result.events[0].partnerAnimalId, 'animal-2')
  assert.equal(result.events[0].amount, 1250.5)
})

test('normalizes multi-animal non-breeding events and baseStatus in backup payloads', () => {
  const result = validateAndNormalizeBackupPayload({
    animals: [
      {
        id: 'animal-1',
        tag: 'Cow 001',
        species: 'Cow',
        baseStatus: 'active',
        status: 'sold',
      },
      {
        id: 'animal-2',
        tag: 'Cow 002',
        species: 'Cow',
        baseStatus: 'active',
        status: 'active',
      },
    ],
    events: [
      {
        id: 'event-1',
        animalIds: ['animal-1', 'animal-2'],
        type: 'sale',
        amount: '1000.00',
        date: '2026-04-03',
      },
    ],
  })

  assert.deepEqual(result.events[0].animalIds, ['animal-1', 'animal-2'])
  assert.equal(result.events[0].animalId, 'animal-1')
  assert.equal(result.events[0].amount, 1000)
  assert.equal(result.animals[0].baseStatus, 'active')
})

test('accepts purchase events in backup payloads', () => {
  const result = validateAndNormalizeBackupPayload({
    animals: [
      {
        id: 'animal-1',
        tag: 'Cow 001',
        status: 'active',
      },
    ],
    events: [
      {
        id: 'event-1',
        animalIds: ['animal-1'],
        type: 'purchase',
        amount: '2500',
        date: '2026-04-03',
      },
    ],
  })

  assert.equal(result.events[0].type, 'purchase')
  assert.deepEqual(result.events[0].animalIds, ['animal-1'])
  assert.equal(result.events[0].amount, 2500)
})

test('accepts herd-scoped financial events without animals in backup payloads', () => {
  const result = validateAndNormalizeBackupPayload({
    animals: [],
    events: [
      {
        id: 'event-1',
        scope: 'herd',
        type: 'feed_cost',
        amount: '800',
        date: '2026-04-03',
      },
    ],
  })

  assert.equal(result.events[0].scope, 'herd')
  assert.deepEqual(result.events[0].animalIds, [])
  assert.equal(result.events[0].amount, 800)
})

test('accepts pregnancy check events with structured details in backup payloads', () => {
  const result = validateAndNormalizeBackupPayload({
    animals: [
      {
        id: 'animal-1',
        tag: 'Cow 001',
        species: 'Cattle',
      },
    ],
    events: [
      {
        id: 'event-1',
        animalId: 'animal-1',
        type: 'pregnancy_check',
        details: {
          result: 'pregnant',
          method: 'ultrasound',
          linkedBreedingEventId: 'event-breeding',
        },
        date: '2026-04-03',
      },
    ],
  })

  assert.equal(result.events[0].type, 'pregnancy_check')
  assert.deepEqual(result.events[0].details, {
    result: 'pregnant',
    method: 'ultrasound',
    linkedBreedingEventId: 'event-breeding',
    linkedExpectedBirthEventId: '',
  })
})

test('accepts breeding lifecycle outcome events in backup payloads', () => {
  const result = validateAndNormalizeBackupPayload({
    animals: [
      {
        id: 'animal-1',
        tag: 'Cow 001',
        species: 'Cattle',
      },
    ],
    events: [
      {
        id: 'event-failed',
        animalId: 'animal-1',
        type: 'breeding_failed',
        date: '2026-04-03',
      },
      {
        id: 'event-loss',
        animalId: 'animal-1',
        type: 'abortion',
        date: '2026-04-04',
      },
      {
        id: 'event-weaning',
        animalId: 'animal-1',
        type: 'weaning',
        date: '2026-04-05',
      },
    ],
  })

  assert.deepEqual(
    result.events.map((event) => event.type),
    ['breeding_failed', 'abortion', 'weaning'],
  )
  assert.deepEqual(result.events[0].animalIds, ['animal-1'])
})

test('rejects an event that references a missing animal', () => {
  assert.throws(
    () =>
      validateAndNormalizeBackupPayload({
        animals: [],
        events: [
          {
            id: 'event-1',
            animalId: 'missing-animal',
            type: 'birth',
            date: '2026-04-03',
          },
        ],
      }),
    /references a missing animal/,
  )
})

test('rejects a breeding event that references a missing partner animal', () => {
  assert.throws(
    () =>
      validateAndNormalizeBackupPayload({
        animals: [
          {
            id: 'animal-1',
            tag: 'Cow 001',
            species: 'Cow',
          },
        ],
        events: [
          {
            id: 'event-1',
            animalId: 'animal-1',
            type: 'breeding',
            partnerAnimalId: 'missing-animal',
            date: '2026-04-03',
          },
        ],
      }),
    /references a missing animal/,
  )
})

test('rejects lineage that points to a missing parent', () => {
  assert.throws(
    () =>
      validateAndNormalizeBackupPayload({
        animals: [
          {
            id: 'animal-1',
            tag: 'Cow 001',
            species: 'Cow',
            damId: 'missing-dam',
          },
        ],
        events: [],
      }),
    /damId "missing-dam" does not exist/,
  )
})

test('rejects an animal with neither tag nor name', () => {
  assert.throws(
    () =>
      validateAndNormalizeBackupPayload({
        animals: [
          {
            id: 'animal-1',
            tag: '',
            name: '',
            species: 'Cow',
          },
        ],
        events: [],
      }),
    /must have a tag or name/,
  )
})
