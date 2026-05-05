import test from 'node:test'
import assert from 'node:assert/strict'
import {
  cachePremiumEntitlement,
  clearCachedPremiumEntitlement,
  createDefaultSubscription,
  isPremiumSubscription,
  readCachedPremiumEntitlement,
} from '../src/utils/subscription.js'

function createMemoryStorage() {
  const values = new Map()

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null
    },
    removeItem(key) {
      values.delete(key)
    },
    setItem(key, value) {
      values.set(key, String(value))
    },
  }
}

test('creates a default free subscription shape', () => {
  assert.deepEqual(createDefaultSubscription('user-1'), {
    uid: 'user-1',
    plan: 'free',
    status: 'inactive',
    stripeCustomerId: '',
    stripeSubscriptionId: '',
    currentPeriodEnd: null,
  })
})

test('recognizes active premium subscriptions only', () => {
  assert.equal(isPremiumSubscription(null), false)
  assert.equal(isPremiumSubscription(createDefaultSubscription('user-1')), false)
  assert.equal(isPremiumSubscription({ plan: 'premium', status: 'active' }), true)
  assert.equal(isPremiumSubscription({ plan: 'premium', status: 'trialing' }), true)
  assert.equal(isPremiumSubscription({ plan: 'premium', status: 'past_due' }), false)
})

test('caches same-user premium entitlement for offline startup', () => {
  const storage = createMemoryStorage()
  const now = Date.parse('2026-05-05T12:00:00.000Z')

  cachePremiumEntitlement(
    {
      uid: 'user-1',
      plan: 'monthly',
      status: 'active',
      currentPeriodEnd: '2026-06-05T12:00:00.000Z',
    },
    { storage, now },
  )

  assert.deepEqual(
    readCachedPremiumEntitlement('user-1', { storage, now: now + 60_000 }),
    {
      ...createDefaultSubscription('user-1'),
      plan: 'monthly',
      status: 'active',
      currentPeriodEnd: '2026-06-05T12:00:00.000Z',
    },
  )
  assert.equal(readCachedPremiumEntitlement('user-2', { storage, now: now + 60_000 }), null)
})

test('does not cache inactive premium entitlement', () => {
  const storage = createMemoryStorage()
  const now = Date.parse('2026-05-05T12:00:00.000Z')

  cachePremiumEntitlement(
    {
      uid: 'user-1',
      plan: 'monthly',
      status: 'canceled',
      currentPeriodEnd: '2026-06-05T12:00:00.000Z',
    },
    { storage, now },
  )

  assert.equal(readCachedPremiumEntitlement('user-1', { storage, now }), null)
})

test('expires cached premium entitlement after period grace', () => {
  const storage = createMemoryStorage()
  const now = Date.parse('2026-05-05T12:00:00.000Z')

  cachePremiumEntitlement(
    {
      uid: 'user-1',
      plan: 'monthly',
      status: 'active',
      currentPeriodEnd: '2026-05-06T12:00:00.000Z',
    },
    { storage, now },
  )

  assert.equal(
    readCachedPremiumEntitlement('user-1', {
      storage,
      now: Date.parse('2026-05-14T12:00:01.000Z'),
    }),
    null,
  )
})

test('clears cached premium entitlement only for matching user', () => {
  const storage = createMemoryStorage()
  const now = Date.parse('2026-05-05T12:00:00.000Z')

  cachePremiumEntitlement(
    {
      uid: 'user-1',
      plan: 'monthly',
      status: 'active',
      currentPeriodEnd: '2026-06-05T12:00:00.000Z',
    },
    { storage, now },
  )

  clearCachedPremiumEntitlement('user-2', { storage })
  assert.notEqual(readCachedPremiumEntitlement('user-1', { storage, now }), null)

  clearCachedPremiumEntitlement('user-1', { storage })
  assert.equal(readCachedPremiumEntitlement('user-1', { storage, now }), null)
})
