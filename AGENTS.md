# AGENTS.md

## Repository Expectations

- This is a Quasar 2 / Vue 3 / Pinia app for `BreedZ`, an offline-first livestock management product.
- Prefer small, focused changes that preserve the app's offline-first behavior and existing module boundaries.
- Use `rg` for searching and read the relevant page, store, service, utility, route, and test before editing.
- Do not commit secrets. Keep real values in local `.env` files, Netlify environment variables, Firebase dashboards, Stripe dashboards, or provider consoles.
- Keep user data safety ahead of polish. Backup/import, IndexedDB migrations, sync metadata, and soft-delete behavior are part of the product contract.
- When changing data shapes, sync, billing, SSR, public routes, SEO, or PWA behavior, update tests and docs where the behavior changes.

## What Is BreedZ?

BreedZ is an offline-first farm management app focused on cattle breeding records, animal lineage, and day-to-day herd operations.

The core product helps farmers:

- register animals and their parent relationships
- track breeding, pregnancy checks, birth, failed breeding, abortion, weaning, purchase, sale, death, health, vaccination, income, and expense events
- understand expected birth dates and unresolved breeding records
- create newborn animals from guided birth outcomes
- view lineage and breeding pair history
- keep records available offline through IndexedDB and PWA support
- export/import Excel backups
- optionally sync premium account data through Firestore

Do not turn BreedZ into a generic SaaS dashboard before the animal record, breeding lifecycle, lineage, and offline workflows are excellent.

## Architecture Overview

```text
Quasar / Vue app
  |
  +-- App shell routes
  |     - dashboard, animals, events, overview, settings, account
  |
  +-- Public routes
  |     - localized landing, guide, legal, and SEO pages
  |
  +-- Pinia stores
  |     - UI-facing state and workflow orchestration
  |
  +-- Services and utilities
  |     - IndexedDB persistence
  |     - backup/import
  |     - lifecycle calculations
  |     - subscription and premium limits
  |     - Firestore sync
  |
  +-- Firebase Auth / App Check
  |
  +-- Netlify Functions
        - Stripe checkout
        - Stripe customer portal
        - Stripe webhook
        - SSR entrypoint
```

Runtime model:

- IndexedDB is the local source of truth for app records.
- Core animal and event workflows must work offline.
- Premium cloud sync pushes/pulls account-owned records to Firestore when online.
- Stripe and Firebase Admin code runs in Netlify Functions, not client components.
- Netlify SSR serves public pages and routes through `netlify/functions/ssr.mjs`.
- PWA/service-worker changes can affect installed users and should be treated carefully.

## Module Responsibilities

- `src/pages`: route-level screens for app workflows and public pages.
- `src/components`: reusable UI pieces; keep heavy workflow rules out of generic components.
- `src/layouts`: app shell and public layout structure.
- `src/stores`: Pinia stores that coordinate UI state, services, and user workflows.
- `src/services`: persistence, sync, Firebase, ownership, backup/import, and database boundaries.
- `src/utils`: pure calculations, normalization, display helpers, premium limits, routing, and SEO helpers.
- `src/i18n`: localized copy and locale selection. Keep EN, PT-BR, and ES aligned when changing user-facing strings.
- `src/router/routes.js`: app, public, localized guide, redirect, and legal routes.
- `src-pwa`: service worker registration and Workbox behavior.
- `netlify/functions`: server-only Stripe, Firebase Admin, and SSR handlers.
- `test`: Node test coverage for pure logic, data compatibility, sync, billing state, routing, and lifecycle rules.
- `.agents/skills`: focused Codex instructions for frontend, offline data, SEO/i18n, provider integrations, roadmap, and secrets work.

