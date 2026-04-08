import { getAdminAuth, getSubscriptionDocRef, getUserDocRef } from './_lib/firebase-admin.js'
import { getAppOrigin, getStripeClient } from './_lib/stripe.js'

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

async function getStripeCustomerId(uid) {
  const subscriptionSnapshot = await getSubscriptionDocRef(uid).get()
  const userSnapshot = await getUserDocRef(uid).get()

  return (
    subscriptionSnapshot.data()?.stripeCustomerId
    || userSnapshot.data()?.stripeCustomerId
    || ''
  )
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' })
  }

  try {
    const decodedToken = await getVerifiedUser(event)
    const stripeCustomerId = await getStripeCustomerId(decodedToken.uid)

    if (!stripeCustomerId) {
      return json(404, { error: 'No Stripe customer found for this account.' })
    }

    const stripe = getStripeClient()
    const origin = getAppOrigin(event)
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${origin}/account`,
    })

    return json(200, {
      url: portalSession.url,
    })
  } catch (error) {
    return json(400, {
      error: error instanceof Error ? error.message : 'Failed to open customer portal.',
    })
  }
}
