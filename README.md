# BreedZ (breedz)

Offline-first livestock management app

## Install the dependencies

```bash
npm install
```

## Start the app in development mode

```bash
npm run dev
```

## Start the app in SSR development mode

```bash
npm run dev:ssr
```

## Lint the files

```bash
npm run lint
```

## Build the app for production

```bash
npm run build
```

## Build the SSR app for production

```bash
npm run build:ssr
```

## Build the Netlify SSR deploy locally

```bash
npm run build:netlify
```

## Preview the Netlify SSR deploy locally

```bash
npm run dev:netlify
```

## Start the Stripe webhook listener locally

```bash
npm run dev:stripe
```

## Tests

```bash
npm test
```

Current automated coverage is strongest at the pure logic/model layer. We have regression tests for event normalization, backup compatibility, filtering, and status reconciliation, but we do not yet have a dedicated IndexedDB test harness for service-level transaction simulation.

## SSR + PWA Migration Review

This is a repo-specific review of what would change if BreedZ moves from the current static PWA build to Quasar `SSR + PWA`.

### Current state

- The repo now has a Netlify-ready SSR build via `npm run build:netlify`.
- `netlify.toml` is now configured to publish `dist/ssr/client` and route page requests through a dedicated SSR function.
- Public SEO pages are now truly server-rendered in the SSR path instead of relying only on head-tag rewriting.
- Existing installed users should keep the same installed app identity only if the origin, manifest identity, and app scope stay stable during the migration.

### Progress so far

- [x] Step 1: Public SEO pages now use a dedicated `PublicLayout` instead of the app shell.
- [x] Step 2: The main router is SSR-safe and no longer relies on browser globals on the server path.
- [x] Step 3 local prep: Quasar SSR mode has been added and `src-ssr/` is now present.
- [x] Step 4 local prep: Quasar `SSR + PWA` takeover is enabled in `quasar.config.js`.
- [x] Local SSR commands are available:
  - `npm run dev:ssr`
  - `npm run build:ssr`
- [x] Browser-only boot files are marked `server: false` so they do not run during server render.
- [x] `npm run build:ssr` completes successfully and outputs `dist/ssr`.
- [x] SSR builds are now configured for PWA client takeover (`ssr.pwa: true`).
- [x] Local Netlify hosting config now targets the SSR build.
  - `netlify.toml` now publishes `dist/ssr/client`.
  - Netlify rewrites page requests into a dedicated SSR function while keeping `/.netlify/functions/*` available for Stripe/API routes.
  - The Quasar SSR server can still run as a normal Node server outside Netlify, and switches to serverless handler mode only for the Netlify wrapper.

### What should be safe for existing installed users

- Switching to `SSR + PWA` should not create a second app install by itself if `breedz.app` stays the same origin and the web app manifest keeps the same identity.
- Users will still update through the service worker lifecycle, not through a native app-store style reinstall.
- This repo already shows an update prompt when a new service worker is ready, so users are not forced into a silent reload.

### Main migration findings for this repo

- Hosting config is now prepared for Netlify SSR.
  - `netlify.toml` points at `dist/ssr/client` for static assets.
  - A new `netlify/functions/ssr.mjs` wrapper loads the built Quasar SSR server as a Netlify function.
  - Catch-all page requests are rewritten to the SSR function, while existing `/.netlify/functions/*` endpoints remain available.
- SSR scaffolding is now in place locally.
  - `src-ssr/server.js` and `src-ssr/middlewares/render.js` are present.
  - Enabling `ssr.pwa: true` is still deferred until the runtime/deploy target is chosen.
- Router SSR-safety work is in place.
  - The main router no longer relies on browser globals on the server render path.
  - Offline and standalone launch behavior now lives in client-only boot logic instead of the universal router layer.
- Browser-only initialization needs an SSR audit.
  - `src/boot/app-check-init.js` and `src/boot/auth-init.js` run as global boot files.
  - `src/services/firebase.js` already guards App Check and Analytics with `typeof window === 'undefined'`, which is good.
  - Even so, auth and Firestore initialization should be rechecked under SSR so server render does not accidentally depend on browser-only assumptions.
- Public SEO pages are already split from the app shell.
  - Localized public routes now use a dedicated `PublicLayout.vue`.
  - This removes the earlier app-shell coupling that made full prerender and SSR riskier.
