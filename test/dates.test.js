import test from 'node:test'
import assert from 'node:assert/strict'
import { setLocale } from '../src/i18n/index.js'
import { formatAgeLabel } from '../src/utils/dates.js'

test('formatAgeLabel returns years for whole-year ages', () => {
  setLocale('en', { persist: false })

  assert.equal(formatAgeLabel('2020-04-03', '2026-04-03'), '6 years old')
})

test('formatAgeLabel returns years and months for mixed ages', () => {
  setLocale('en', { persist: false })

  assert.equal(formatAgeLabel('2024-02-03', '2026-04-03'), '2 years old, 2 months old')
})

test('formatAgeLabel returns months for animals under one year', () => {
  setLocale('en', { persist: false })

  assert.equal(formatAgeLabel('2025-10-03', '2026-04-03'), '6 months old')
})

test('formatAgeLabel returns empty string for future dates', () => {
  setLocale('en', { persist: false })

  assert.equal(formatAgeLabel('2026-05-01', '2026-04-03'), '')
})
