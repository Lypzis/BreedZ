import Stripe from 'stripe'

function getRequiredEnv(name) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

let stripeClient = null

export function getStripeClient() {
  if (stripeClient) {
    return stripeClient
  }

  stripeClient = new Stripe(getRequiredEnv('STRIPE_SECRET_KEY'))
  return stripeClient
}

export function getStripeWebhookSecret() {
  return getRequiredEnv('STRIPE_WEBHOOK_SECRET')
}

export function getStripePriceId(plan) {
  if (plan === 'monthly') {
    return getRequiredEnv('STRIPE_MONTHLY_PRICE_ID')
  }

  if (plan === 'yearly') {
    return getRequiredEnv('STRIPE_YEARLY_PRICE_ID')
  }

  throw new Error(`Unsupported premium plan: ${plan}`)
}

export function getAppOrigin(event) {
  const forwardedHost = event.headers['x-forwarded-host']
  const forwardedProto = event.headers['x-forwarded-proto'] || 'https'

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }

  if (process.env.URL) {
    return process.env.URL
  }

  return 'http://localhost:8888'
}
