import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveStatusAfterEvent, resolveStatusFromTimeline } from '../src/utils/event-status.js'

test('marks the animal as dead for death events', () => {
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

test('timeline reconciliation prioritizes death over sale and applies due sale events', () => {
  assert.equal(
    resolveStatusFromTimeline('active', [{ type: 'sale', date: '2026-04-05' }], '2026-04-06'),
    'sold',
  )

  assert.equal(
    resolveStatusFromTimeline(
      'active',
      [
        { type: 'sale', date: '2026-04-05' },
        { type: 'death', date: '2026-04-04' },
      ],
      '2026-04-06',
    ),
    'dead',
  )
})

test('timeline reconciliation does not apply future sale events early', () => {
  assert.equal(
    resolveStatusFromTimeline('active', [{ type: 'sale', date: '2026-04-07' }], '2026-04-06'),
    'active',
  )
})
