# BreedZ

BreedZ is an offline-first livestock management app for cattle breeding records, animal lineage, and day-to-day farm activity.

The app is built with Quasar, Vue, Pinia, IndexedDB, Firebase, Stripe, SSR-ready public pages, and PWA support.

## Current Product Scope

BreedZ currently supports:

- offline animal records
- local PWA launch
- breeding, birth, pregnancy check, failed breeding, abortion, weaning, purchase, sale, death, health, vaccination, income, and expense events
- breeding partner validation
- expected birth suggestions from species gestation averages
- guided birth outcomes with newborn creation and parent linking
- animal lineage and breeding pair history
- dashboard panels for today, upcoming, due, overdue, and unresolved records
- Excel backup/import
- account login
- premium billing through Stripe
- premium cloud sync through Firestore
- EN, PT-BR, and ES public and app copy
- SEO guide pages with localized routes and sitemap entries

## Development

Install dependencies:

```bash
npm install
```

Start the standard development server:

```bash
npm run dev
```

Start PWA development mode:

```bash
npm run dev:pwa
```

Start SSR development mode:

```bash
npm run dev:ssr
```

Run lint:

```bash
npm run lint
```

Run tests:

```bash
npm test
```

Build the standard SPA:

```bash
npm run build
```

Build the PWA:

```bash
npm run build:pwa
```

Build the Netlify SSR deploy:

```bash
npm run build:netlify
```

Preview the Netlify SSR deploy locally:

```bash
npm run dev:netlify
```

Start the Stripe webhook listener locally:

```bash
npm run dev:stripe
```

## CI/CD

GitHub Actions workflows live in [.github/workflows](./.github/workflows):

- `ci.yml` runs on pull requests and pushes to `main`. It installs dependencies, copies `.env.example` to `.env` for placeholder build config, runs lint, runs tests, and builds the Netlify SSR bundle.

Netlify owns deployment for this project:

- Netlify builds from `main` using the environment variables configured in Netlify.
- Do not duplicate Netlify deploys from GitHub Actions unless Netlify auto-deploys are disabled.
- Protect `main` in GitHub, require pull requests, and require the `CI / Lint, Test, Build` status check before merge. That keeps failing CI from reaching the branch Netlify deploys.
- Direct pushes to `main` can still trigger Netlify before CI finishes, so keep direct pushes disabled for the production branch.

Keep Firebase, Stripe, and Firebase Admin values in Netlify environment variables:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
VITE_FIREBASE_APP_CHECK_SITE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_MONTHLY_PRICE_ID
STRIPE_YEARLY_PRICE_ID
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
```

## Architecture Notes

Local data:

- IndexedDB is the fast offline source of truth.
- Animals and events carry sync metadata when cloud sync is enabled.
- Manual backup/import remains available even with cloud sync.

Cloud sync:

- Premium users can sync records through Firestore.
- Local writes are marked dirty and pushed when online.
- Cloud records are pulled into local IndexedDB per account.
- Deletes use tombstones so removals can sync safely.
- Local unowned records are guarded before they are attached to a signed-in account.

SSR and PWA:

- Public pages use a dedicated public layout.
- App routes stay inside the app shell.
- Netlify SSR builds publish `dist/ssr/client` and route page requests through the SSR function.
- Service worker behavior should be checked after deploy changes because installed users update through the PWA lifecycle.

Tests:

- Current automated coverage is strongest at the pure logic/model layer.
- There are tests for event normalization, backup compatibility, filtering, status reconciliation, birth outcomes, lifecycle calculations, sync behavior, and premium limits.
- Browser-level and IndexedDB transaction simulation coverage can still improve.

## AI-First Project Notes

Codex-facing project instructions live in [AGENTS.md](./AGENTS.md). Repo-specific skills live under [.agents/skills](./.agents/skills):

- `$breedz-frontend`: Quasar/Vue UI, app shell, dashboard, forms, public pages, and PWA-facing UI.
- `$breedz-offline-data`: IndexedDB, backup/import, lifecycle rules, lineage, sync metadata, and Firestore sync.
- `$breedz-seo-i18n`: localized public pages, guide routes, sitemap, SEO metadata, and translations.
- `$breedz-netlify-firebase-stripe`: Netlify Functions, SSR deploy behavior, Firebase, Stripe, and premium state.
- `$breedz-roadmap`: product direction, roadmap priorities, landing strategy, and farm workflow scope.
- `$breedz-secrets-hygiene`: environment variables, provider secrets, client/server config boundaries, and leak response.

## Active Product Roadmap

The agent-facing roadmap lives in [AGENTS.md](./AGENTS.md) and [.agents/skills/breedz-roadmap/SKILL.md](./.agents/skills/breedz-roadmap/SKILL.md).

Current priorities:

1. Reminder preferences and dashboard polish
2. Farm, herd, lot, and pasture grouping
3. Structured health records
4. Animal identity and data integrity
5. Deeper financial reporting
6. Continued SEO guide publishing

Recently completed first-version milestones:

- premium cloud sync and backup
- breeding lifecycle workflows
- smarter breeding date assistance

## SEO Guides

Live guide cluster:

- `track-cattle-breeding-dates`
- `how-long-is-cow-pregnancy`
- `cattle-gestation-calculator`
- `how-to-track-cattle-lineage`
- `best-cattle-record-keeping-methods`
- `cattle-breeding-record-keeping-system`
- `breeding-management-app`
- `breeding-records-app`
- `lost-breeding-records-what-to-do`

Next guide priorities:

1. `cattle-record-keeping-system`
2. `animal-lineage-tracking-software`
3. `how-to-track-cattle-pedigree`
4. `how-to-avoid-missing-calving-dates`
5. `cattle-app-offline`
6. `forgot-cow-breeding-date`

Guide checklist:

- write English first
- add PT-BR and ES copy
- add localized routes
- update `public/sitemap.xml`
- add sources when trust matters
- add one related-guide link
- avoid thin duplicate keyword pages

## Operational Notes

Premium:

- Active premium unlocks unlimited animal registration and sync.
- The app keeps a short local subscription cache so premium animal entry still works when a previously signed-in user opens offline.
- The cache expires after 7 days and is cleared when the matching user state is refreshed online.

Reminders:

- Dashboard panels are the current reminder surface.
- Local browser notifications are intentionally deferred because they mostly duplicate dashboard behavior unless the app is already running.
- True push notifications should be treated as a later premium/synced feature with server-side scheduling.

Known follow-ups:

- Split the large `src/i18n/messages.js` into per-locale files.
- Keep the guides hub updated as each page ships.
- Add a guard for exporting empty Excel backups.
- Add more Netlify function tests.

## Configuration

Quasar configuration lives in [quasar.config.js](./quasar.config.js).

Official Quasar config reference: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js
