import { createDefaultSubscription } from './subscription.js'

const SUBSCRIPTION_CACHE_STORAGE_KEY = 'breedz.subscriptionCache.v1'
const SUBSCRIPTION_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

function getBrowserStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage ?? null
}

function normalizeSubscription(subscription) {
  if (!subscription?.uid) {
    return null
  }

  return {
    ...createDefaultSubscription(subscription.uid),
    ...subscription,
  }
}

function isFreshCache(cachedAt, now = Date.now()) {
  const cachedTime = Date.parse(cachedAt)
  if (!Number.isFinite(cachedTime)) {
    return false
  }

  return now - cachedTime <= SUBSCRIPTION_CACHE_MAX_AGE_MS
}

export function readCachedSubscription(uid, storage = getBrowserStorage(), now = Date.now()) {
  if (!uid || !storage) {
    return null
  }

  try {
    const rawValue = storage.getItem(SUBSCRIPTION_CACHE_STORAGE_KEY)
    if (!rawValue) {
      return null
    }

    const cachedValue = JSON.parse(rawValue)
    if (cachedValue?.uid !== uid) {
      return null
    }

    if (!isFreshCache(cachedValue.cachedAt, now)) {
      clearCachedSubscription(uid, storage)
      return null
    }

    return normalizeSubscription(cachedValue.subscription)
  } catch {
    return null
  }
}

export function writeCachedSubscription(subscription, storage = getBrowserStorage(), now = Date.now()) {
  const normalizedSubscription = normalizeSubscription(subscription)
  if (!normalizedSubscription || !storage) {
    return
  }

  try {
    storage.setItem(
      SUBSCRIPTION_CACHE_STORAGE_KEY,
      JSON.stringify({
        uid: normalizedSubscription.uid,
        cachedAt: new Date(now).toISOString(),
        subscription: normalizedSubscription,
      }),
    )
  } catch {
    // Storage may be unavailable in private browsing or strict browser modes.
  }
}

export function clearCachedSubscription(uid, storage = getBrowserStorage()) {
  if (!storage) {
    return
  }

  try {
    if (!uid) {
      storage.removeItem(SUBSCRIPTION_CACHE_STORAGE_KEY)
      return
    }

    const rawValue = storage.getItem(SUBSCRIPTION_CACHE_STORAGE_KEY)
    if (!rawValue) {
      return
    }

    const cachedValue = JSON.parse(rawValue)
    if (cachedValue?.uid === uid) {
      storage.removeItem(SUBSCRIPTION_CACHE_STORAGE_KEY)
    }
  } catch {
    storage.removeItem(SUBSCRIPTION_CACHE_STORAGE_KEY)
  }
}
