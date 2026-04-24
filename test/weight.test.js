import test from 'node:test'
import assert from 'node:assert/strict'
import {
  convertInputWeightToStored,
  convertStoredWeightToUnit,
  formatStoredWeightForDisplay,
} from '../src/utils/weight.js'

test('keeps stored weight in kilograms when kilogram preference is active', () => {
  assert.equal(convertInputWeightToStored('420', 'kg'), '420')
  assert.equal(convertStoredWeightToUnit('420', 'kg'), '420')
})

test('converts pounds to stored kilograms and back for display', () => {
  assert.equal(convertInputWeightToStored('925.9', 'lb'), '420')
  assert.equal(convertStoredWeightToUnit('420', 'lb'), '925.9')
})

test('formats stored weights with the selected unit suffix', () => {
  assert.equal(formatStoredWeightForDisplay('420', 'kg'), '420 kg')
  assert.equal(formatStoredWeightForDisplay('420', 'lb'), '925.9 lb')
})
