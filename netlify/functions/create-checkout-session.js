import { getAdminAuth, getSubscriptionDocRef, getUserDocRef } from './_lib/firebase-admin.js'
import { getAppOrigin, getStripeClient, getStripePriceId } from './_lib/stripe.js'

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

async function parseRequestBody(event) {
  if (!event.body) {
    return {}
  }

  try {
    return JSON.parse(event.body)
  } catch {
    throw new Error('Invalid JSON body.')
  }
}

async function getVerifiedUser(event) {
  const idToken = getBearerToken(event)

  if (!idToken) {
    throw new Error('Missing Firebase auth token.')
  }

  return getAdminAuth().verifyIdToken(idToken)
}

async function getOrCreateStripeCustomer(stripe, decodedToken) {
  const userRef = getUserDocRef(decodedToken.uid)
  const userSnapshot = await userRef.get()
  const currentUser = userSnapshot.exists ? userSnapshot.data() : {}

  if (currentUser?.stripeCustomerId) {
    return currentUser.stripeCustomerId
  }

  const customer = await stripe.customers.create({
    email: decodedToken.email || currentUser?.email || undefined,
    metadata: {
      uid: decodedToken.uid,
    },
  })

  await userRef.set(
    {
      email: decodedToken.email || currentUser?.email || '',
      stripeCustomerId: customer.id,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  )

  return customer.id
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' })
  }

  try {
    const { plan } = await parseRequestBody(event)

    if (plan !== 'monthly' && plan !== 'yearly') {
      return json(400, { error: 'Invalid premium plan.' })
    }

    const decodedToken = await getVerifiedUser(event)
    const stripe = getStripeClient()
    const customerId = await getOrCreateStripeCustomer(stripe, decodedToken)
    const appOrigin = getAppOrigin(event)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: decodedToken.uid,
      line_items: [
        {
          price: getStripePriceId(plan),
          quantity: 1,
        },
      ],
      success_url: `${appOrigin}/account?checkout=success`,
      cancel_url: `${appOrigin}/account?checkout=cancelled`,
      metadata: {
        uid: decodedToken.uid,
        plan,
      },
      subscription_data: {
        metadata: {
          uid: decodedToken.uid,
          plan,
        },
      },
      allow_promotion_codes: true,
    })

    await getSubscriptionDocRef(decodedToken.uid).set(
      {
        uid: decodedToken.uid,
        plan,
        status: 'pending',
        stripeCustomerId: customerId,
        stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    )

    return json(200, {
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    return json(400, {
      error: error instanceof Error ? error.message : 'Failed to create checkout session.',
    })
  }
}