## Common Commands

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
npm run dev:pwa
npm run dev:ssr
```

Run checks:

```bash
npm run lint
npm test
```

Build:

```bash
npm run build
npm run build:pwa
npm run build:netlify
```

Netlify and Stripe local flows:

```bash
npm run dev:netlify
npm run dev:stripe
```

## CI/CD

GitHub Actions workflows:

- `.github/workflows/ci.yml`: runs on pull requests and pushes to `main`; installs dependencies, prepares placeholder env from `.env.example`, runs lint, runs tests, and builds the Netlify SSR bundle.

Netlify owns deployment:

- Netlify builds from `main` using Netlify environment variables.
- Do not add a GitHub Actions production deploy workflow while Netlify auto-deploy is enabled.
- Use GitHub branch protection on `main`, require pull requests, and require the `CI / Lint, Test, Build` status check before merge.
- Keep direct pushes to `main` disabled because they can still trigger Netlify before CI finishes.
- Keep Firebase client config, Stripe secrets, and Firebase Admin secrets in Netlify environment variables.

## Important Business Rules

- Core animal, event, lineage, dashboard, backup, and import workflows must remain useful offline.
- Never require cloud sync to view, create, edit, or export local records.
- Premium unlocks unlimited animal registration and cloud sync; do not trust client-only premium state for server-side billing decisions.
- Keep manual Excel backup/import available even when cloud sync exists.
- Preserve local unowned-record guards before attaching records to a signed-in account.
- Use sync metadata and tombstones for synced deletes so multi-device state can converge safely.
- Prefer soft delete or reversible flows for records referenced by events, lineage, or sync history.
- Data-shape changes must consider migrations, backup compatibility, import compatibility, and tests.
- Breeding, pregnancy, birth, abortion, failed-breeding, and weaning events must keep lifecycle links coherent.
- Parent/offspring updates must not silently break lineage.
- Dashboard reminders are the current reminder surface; do not add browser/push notifications without explicit product direction.
- Public pages and guides should support discoverability, but the app product should remain practical and farm-workflow focused.

## UI And Product Direction

- Build a practical cattle-management tool, not a decorative generic SaaS template.
- Keep daily workflows calm, scannable, and mobile-friendly.
- Use event-specific fields instead of a giant universal event form.
- Put advanced fields behind progressive disclosure when possible.
- Make status, sync, limits, and destructive actions explicit.
- Landing and public pages should feel product-led and professional, with real BreedZ screenshots, realistic farm imagery, and readable guide content.
- Avoid UI expansion that does not map to a clear farm workflow.

## SEO And I18n Rules

- Write English guide content first, then keep PT-BR and ES routes/copy aligned.
- When adding or renaming guide pages, update localized routes and `public/sitemap.xml`.
- Use canonical URLs and localized SEO metadata through existing helpers.
- Add sources when trust matters, especially for gestation, animal health, or veterinary-adjacent content.
- Avoid thin duplicate keyword pages. Each guide should answer a distinct search intent.
- If guide content grows substantially, consider splitting large i18n files instead of making `src/i18n/messages.js` harder to maintain.

## Roadmap Snapshot

First-version completed foundations:

- account-linked premium cloud sync and backup
- local sync metadata, dirty-record push, cloud pull, tombstones, and ownership guard
- breeding lifecycle workflows for pregnancy checks, failed breeding, abortion, birth, and weaning
- expected birth records and dashboard lifecycle panels
- guided birth outcomes with newborn creation and parent linking
- species-based expected birth suggestions and cattle gestation support

Current priorities:

1. Reminder preferences and dashboard polish.
2. Farm, herd, lot, and pasture grouping.
3. Structured health records.
4. Animal identity and data integrity.
5. Deeper financial reporting.
6. Continued SEO guide publishing and maintenance.

Planning details live in `.agents/skills/breedz-roadmap/SKILL.md`.

## SEO Strategy Snapshot

Best short-term positioning:

```text
BreedZ is the simple offline-first cattle breeding records app for farmers who need breeding history, expected births, lineage, and daily herd records without turning recordkeeping into office work.
```

Strong content angles:

- breeding workflow pages, not only generic app pages
- offline-first cattle records
- lost or uncertain breeding date recovery
- commercial-intent app pages
- practical Spanish and Portuguese cattle content
- fair spreadsheet-versus-app comparisons

Avoid positioning BreedZ as complete farm management, AI ranch management, farm accounting, pasture mapping, or veterinary compliance software until the product supports those claims.

Detailed SEO guidance lives in `.agents/skills/breedz-seo-i18n/SKILL.md`.

## Things Agents Should Never Change

- Do not commit or print real Firebase keys beyond public client config, Stripe secrets, webhook secrets, service account JSON, Netlify tokens, or customer data.
- Do not put real secret values in README, `AGENTS.md`, `.agents/skills`, tests, screenshots, or examples.
- Do not remove IndexedDB as the local source of truth.
- Do not make cloud sync mandatory for core record keeping.
- Do not remove backup/import as a recovery path.
- Do not bypass premium limits or move billing trust into client-only code.
- Do not weaken Firebase ID token checks, Stripe webhook signature verification, or subscription ownership checks.
- Do not hard-delete synced or lineage-linked records without explicit user approval and migration planning.
- Do not casually change service worker, cache, or PWA update behavior.
- Do not break localized public routes, canonical paths, sitemap entries, or existing guide slugs.
- Do not add major CRM/accounting complexity before the breeding, lineage, reminders, and farm grouping workflows are solid.

## AI-First Repo Skills

Use these repository skills when work matches their scope:

- `$breedz-frontend`: Quasar/Vue pages, components, layouts, app shell, dashboard, forms, and public UI.
- `$breedz-offline-data`: IndexedDB, data shapes, backup/import, lifecycle rules, sync metadata, and Firestore sync.
- `$breedz-seo-i18n`: public pages, guide content, localized routes, sitemap, SEO metadata, and translations.
- `$breedz-netlify-firebase-stripe`: Netlify Functions, SSR deploy behavior, Firebase Auth/Admin/Firestore, Stripe checkout, portal, webhooks, and premium state.
- `$breedz-roadmap`: product planning, roadmap prioritization, landing strategy, SEO strategy, and farm workflow scope.
- `$breedz-secrets-hygiene`: environment variables, provider secrets, client/server config boundaries, and leaked credential response.
