const PREMIUM_ACTIVE_STATUSES = new Set(['active', 'trialing'])
const PREMIUM_ENTITLEMENT_STORAGE_KEY = 'breedz.premiumEntitlement.v1'
const PREMIUM_ENTITLEMENT_FALLBACK_TTL_MS = 7 * 24 * 60 * 60 * 1000
const PREMIUM_ENTITLEMENT_PERIOD_GRACE_MS = 7 * 24 * 60 * 60 * 1000

export function createDefaultSubscription(uid = '') {
  return {
    uid,
    plan: 'free',
    status: 'inactive',
    stripeCustomerId: '',
    stripeSubscriptionId: '',
    currentPeriodEnd: null,
  }
}

export function isPremiumSubscription(subscription) {
  if (!subscription) {
    return false
  }

  return subscription.plan !== 'free' && PREMIUM_ACTIVE_STATUSES.has(subscription.status)
}

function getBrowserStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

function parseDateMs(value) {
  if (!value) {
    return null
  }

  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeCachedEntitlement(value) {
  if (!value || typeof value !== 'object') {
    return null
  }

  const uid = typeof value.uid === 'string' ? value.uid : ''
  const plan = typeof value.plan === 'string' ? value.plan : 'free'
  const status = typeof value.status === 'string' ? value.status : 'inactive'
  const currentPeriodEnd = typeof value.currentPeriodEnd === 'string' ? value.currentPeriodEnd : null
  const cachedAt = typeof value.cachedAt === 'string' ? value.cachedAt : ''

  return {
    uid,
    plan,
    status,
    stripeCustomerId: '',
    stripeSubscriptionId: '',
    currentPeriodEnd,
    cachedAt,
  }
}

function isCachedEntitlementUsable(entitlement, uid, now) {
  if (!entitlement || entitlement.uid !== uid || !isPremiumSubscription(entitlement)) {
    return false
  }

  const cachedAtMs = parseDateMs(entitlement.cachedAt)

  if (!cachedAtMs) {
    return false
  }

  const currentPeriodEndMs = parseDateMs(entitlement.currentPeriodEnd)
  const validUntil = currentPeriodEndMs
    ? currentPeriodEndMs + PREMIUM_ENTITLEMENT_PERIOD_GRACE_MS
    : cachedAtMs + PREMIUM_ENTITLEMENT_FALLBACK_TTL_MS

  return now <= validUntil
}

export function cachePremiumEntitlement(subscription, { storage = getBrowserStorage(), now = Date.now() } = {}) {
  if (!storage || !isPremiumSubscription(subscription) || !subscription.uid) {
    return
  }

  const entitlement = {
    uid: subscription.uid,
    plan: subscription.plan,
    status: subscription.status,
    currentPeriodEnd: typeof subscription.currentPeriodEnd === 'string' ? subscription.currentPeriodEnd : null,
    cachedAt: new Date(now).toISOString(),
  }

  storage.setItem(PREMIUM_ENTITLEMENT_STORAGE_KEY, JSON.stringify(entitlement))
}

export function readCachedPremiumEntitlement(uid, { storage = getBrowserStorage(), now = Date.now() } = {}) {
  if (!storage || !uid) {
    return null
  }

  try {
    const entitlement = normalizeCachedEntitlement(JSON.parse(storage.getItem(PREMIUM_ENTITLEMENT_STORAGE_KEY)))

    if (!isCachedEntitlementUsable(entitlement, uid, now)) {
      return null
    }

    return {
      ...createDefaultSubscription(uid),
      plan: entitlement.plan,
      status: entitlement.status,
      currentPeriodEnd: entitlement.currentPeriodEnd,
    }
  } catch {
    return null
  }
}

export function clearCachedPremiumEntitlement(uid, { storage = getBrowserStorage() } = {}) {
  if (!storage) {
    return
  }

  try {
    const entitlement = normalizeCachedEntitlement(JSON.parse(storage.getItem(PREMIUM_ENTITLEMENT_STORAGE_KEY)))

    if (!uid || entitlement?.uid === uid) {
      storage.removeItem(PREMIUM_ENTITLEMENT_STORAGE_KEY)
    }
  } catch {
    storage.removeItem(PREMIUM_ENTITLEMENT_STORAGE_KEY)
  }
}
