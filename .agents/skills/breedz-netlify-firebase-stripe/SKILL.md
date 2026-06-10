# BreedZ Netlify, Firebase, And Stripe Skill

## When To Use

Use this skill for Netlify Functions, SSR deployment behavior, Firebase Auth/Admin/Firestore, App Check, Stripe checkout, customer portal, webhooks, premium entitlement state, and provider environment variables.

## Key Files

- `netlify.toml`
- `netlify/functions`
- `netlify/functions/_lib/firebase-admin.js`
- `netlify/functions/_lib/stripe.js`
- `src/services/firebase.js`
- `src/services/cloud-sync.js`
- `src/services/sync-scheduler.js`
- `src/utils/subscription.js`
- `src/utils/subscription-cache.js`
- `src/utils/premium-limits.js`
- `quasar.config.js`
- `src-ssr`
- `scripts/prepare-netlify-ssr-runtime.mjs`
- `scripts/prepare-netlify-ssr-redirects.mjs`

## Provider Boundary Rules

- Firebase client config may be public, but service account credentials must stay server-side.
- Firebase Admin code belongs in Netlify Functions or other server-only code.
- Verify Firebase ID tokens for account-specific server actions.
- Keep Stripe secret keys server-side only.
- Keep Stripe webhook signature verification in place.
- Do not trust client-only premium state for server-side decisions.
- Preserve subscription cache behavior for previously signed-in offline users.
- Keep premium sync tied to authenticated account ownership.
- Do not add real provider values to docs, tests, examples, or committed files.

## Environment Notes

Use provider dashboards and Netlify environment variables for real values.

Typical categories:

- Firebase web app config for client boot.
- Firebase Admin credentials for server functions.
- Stripe secret key, price IDs, portal configuration, and webhook secret.
- Public app URL / Netlify URL values used by checkout and redirects.

## CI/CD Notes

GitHub Actions validates the Netlify SSR/PWA build:

- `.github/workflows/ci.yml` runs lint, tests, and `npm run build:netlify` on pull requests and pushes to `main`.

Netlify owns deployment:

- Netlify builds from `main` using Netlify environment variables.
- Do not duplicate production deploys from GitHub Actions while Netlify auto-deploy is enabled.
- Protect `main` in GitHub, require pull requests, and require the `CI / Lint, Test, Build` status check before merge.
- Keep direct pushes to `main` disabled because they can still trigger Netlify before CI finishes.

Keep build-time client config in Netlify:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_FIREBASE_APP_CHECK_SITE_KEY`

Keep server runtime values in Netlify too:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_MONTHLY_PRICE_ID`
- `STRIPE_YEARLY_PRICE_ID`
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

## Validation

For function and subscription changes:

```bash
npm test
npm run build:netlify
```

For local webhook testing:

```bash
npm run dev:netlify
npm run dev:stripe
```
