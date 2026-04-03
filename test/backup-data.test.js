import test from 'node:test'
import assert from 'node:assert/strict'
import { validateAndNormalizeBackupPayload } from '../src/utils/backup-data.js'

test('normalizes a valid backup payload', () => {
  const result = validateAndNormalizeBackupPayload({
    schemaVersion: 1,
    exportedAt: '2026-04-03T12:00:00.000Z',
    animals: [
      {
        id: 'animal-1',
        tag: 'Cow 001',
        name: 'Bella',
        species: 'Cow',
        sex: 'female',
        birthDate: '2024-01-10',
        status: 'active',
        damId: '',
        sireId: '',
        notes: 'Dam line',
      },
    ],
    events: [
      {
        id: 'event-1',
        animalId: 'animal-1',
        type: 'birth',
        date: '2026-04-03',
        notes: 'Healthy calf',
      },
    ],
  })

  assert.equal(result.animals[0].sex, 'female')
  assert.equal(result.events[0].animalId, 'animal-1')
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
