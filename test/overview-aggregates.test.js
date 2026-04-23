import test from 'node:test'
import assert from 'node:assert/strict'

import { buildOverviewSummary } from '../src/utils/overview-aggregates.js'

test('builds overview counts and recorded balance from animals and events', () => {
  const summary = buildOverviewSummary(
    [
      { id: 'animal-1', status: 'active', isBreeder: true },
      { id: 'animal-2', status: 'sold', isBreeder: false },
      { id: 'animal-3', status: 'dead', isBreeder: true },
    ],
    [
      {
        type: 'purchase',
        animalIds: ['animal-1', 'animal-2'],
        amount: 2000,
      },
      {
        type: 'sale',
        animalIds: ['animal-2'],
        amount: 1500,
      },
      {
        type: 'vaccination',
        animalIds: ['animal-1', 'animal-3'],
        amount: 100,
      },
      {
        type: 'breeding',
        animalId: 'animal-1',
        partnerAnimalId: 'animal-3',
        amount: 50,
      },
      {
        type: 'feed_cost',
        scope: 'herd',
        animalIds: [],
        amount: 300,
      },
      {
        type: 'other_income',
        scope: 'herd',
        animalIds: [],
        amount: 200,
      },
    ],
  )

  assert.deepEqual(summary.animalStatusCounts, {
    total: 3,
    active: 1,
    sold: 1,
    dead: 1,
    breeders: 2,
  })
  assert.deepEqual(summary.financials, {
    incomeTotal: 1700,
    purchaseTotal: 2000,
    salesTotal: 1500,
    recordedCosts: 2450,
    recordedBalance: -750,
  })
})
