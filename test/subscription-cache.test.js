import test from 'node:test'
import assert from 'node:assert/strict'
import {
  clearCachedSubscription,
  readCachedSubscription,
  writeCachedSubscription,
} from '../src/utils/subscription-cache.js'

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
      values.set(key, value)
    },
  }
}

test('caches and restores the last subscription for the same user', () => {
  const storage = createMemoryStorage()
  const cachedAt = Date.parse('2026-05-01T12:00:00.000Z')

  writeCachedSubscription({
    uid: 'user-1',
    plan: 'monthly',
    status: 'active',
  }, storage, cachedAt)

  assert.deepEqual(readCachedSubscription('user-1', storage, cachedAt + 1000), {
    uid: 'user-1',
    plan: 'monthly',
    status: 'active',
    stripeCustomerId: '',
    stripeSubscriptionId: '',
    currentPeriodEnd: null,
  })
})

test('does not restore a cached subscription for a different user', () => {
  const storage = createMemoryStorage()
  const cachedAt = Date.parse('2026-05-01T12:00:00.000Z')

  writeCachedSubscription({
    uid: 'user-1',
    plan: 'monthly',
    status: 'active',
  }, storage, cachedAt)

  assert.equal(readCachedSubscription('user-2', storage, cachedAt + 1000), null)
})

test('does not restore cached subscriptions older than 7 days', () => {
  const storage = createMemoryStorage()
  const cachedAt = Date.parse('2026-05-01T12:00:00.000Z')

  writeCachedSubscription({
    uid: 'user-1',
    plan: 'monthly',
    status: 'active',
  }, storage, cachedAt)

  assert.equal(readCachedSubscription('user-1', storage, cachedAt + 8 * 24 * 60 * 60 * 1000), null)
})

test('clears only the matching cached subscription', () => {
  const storage = createMemoryStorage()
  const cachedAt = Date.parse('2026-05-01T12:00:00.000Z')

  writeCachedSubscription({
    uid: 'user-1',
    plan: 'monthly',
    status: 'active',
  }, storage, cachedAt)

  clearCachedSubscription('user-2', storage)
  assert.equal(readCachedSubscription('user-1', storage, cachedAt + 1000)?.status, 'active')

  clearCachedSubscription('user-1', storage)
  assert.equal(readCachedSubscription('user-1', storage, cachedAt + 1000), null)
})
