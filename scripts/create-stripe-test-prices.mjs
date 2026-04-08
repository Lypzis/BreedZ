import Stripe from 'stripe'

function getRequiredEnv(name) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

async function createRecurringPrice(stripe, { name, unitAmount, interval }) {
  const product = await stripe.products.create({
    name,
  })

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: unitAmount,
    currency: 'usd',
    recurring: {
      interval,
    },
  })

  return {
    productId: product.id,
    priceId: price.id,
  }
}

async function main() {
  const stripe = new Stripe(getRequiredEnv('STRIPE_SECRET_KEY'))

  const monthly = await createRecurringPrice(stripe, {
    name: 'BreedZ Premium Monthly (Test)',
    unitAmount: 700,
    interval: 'month',
  })

  const yearly = await createRecurringPrice(stripe, {
    name: 'BreedZ Premium Yearly (Test)',
    unitAmount: 7000,
    interval: 'year',
  })

  console.log('Stripe test prices created successfully:')
  console.log(`Monthly product: ${monthly.productId}`)
  console.log(`Monthly price:   ${monthly.priceId}`)
  console.log(`Yearly product:  ${yearly.productId}`)
  console.log(`Yearly price:    ${yearly.priceId}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