- Service worker migration risk looks manageable.
  - `src-pwa/custom-service-worker.js` already accounts for SSR fallback behavior through `process.env.PWA_FALLBACK_HTML`.
  - That is a good sign, but it still needs end-to-end testing after the hosting change.

### Recommended migration order

1. Split public SEO pages from the app shell.
   - Create a dedicated public layout for `/en`, `/pt-br`, `/es`, guides, and legal pages.
   - Keep the offline app shell isolated to the actual app routes.
2. Make the router SSR-safe.
   - Remove or guard all direct `window`, `document`, and `navigator` access on code paths that can run during server render.
3. Prepare SSR mode properly.
   - Add the Quasar SSR server files and verify local SSR builds.
   - Keep the current static deploy untouched until the production SSR hosting target is chosen.
4. Enable `SSR + PWA`.
   - Turn on `ssr.pwa: true` only after the server/runtime path is ready.
5. Keep install identity stable.
   - Do not change origin, manifest identity, or app scope unless intentionally migrating users.
6. Validate service worker takeover and offline fallback.
   - Confirm that SSR first load, cached navigation, offline launch, and update prompts all still behave correctly.

### Local Netlify commands

- `npm run build:netlify`
  - Builds `dist/ssr`, removes any copied `dist/ssr/node_modules`, generates a Netlify-only `dist/netlify-ssr` runtime with `.mjs` server files, and prepares Netlify-safe redirects.
  - Netlify now bundles SSR runtime dependencies only into the `ssr` function instead of attaching the whole `dist/ssr` tree to every function.
- `npm run dev:netlify`
  - Runs a production-like Netlify local preview using `dist/ssr/client` plus Netlify Functions.

### Post-migration checks

- [x] Opening the installed app still launches BreedZ from the same home-screen icon
- [x] Existing installed users receive an update instead of a second install identity
- [x] Public pages return HTML body content from the server, not only client shell markup
- [x] The route guard does not crash on server render
- [x] Service worker update prompt still appears and reload works cleanly
- [x] Offline launch still opens the app shell correctly
- [x] Localized public routes still preserve canonical and `hreflang` behavior
- [x] Public SEO pages no longer inherit unwanted app-shell styling

### Recommendation

- Short term: split public layout from app layout and keep the current PWA deploy stable.
- Medium term: migrate only the public SEO pages to `SSR + PWA` once hosting and SSR-safety are ready.
- Avoid treating this as a one-line config flip. In this repo, the real work is deployment, route/layout separation, and SSR-safe browser API usage.

## MVP Todo

This is the current implementation order for the first working BreedZ MVP.

### 1. App shell and routes

- Keep the landing page at `/`
- Add app routes under `/`
- First routes:
  - `/`
  - `/animals`
  - `/animals/:id`
  - `/events/new`
  - `/settings`

### 2. Data layer

- Add an IndexedDB wrapper for local persistence
- Keep storage access in one service instead of inside components
- Start with two collections:
  - `animals`
  - `events`

### 3. Domain models

- `animal`
  - `id`
  - `tag`
  - `name`
  - `species`
  - `birthDate`
  - `status`
  - `notes`
  - `createdAt`
  - `updatedAt`
- `event`
  - `id`
  - `animalId`
  - `type`
  - `date`
  - `notes`
  - `createdAt`
  - `updatedAt`

### 4. Pinia stores

- Create `useAnimalsStore`
- Create `useEventsStore`
- Add simple derived dashboard data for “today”
- Keep stores talking to the storage service, not directly to IndexedDB APIs

### 5. First working screens

- Dashboard with simple actionable items
- Animals list
- Create animal form
- Edit animal form
- Animal detail page with chronological timeline
- Fast add event flow

### 6. Data safety

- Export all local data as JSON
- Import JSON backup data
- Validate imported structure before saving

### 7. MVP scope guardrails

- No backend
- No authentication
- No sync system
- No charts
- No finance or inventory features
- No multi-farm support

### 8. Recommended implementation order

1. IndexedDB service
2. Animal store
3. Animals list page
4. Create/edit animal form
5. Events store
6. Animal timeline
7. Dashboard
8. JSON export/import

## Next Features

