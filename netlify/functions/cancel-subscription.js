import { getAdminAuth, getSubscriptionDocRef } from './_lib/firebase-admin.js'
import { getStripeClient } from './_lib/stripe.js'

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }
}

function getBearerToken(event) {
  const header = event.headers.authorization || event.headers.Authorization || ''

  if (!header.startsWith('Bearer ')) {
    return ''
  }

  return header.slice('Bearer '.length).trim()
}

async function getVerifiedUser(event) {
  const idToken = getBearerToken(event)

  if (!idToken) {
    throw new Error('Missing Firebase auth token.')
  }

  return getAdminAuth().verifyIdToken(idToken)
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' })
  }

  try {
    const decodedToken = await getVerifiedUser(event)
    const subscriptionRef = getSubscriptionDocRef(decodedToken.uid)
    const snapshot = await subscriptionRef.get()

    if (!snapshot.exists) {
      return json(404, { error: 'No subscription found for this account.' })
    }

    const currentSubscription = snapshot.data()
    const stripeSubscriptionId = currentSubscription?.stripeSubscriptionId || ''

    if (!stripeSubscriptionId) {
      return json(400, { error: 'Missing Stripe subscription id.' })
    }

    const stripe = getStripeClient()
    const canceledSubscription = await stripe.subscriptions.cancel(stripeSubscriptionId)

    await subscriptionRef.set(
      {
        status: canceledSubscription.status || 'canceled',
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    )

    return json(200, {
      status: canceledSubscription.status || 'canceled',
    })
  } catch (error) {
    return json(400, {
      error: error instanceof Error ? error.message : 'Failed to cancel subscription.',
    })
  }
}
