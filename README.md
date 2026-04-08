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

## Start the app in PWA development mode

```bash
npm run dev:pwa
```

## Lint the files

```bash
npm run lint
```

## Build the app for production

```bash
npm run build
```

## Build the PWA for production

```bash
npm run build:pwa
```

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
- [ ] Decide whether to keep or simplify `Linked children`

### Premium Follow-up

Status:
- The premium foundation is in a good MVP state now.
- What remains is mostly polish, hardening, and lifecycle management.

Not crucial right now:
- [x] Cancel at period end instead of immediate cancellation
- [x] Billing portal / manage subscription page
- [ ] Email verification before starting checkout
- [ ] Anti-abuse on signup
- [ ] CAPTCHA
- [ ] App Check
- [ ] Rate limiting on serverless functions
- [ ] Webhook event logging / retry diagnostics
- [ ] Better subscription states in UI:
  - `past_due`
  - `canceled`
  - `incomplete`
- [ ] Premium badge / lock hints outside the account page
- [ ] Load premium state into the animals page header more explicitly
- [ ] Tests for the Netlify functions
- [ ] Move any remaining real local secrets fully out of tracked `.env`

Important soon:
- [x] Add a customer portal or at least switch unsubscribe to cancel at period end

Why this matters:
- Immediate cancellation is a bit harsh for production billing UX.

Summary:
- Nothing critical is obviously missing for a first premium rollout.
- The main remaining work is reliability, billing UX polish, and abuse protection.

### Spanish Rollout

Goal:
- Add Spanish support in a deliberate way, with natural copy for farmers and breeders instead of literal or robotic translation.

Approach:
1. Translate the public marketing pages first
2. Translate the in-app experience second
3. Review terminology carefully before shipping each batch

Phase 1: Public pages
- [ ] Add `es` to the locale system
- [ ] Translate landing page copy
- [ ] Translate guide page copy
- [ ] Translate legal and contact pages:
  - about
  - contact
  - privacy
  - terms
- [ ] Add Spanish localized public slugs where appropriate
- [ ] Update sitemap and static public page generation
- [ ] Verify canonicals and `hreflang` tags

Phase 2: App UI
- [ ] Translate dashboard
- [ ] Translate animals flow
- [ ] Translate events flow
- [ ] Translate settings
- [ ] Translate account and premium flow
- [ ] Translate premium reminders and billing states
- [ ] Review button labels, empty states, and warnings for natural Spanish wording

Quality checks:
- [ ] Review livestock terminology for Spanish-speaking users
- [ ] Avoid literal Portuguese-to-Spanish carryover
- [ ] Test locale switching across public and app routes
- [ ] Validate mobile layout with longer Spanish strings
- [ ] Recheck SEO snippets after deploy

Guiding rule:
- Spanish support should ship in steps, but each completed step should feel native enough to be user-facing.
## Configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
