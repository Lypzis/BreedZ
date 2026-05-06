import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createDefaultSubscription,
  isPremiumSubscription,
} from '../src/utils/subscription.js'

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
