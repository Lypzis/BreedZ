import test from 'node:test'
import assert from 'node:assert/strict'

import {
  deriveEventAnimalIds,
  eventIncludesAnimal,
  isEventNeedingConfirmation,
  isExpectedBirthResolved,
  isFutureScheduledEvent,
  normalizeEventAmount,
  normalizeEventRecord,
  sanitizeNonNegativeAmountInput,
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
    linkedEventId: 'event-2',
    amount: '1.250,50',
  })

  assert.deepEqual(normalized.animalIds, ['animal-2', 'animal-1'])
  assert.equal(normalized.animalId, 'animal-2')
  assert.equal(normalized.partnerAnimalId, '')
  assert.equal(normalized.linkedEventId, 'event-2')
  assert.equal(normalized.amount, 1250.5)
})

test('normalizes pregnancy check details while preserving unknown detail fields', () => {
  const normalized = normalizeEventRecord({
    id: 'event-1',
    type: 'pregnancy_check',
    animalId: 'animal-1',
    details: {
      result: 'Pregnant',
      method: 'ULTRASOUND',
      linkedBreedingEventId: ' breeding-1 ',
      extraNote: 'second trimester',
    },
  })

  assert.deepEqual(normalized.animalIds, ['animal-1'])
  assert.deepEqual(normalized.details, {
    result: 'pregnant',
    method: 'ultrasound',
    linkedBreedingEventId: 'breeding-1',
    linkedExpectedBirthEventId: '',
    extraNote: 'second trimester',
  })
})

test('preserves generic event details for forward compatibility', () => {
  const normalized = normalizeEventRecord({
    id: 'event-1',
    type: 'custom',
    animalId: 'animal-1',
    details: {
      customField: 'kept',
    },
  })

  assert.deepEqual(normalized.details, { customField: 'kept' })
})

test('normalizes expected birth resolution details and removes pending state from resolved records', () => {
  const normalized = normalizeEventRecord({
    id: 'event-1',
    type: 'expected_birth',
    animalId: 'animal-1',
    confirmationStatus: 'pending',
    date: '2026-05-01',
    details: {
      resolutionStatus: 'Resolved',
      outcomeType: 'BIRTH',
      linkedOutcomeEventId: ' birth-1 ',
      resolvedAt: ' 2026-04-28T12:00:00.000Z ',
      note: 'calved early',
    },
  })

  assert.deepEqual(normalized.details, {
    resolutionStatus: 'resolved',
    outcomeType: 'birth',
    linkedOutcomeEventId: 'birth-1',
    resolvedAt: '2026-04-28T12:00:00.000Z',
    note: 'calved early',
  })
  assert.equal(isExpectedBirthResolved(normalized), true)
  assert.equal(isFutureScheduledEvent(normalized, '2026-04-01'), false)
  assert.equal(isEventNeedingConfirmation(normalized, '2026-05-02'), false)
})

test('normalizes lifecycle outcome links in event details', () => {
  const normalized = normalizeEventRecord({
    id: 'event-1',
    type: 'abortion',
    animalId: 'animal-1',
    details: {
      linkedExpectedBirthEventId: ' expected-1 ',
      linkedBreedingEventId: ' breeding-1 ',
    },
  })

  assert.deepEqual(normalized.details, {
    linkedExpectedBirthEventId: 'expected-1',
    linkedBreedingEventId: 'breeding-1',
  })
})

test('normalizes weaning links in event details', () => {
  const normalized = normalizeEventRecord({
    id: 'event-1',
    type: 'weaning',
    animalId: 'animal-1',
    details: {
      linkedBirthEventId: ' birth-1 ',
      note: 'kept',
    },
  })

  assert.deepEqual(normalized.details, {
    linkedBirthEventId: 'birth-1',
    note: 'kept',
  })
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

test('marks future-dated events as pending by default', () => {
  const normalized = normalizeEventRecord({
    id: 'event-2',
    type: 'sale',
    animalIds: ['animal-1'],
    date: '2099-06-01',
  })

  assert.equal(normalized.confirmationStatus, 'pending')
  assert.equal(isFutureScheduledEvent(normalized, '2026-05-01'), true)
  assert.equal(isEventNeedingConfirmation(normalized, '2099-06-02'), true)
})

test('preserves explicit pending confirmation status for due events', () => {
  const normalized = normalizeEventRecord({
    id: 'event-3',
    type: 'expected_birth',
    animalIds: ['animal-1'],
    date: '2026-04-20',
    confirmationStatus: 'pending',
  })

  assert.equal(normalized.confirmationStatus, 'pending')
  assert.equal(isEventNeedingConfirmation(normalized, '2026-05-01'), true)
})

test('normalizes locale-agnostic amount strings', () => {
  assert.equal(normalizeEventAmount('1,250.50'), 1250.5)
  assert.equal(normalizeEventAmount('1.250,50'), 1250.5)
  assert.equal(normalizeEventAmount('1250'), 1250)
  assert.equal(normalizeEventAmount(''), null)
})

test('sanitizes amount input to non-negative numeric characters and separators only', () => {
  assert.equal(sanitizeNonNegativeAmountInput('-1250abc'), '1250')
  assert.equal(sanitizeNonNegativeAmountInput('1.250,50kg'), '1.250,50')
  assert.equal(sanitizeNonNegativeAmountInput(',75'), '0,75')
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
