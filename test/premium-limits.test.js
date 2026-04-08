import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ANIMAL_LIMIT_REACHED_ERROR,
  FREE_ANIMAL_CAP,
  FREE_ANIMAL_EXTRA_CAP,
  canCreateAnimal,
  getAnimalLimitReminder,
} from '../src/utils/premium-limits.js'

test('allows creating animals until the extra free slot is used', () => {
  assert.equal(canCreateAnimal(0), true)
  assert.equal(canCreateAnimal(FREE_ANIMAL_CAP), true)
  assert.equal(canCreateAnimal(FREE_ANIMAL_EXTRA_CAP - 1), true)
  assert.equal(canCreateAnimal(FREE_ANIMAL_EXTRA_CAP), false)
})

test('premium users bypass the animal cap entirely', () => {
  assert.equal(canCreateAnimal(FREE_ANIMAL_EXTRA_CAP, { isPremium: true }), true)
  assert.equal(canCreateAnimal(999, { isPremium: true }), true)
})

test('returns reminders only on the premium trigger thresholds', () => {
  assert.equal(getAnimalLimitReminder(14), null)
  assert.equal(getAnimalLimitReminder(15)?.messageKey, 'animals.premiumReminder15')
  assert.equal(getAnimalLimitReminder(18)?.messageKey, 'animals.premiumReminder18')
  assert.equal(getAnimalLimitReminder(20)?.messageKey, 'animals.premiumReminder20')
  assert.equal(getAnimalLimitReminder(21)?.messageKey, 'animals.premiumReminder21')
  assert.equal(getAnimalLimitReminder(22), null)
})

test('premium users do not receive limit reminders', () => {
  assert.equal(getAnimalLimitReminder(15, { isPremium: true }), null)
  assert.equal(getAnimalLimitReminder(18, { isPremium: true }), null)
  assert.equal(getAnimalLimitReminder(21, { isPremium: true }), null)
})

test('keeps the shared limit error constant stable', () => {
  assert.equal(ANIMAL_LIMIT_REACHED_ERROR, 'ANIMAL_LIMIT_REACHED')
})
