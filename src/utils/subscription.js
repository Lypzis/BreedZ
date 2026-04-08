const PREMIUM_ACTIVE_STATUSES = new Set(['active', 'trialing'])

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
