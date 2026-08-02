import test from 'node:test'
import assert from 'node:assert/strict'

import {
  addDaysToDateString,
  buildGestationWatchWindow,
  buildExpectedBirthDate,
  getGestationDaysForSpecies,
  shouldApplyExpectedBirthSuggestion,
} from '../src/utils/gestation.js'

test('adds custom gestation days without local timezone drift', () => {
  assert.equal(addDaysToDateString('2026-04-01', 283), '2027-01-09')
  assert.equal(addDaysToDateString('2026-02-30', 283), '')
  assert.equal(addDaysToDateString('2026-04-01', Number.NaN), '')
})

test('builds the calculator estimate and seven-day watch window', () => {
  assert.deepEqual(buildGestationWatchWindow('2026-04-01', 283, 7), {
    estimatedDate: '2027-01-09',
    windowStart: '2027-01-02',
    windowEnd: '2027-01-16',
  })
  assert.deepEqual(buildGestationWatchWindow('bad-date', 283, 7), {
    estimatedDate: '',
    windowStart: '',
    windowEnd: '',
  })
})

test('builds cattle expected birth date from the 283 day average', () => {
  assert.equal(buildExpectedBirthDate('2026-04-01', 'Cattle'), '2027-01-09')
})

test('recognizes common species aliases when building expected birth dates', () => {
  assert.equal(getGestationDaysForSpecies('dairy cow'), 283)
  assert.equal(getGestationDaysForSpecies('ovelha'), 147)
  assert.equal(getGestationDaysForSpecies('cabra'), 150)
  assert.equal(getGestationDaysForSpecies('suíno'), 114)
  assert.equal(getGestationDaysForSpecies('égua'), 340)
})

test('does not suggest expected birth dates for unknown species or invalid dates', () => {
  assert.equal(buildExpectedBirthDate('2026-04-01', 'alpaca'), '')
  assert.equal(buildExpectedBirthDate('2026-02-30', 'Cattle'), '')
  assert.equal(buildExpectedBirthDate('', 'Cattle'), '')
})

test('keeps manual expected birth dates after a previous suggestion', () => {
  assert.equal(
    shouldApplyExpectedBirthSuggestion({
      currentDate: '2027-01-15',
      previousSuggestedDate: '2027-01-09',
      isManuallyEdited: true,
    }),
    false,
  )

  assert.equal(
    shouldApplyExpectedBirthSuggestion({
      currentDate: '2027-01-09',
      previousSuggestedDate: '2027-01-09',
      isManuallyEdited: true,
    }),
    true,
  )
})
