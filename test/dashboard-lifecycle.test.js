import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildDashboardLifecycleSections,
} from '../src/utils/dashboard-lifecycle.js'

test('builds dashboard lifecycle sections from linked breeding records', () => {
  const result = buildDashboardLifecycleSections(
    [
      {
        id: 'breeding-due',
        type: 'breeding',
        animalIds: ['cow-1', 'bull-1'],
        partnerAnimalId: 'bull-1',
        date: '2026-04-01',
      },
      {
        id: 'breeding-recent',
        type: 'breeding',
        animalIds: ['cow-2', 'bull-1'],
        partnerAnimalId: 'bull-1',
        date: '2026-05-01',
      },
      {
        id: 'breeding-checked',
        type: 'breeding',
        animalIds: ['cow-3', 'bull-1'],
        partnerAnimalId: 'bull-1',
        date: '2026-04-01',
      },
      {
        id: 'check-1',
        type: 'pregnancy_check',
        animalId: 'cow-3',
        details: {
          result: 'pregnant',
          linkedBreedingEventId: 'breeding-checked',
        },
        date: '2026-05-01',
      },
      {
        id: 'expected-soon',
        type: 'expected_birth',
        animalId: 'cow-4',
        date: '2026-05-20',
      },
      {
        id: 'expected-overdue',
        type: 'expected_birth',
        animalId: 'cow-5',
        date: '2026-05-05',
      },
      {
        id: 'expected-resolved',
        type: 'expected_birth',
        animalId: 'cow-6',
        date: '2026-05-02',
        details: {
          resolutionStatus: 'resolved',
          outcomeType: 'birth',
          linkedOutcomeEventId: 'birth-1',
        },
      },
    ],
    '2026-05-11',
  )

  assert.deepEqual(result.pregnancyChecksDue.map((event) => event.id), ['breeding-due'])
  assert.deepEqual(result.unresolvedBreedings.map((event) => event.id), ['breeding-recent'])
  assert.deepEqual(result.expectedBirthsDueSoon.map((event) => event.id), ['expected-soon'])
  assert.deepEqual(result.overdueExpectedBirths.map((event) => event.id), ['expected-overdue'])
})