These are the next medium-sized upgrades planned after the current MVP.

### Upcoming Birth Reminders

Goal:
- Surface animals approaching their expected birth window
- Turn breeding records into useful upcoming guidance instead of passive history

Why this matters:
- Users naturally expect help remembering what is coming next, especially around birth and calving windows
- The useful behavior is not "predict the exact day", but "show me which animals are getting close"

Practical first version:
- Start with breeding events only
- After saving a breeding event, offer an optional expected-birth follow-up
- Suggest a default date based on species gestation rules when species is known
- Let the user adjust or skip that date
- Surface those follow-ups in the Dashboard `Upcoming` section and the relevant animal page

Design note:
- Do not treat this as a generic reminder system for every event
- The strongest user value is specifically around breeding -> expected birth timing
- Keep the UX distinct from normal timeline events so it does not look like duplicate records

### Breeding Pair History

Goal:
- Add a real `Breedings` section to the animal page
- Group breeding history by partner animal
- Show offspring connected to each pairing

Why:
- `Linked children` only shows offspring
- breeders also need to see which pairings happened, how often, and when the last breeding occurred

Planned model changes:
- extend `breeding` events with `partnerAnimalId`
- keep offspring derived from lineage:
  - current animal is one parent
  - grouped partner is the other parent

Planned validation rules:
- breeding event cannot point to the same animal twice
- breeding event should only allow opposite-sex animals when sex is known
- breeding event should only allow animals from the same species

Implementation steps:
1. Add `partnerAnimalId` to breeding events in persistence and backup validation
2. Update breeding event forms on:
   - animal page
   - events page
   - dashboard quick add
3. Require partner selection for breeding events
4. Filter partner options by:
   - opposite sex
   - same species
   - active status
5. Add `Breedings` section to animal detail page
6. Group breedings by partner and show:
   - partner name/tag
   - breeding count
   - latest breeding date
   - offspring from that exact pairing
7. Reevaluate whether `Linked children` should stay as a standalone section or become a simpler fallback summary

Tracking checklist:
- [x] Add `partnerAnimalId` to breeding events
- [x] Validate breeding partner rules
- [x] Update all breeding event entry flows
- [x] Add grouped `Breedings` section on animal detail
- [x] Show offspring under each breeding partner
- [x] Decide whether to keep or simplify `Linked children`

### Premium Follow-up

Status:
- The premium foundation is in a good MVP state now.
- What remains is mostly polish, hardening, and lifecycle management.

Not crucial right now:
- [x] Cancel at period end instead of immediate cancellation
- [x] Billing portal / manage subscription page
- [ ] Email verification before starting checkout
- [ ] Anti-abuse on signup
- [x] CAPTCHA
- [x] App Check
- [ ] Rate limiting on serverless functions
- [ ] Webhook event logging / retry diagnostics
- [ ] Better subscription states in UI:
  - `past_due`
  - `canceled`
  - `incomplete`
- [ ] Premium badge / lock hints outside the account page
- [ ] Load premium state into the animals page header more explicitly
- [ ] Tests for the Netlify functions
- [x] Move any remaining real local secrets fully out of tracked `.env`

Important soon:
- [x] Add a customer portal or at least switch unsubscribe to cancel at period end

Why this matters:
- Immediate cancellation is a bit harsh for production billing UX.

Summary:
- Nothing critical is obviously missing for a first premium rollout.
- The main remaining work is reliability, billing UX polish, and abuse protection.

### Animal Weight Snapshot

Goal:
- Add an optional `weight` field to the animal model for current/manual weight tracking.

Why:
- Weight is useful basic herd data even before full weight-history features exist.
- It can support sale context, management decisions, and future reporting.

Suggested first scope:
- [x] Add optional `weight` to the animal form
- [x] Persist `weight` in local storage and backup/import flows
- [x] Show `weight` on animal detail
- [ ] Reevaluate later whether we also want `weightUpdatedAt` or weight history/events

### Spanish Rollout

Goal:
- Add Spanish support in a deliberate way, with natural copy for farmers and breeders instead of literal or robotic translation.

Approach:
1. Translate the public marketing pages first
2. Translate the in-app experience second
3. Review terminology carefully before shipping each batch

