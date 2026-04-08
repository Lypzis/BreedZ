import { getAdminDb, getSubscriptionDocRef, getUserDocRef } from './_lib/firebase-admin.js'
import { getStripeClient, getStripeWebhookSecret } from './_lib/stripe.js'

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }
}

function getRawBody(event) {
  if (!event.body) {
    return ''
  }

  return event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body
}

function getPlanFromPriceId(priceId) {
  if (priceId === process.env.STRIPE_MONTHLY_PRICE_ID) {
    return 'monthly'
  }

  if (priceId === process.env.STRIPE_YEARLY_PRICE_ID) {
    return 'yearly'
  }

  return 'free'
}

function toIsoDate(seconds) {
  if (!seconds) {
    return null
  }

  return new Date(seconds * 1000).toISOString()
}

async function findSubscriptionUid(stripeSubscription) {
  const metadataUid = stripeSubscription.metadata?.uid

  if (metadataUid) {
    return metadataUid
  }

  const snapshot = await getAdminDb()
    .collection('subscriptions')
    .where('stripeSubscriptionId', '==', stripeSubscription.id)
    .limit(1)
    .get()

  if (snapshot.empty) {
    return ''
  }

  return snapshot.docs[0].id
}

async function syncSubscription(stripeSubscription) {
  const uid = await findSubscriptionUid(stripeSubscription)

  if (!uid) {
    return
  }

  const primaryItem = stripeSubscription.items?.data?.[0]
  const plan = getPlanFromPriceId(primaryItem?.price?.id || '')

  await getSubscriptionDocRef(uid).set(
    {
      uid,
      plan,
      status: stripeSubscription.status || 'inactive',
      stripeCustomerId:
        typeof stripeSubscription.customer === 'string' ? stripeSubscription.customer : '',
      stripeSubscriptionId: stripeSubscription.id,
      currentPeriodEnd: toIsoDate(stripeSubscription.current_period_end),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  )
}

async function handleCheckoutCompleted(session) {
  const uid = session.metadata?.uid || session.client_reference_id || ''

  if (!uid) {
    return
  }

  const userRef = getUserDocRef(uid)
  const subscriptionRef = getSubscriptionDocRef(uid)

  if (session.customer && typeof session.customer === 'string') {
    await userRef.set(
      {
        stripeCustomerId: session.customer,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    )
  }

  if (!session.subscription || typeof session.subscription !== 'string') {
    return
  }

  const existingSnapshot = await subscriptionRef.get()
  const existingData = existingSnapshot.exists ? existingSnapshot.data() : null

  await subscriptionRef.set(
    {
      uid,
      plan: existingData?.plan || session.metadata?.plan || 'free',
      status: existingData?.status || 'pending',
      stripeCustomerId:
        existingData?.stripeCustomerId ||
        (typeof session.customer === 'string' ? session.customer : ''),
      stripeSubscriptionId: existingData?.stripeSubscriptionId || session.subscription,
      currentPeriodEnd: existingData?.currentPeriodEnd || null,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  )
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' })
  }

  try {
    const signature = event.headers['stripe-signature'] || event.headers['Stripe-Signature']

    if (!signature) {
      return json(400, { error: 'Missing Stripe signature.' })
    }

    const stripe = getStripeClient()
    const stripeEvent = stripe.webhooks.constructEvent(
      getRawBody(event),
      signature,
      getStripeWebhookSecret(),
    )

    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripeEvent.data.object)
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncSubscription(stripeEvent.data.object)
        break
      default:
        break
    }

    return json(200, { received: true })
  } catch (error) {
    return json(400, {
      error: error instanceof Error ? error.message : 'Webhook processing failed.',
    })
  }
}
