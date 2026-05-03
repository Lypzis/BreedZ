import test from 'node:test'
import assert from 'node:assert/strict'
import {
  resolveBaseStatus,
  resolveStatusAfterEvent,
  resolveStatusFromTimeline,
} from '../src/utils/event-status.js'

test('marks the animal as dead for confirmed death events dated today or earlier', () => {
  assert.equal(resolveStatusAfterEvent('active', 'death', '2026-04-06'), 'dead')
  assert.equal(resolveStatusAfterEvent('sold', 'death', '2026-04-06'), 'dead')
})

test('keeps the existing status for non-death events', () => {
  assert.equal(resolveStatusAfterEvent('active', 'breeding', '2026-04-06'), 'active')
  assert.equal(resolveStatusAfterEvent('sold', 'vaccination', '2026-04-06'), 'sold')
})

test('marks the animal as sold for sale events dated today or earlier', () => {
  assert.equal(resolveStatusAfterEvent('active', 'sale', '2026-04-06', '2026-04-06'), 'sold')
  assert.equal(resolveStatusAfterEvent('active', 'sale', '2026-04-05', '2026-04-06'), 'sold')
})

test('keeps the animal active for future sale events', () => {
  assert.equal(resolveStatusAfterEvent('active', 'sale', '2026-04-07', '2026-04-06'), 'active')
})

test('does not apply pending sale or death events to animal status', () => {
  assert.equal(resolveStatusAfterEvent('active', 'sale', '2026-04-05', '2026-04-06', 'pending'), 'active')
  assert.equal(resolveStatusAfterEvent('active', 'death', '2026-04-05', '2026-04-06', 'pending'), 'active')
})

test('timeline reconciliation prioritizes death over sale and applies due sale events', () => {
  assert.equal(
    resolveStatusFromTimeline(
      'active',
      [{ type: 'sale', date: '2026-04-05', confirmationStatus: 'confirmed' }],
      '2026-04-06',
    ),
    'sold',
  )

  assert.equal(
    resolveStatusFromTimeline(
      'active',
      [
        { type: 'sale', date: '2026-04-05', confirmationStatus: 'confirmed' },
        { type: 'death', date: '2026-04-04', confirmationStatus: 'confirmed' },
      ],
      '2026-04-06',
    ),
    'dead',
  )
})

test('timeline reconciliation does not apply future sale events early', () => {
  assert.equal(
    resolveStatusFromTimeline(
      'active',
      [{ type: 'sale', date: '2026-04-07', confirmationStatus: 'pending' }],
      '2026-04-06',
    ),
    'active',
  )
})

test('resolves a missing base status back to active when legacy sold status is fully explained by sale events', () => {
  assert.equal(
    resolveBaseStatus(
      '',
      'sold',
      [{ type: 'sale', date: '2026-04-05', confirmationStatus: 'confirmed' }],
      '2026-04-06',
    ),
    'active',
  )
})

test('resolves a missing base status back to active when legacy dead status is fully explained by death events', () => {
  assert.equal(
    resolveBaseStatus(
      '',
      'dead',
      [{ type: 'death', date: '2026-04-05', confirmationStatus: 'confirmed' }],
      '2026-04-06',
    ),
    'active',
  )
})

test('keeps explicit base status when it is already persisted', () => {
  assert.equal(
    resolveBaseStatus(
      'sold',
      'sold',
      [],
      '2026-04-06',
    ),
    'sold',
  )
})