Phase 1: Public pages
- [x] Add `es` to the locale system
- [x] Translate landing page copy
- [x] Translate guide page copy
- [x] Translate legal and contact pages:
  - about
  - contact
  - privacy
  - terms
- [x] Add Spanish localized public slugs where appropriate
- [x] Update sitemap and static public page generation
- [x] Verify canonicals and `hreflang` tags

Phase 2: App UI
- [x] Translate dashboard
- [x] Translate animals flow
- [x] Translate events flow
- [x] Translate settings
- [x] Translate account and premium flow
- [x] Translate premium reminders and billing states
- [x] Review button labels, empty states, and warnings for natural Spanish wording

Quality checks:
- [x] Review livestock terminology for Spanish-speaking users
- [x] Avoid literal Portuguese-to-Spanish carryover
- [x] Test locale switching across public and app routes
- [x] Validate mobile layout with longer Spanish strings
- [ ] Recheck SEO snippets after deploy

Guiding rule:
- Spanish support should ship in steps, but each completed step should feel native enough to be user-facing.

### SEO Guides Roadmap

Goal:
- Build a cattle-first content cluster that compounds search traffic around real breeding and recordkeeping problems.
- Keep guides practical and tied to actual BreedZ workflows instead of publishing generic filler.

Why:
- Cattle-related search demand is stronger than broader livestock terms.
- BreedZ already has credible product depth in:
  - breeding dates
  - lineage
  - offspring tracking
  - offline field use
  - record organization

Content rules:
- Start with cattle queries first
- Focus on high-intent operational searches, not vague educational topics
- Each guide should:
  - open with a real farm problem
  - give a practical process
  - naturally connect to BreedZ
  - end with a soft CTA
- Avoid:
  - thin pages
  - repetitive variants of the same guide
  - generic AI-style writing

Current live guides:
- [x] `track-cattle-breeding-dates`
- [x] `how-long-is-cow-pregnancy`
- [x] `how-to-track-cattle-lineage`
- [x] `best-cattle-record-keeping-methods`
- [x] `lost-breeding-records-what-to-do`

Cluster 1: Breeding tracking
- [x] `how-long-is-cow-pregnancy`
- [ ] `cattle-gestation-calculator`
- [ ] `when-will-my-cow-calve`
- [ ] `how-to-avoid-missing-calving-dates`
- [ ] `signs-cow-is-ready-to-calve`

Cluster 2: Lineage and record keeping
- [ ] `how-to-track-cattle-pedigree`
- [x] `best-cattle-record-keeping-methods`
- [ ] `cattle-record-keeping-system`
- [ ] `herd-management-spreadsheet-vs-app`
- [ ] `best-way-to-track-cattle-records`

Cluster 3: Offline farm reality
- [ ] `cattle-app-offline`
- [ ] `farm-management-app-without-internet`
- [ ] `how-to-manage-cattle-without-internet`
- [ ] `best-offline-farm-apps`

Cluster 4: Pain-driven searches
- [x] `lost-breeding-records-what-to-do`
- [ ] `forgot-cow-breeding-date`
- [ ] `cattle-record-mistakes`
- [ ] `how-to-fix-messy-herd-records`

Suggested publishing order:
1. `how-long-is-cow-pregnancy`
2. `how-to-avoid-missing-calving-dates`
3. `how-to-track-cattle-pedigree`
4. `best-cattle-record-keeping-methods`
5. `cattle-app-offline`
6. `forgot-cow-breeding-date`

Execution checklist for each new guide:
- [ ] Write the guide in English first
- [ ] Add localized PT-BR and ES versions
- [ ] Add route and localized slugs
- [ ] Add sitemap entries
- [ ] Add static public page generation
- [ ] Add internal links from the landing page or other guides
- [ ] Add a dedicated localized guides hub later (`/en/guides/`, `/pt-br/guias/`, `/es/guias/`) once the guide library is large enough
- [ ] Recheck title, meta description, canonical, and `hreflang`

I18n maintenance TODO:
- [ ] Split the growing `src/i18n/messages.js` into per-locale files before adding many more guide pages.
  - Suggested shape: `src/i18n/messages/en.js`, `pt-BR.js`, `es.js`, plus a small `index.js`.
  - Keep this as a maintenance step, not an urgent blocker for the next guide.

## Configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
