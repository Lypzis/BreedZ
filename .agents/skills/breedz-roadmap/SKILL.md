# BreedZ Roadmap Skill

## When To Use

Use this skill for product planning, roadmap prioritization, scope decisions, farm workflow design, landing-page direction, SEO strategy, reminders, grouping, health records, identity, finance, and future premium features.

## Product Direction

BreedZ should stay focused on offline-first livestock management for breeding records, lineage, and clean herd operations.

The next work should improve farm usefulness without making the app feel heavy.

## Current Priorities

1. Reminder preferences and dashboard polish.
2. Farm, herd, lot, and pasture grouping.
3. Structured health records.
4. Animal identity and data integrity.
5. Deeper financial reporting.
6. Continued SEO guide publishing and maintenance.

Cloud sync and core breeding lifecycle are first-version complete. Treat future work there as polish or advanced workflow work unless a bug blocks real users.

## Completed Foundations

BreedZ already has:

- local IndexedDB animal and event records
- PWA offline launch
- account and premium flow
- Firestore sync for premium users
- multi-device pull/push sync
- local ownership guard for account switching
- backup/import fallback
- breeding partner validation
- expected birth records
- pregnancy check, failed breeding, abortion, birth, and weaning lifecycle events
- guided birth outcomes with newborn creation and parent linking
- dashboard lifecycle panels
- localized public pages and guides in EN, PT-BR, and ES

## Roadmap Details

### Account-Linked Cloud Sync And Backup

Status: first version complete.

Completed:

- Firestore document structure for account-owned `animals` and `events`
- local sync metadata
- dirty record push
- cloud pull into local IndexedDB
- per-account pull cursor
- tombstones and soft deletes
- sync status in Settings
- offline pending state
- premium wall for cloud sync
- local unowned record detection and account attachment flow
- tests for push, pull, tombstones, failed sync, and account ownership guard

Still missing:

- conflict review screen for rare multi-device collisions
- explicit restore-from-cloud flow
- automatic backup snapshots
- more detailed sync diagnostics for support

Later:

- encrypted backup snapshots
- multi-user farm/account sharing
- admin tools for sync repair

### Breeding Lifecycle Workflows

Status: first version complete.

Completed:

- `pregnancy_check`
- `breeding_failed`
- `abortion`
- `weaning`
- event `details` normalization and backup compatibility
- linked breeding and expected birth records
- expected birth resolution through birth, failed breeding, or abortion
- dashboard lifecycle sections for pregnancy checks, expected births, overdue expected births, and unresolved breedings
- birth flow that can create newborn animals
- birth flow that can link existing animals as offspring
- editable dam and sire pickers with sex filtering
- parent updates for existing offspring selected in a birth event
- dedicated weaning shortcut from birth records and animal detail

Still missing:

- multiple-offspring polish, especially clearer twin/group labels
- birth outcome review screen for larger births
- better reproductive performance summaries

Later:

- rebreeding reminders after failed pregnancy
- calving difficulty score
- weaning groups
- conception rate, birth rate, and days-open metrics

### Smarter Breeding Date Assistance

Status: first version complete.

Completed:

- species-based expected birth suggestions
- cattle gestation average support
- manual expected birth override protection
- fallback behavior for unknown/custom species
- public cattle gestation calculator guide
- tests for expected birth date calculation and manual override behavior

Still missing:

- user-configurable gestation defaults
- calving window display instead of only one date in some app surfaces
- breed-specific gestation adjustments

Later:

- connect the public calculator more directly to app record creation
- custom species gestation settings

### Reminder Preferences And Priority Dashboard

Status: partially complete.

The dashboard already acts as the first reminder system. It shows due, upcoming, overdue, and unresolved work when the user opens the app.

Completed:

- today events
- upcoming events
- pending confirmation events
- pregnancy checks due
- expected births due soon
- overdue expected births
- unresolved breedings
- dashboard panels ordered by operational priority
- hidden zero-count panels for lower-priority sections

Still missing:

- reminder preferences in Settings
- configurable expected birth window, for example 7, 14, or 21 days
- configurable scheduled event window
- compact launch/banner summary, for example "3 records need attention"
- tests for preference-driven reminder windows

Decision:

- Do not build local browser notifications yet. They add permission friction and mostly duplicate the dashboard because they are only reliable when the app has recently been opened.
- Treat real background push notifications as a later premium/synced feature because they need account identity, device subscriptions, and server-side scheduling.

Later:

- push notifications for signed-in premium users
- email reminders
- calendar export
- per-event reminder overrides

### Farm, Herd, Lot, And Pasture Grouping

Status: not started.

First version:

- add lightweight grouping records for herds, lots, and pastures/locations
- add optional `herdId` and `locationId` animal fields
- add management UI to create, rename, and archive groups
- add animal filters by herd and location
- add a movement event with from-location, to-location, and affected animals
- add tests for current grouping, movement updates, and archived location display on old events

Later:

- multi-farm account support
- shared farm users and roles
- pasture occupancy reports

### Structured Health Records

Status: not started.

First version:

- structured vaccination details: product, dose, route, batch/lot number, withdrawal end date, next dose date
- structured health issue details: condition, severity, treatment, veterinarian, follow-up date, withdrawal end date
- fields only for health event types
- dashboard health follow-ups for next dose, health follow-up, and withdrawal active state
- backup and migration tests

Later:

- medicine inventory
- treatment protocol templates
- vet contacts
- compliance reports

### Animal Identity And Data Integrity

Status: not started.

First version:

- optional identity fields: official ID, secondary tag, microchip, brand, registration number
- soft duplicate warnings for same tag, same official ID, or same name plus birth date
- archive behavior that keeps events and lineage intact
- data integrity checks for self-parent, lineage cycle, parent sex warning, and parent birth date warning
- tests for duplicate warnings and lineage safety

Later:

- animal photos
- document attachments
- audit history
- merge duplicate animals

### Deeper Financial Records

Status: partially started.

Completed:

- event amounts
- purchase and sale events
- income/expense split in Overview
- net recorded result

Still missing:

- app-level currency preference
- date-range financial summaries
- current month and year-to-date reporting
- vendor, buyer, and payment status
- receipt/reference fields
- finance-specific export sheet

Later:

- profit per animal
- cost per herd/location
- inventory valuation
- invoices and receipts

## Cross-Cutting Product Rules

- Keep the default experience simple.
- Hide advanced fields unless they are needed for the current workflow.
- Use event-specific forms and summaries.
- Preserve offline-first behavior.
- Keep backup/import available.
- Add tests for every meaningful data-shape change.
- Avoid major UI expansion without a clear farm workflow.
- Prefer small slices that farmers can immediately understand.

## Landing And Public Page Direction

- Use a product-led, professional style.
- Hero should feel like BreedZ immediately: roughly `75-80svh`, white text over a real farm/cattle background, dark readability overlay, and a hint of the next section.
- Keep the hero message close to: "Track cattle breeding from pairing to birth. Even offline."
- Move primary buttons lower-left and a short trust note lower-right where the layout allows.
- Show the product or realistic BreedZ screenshots early, after the hero rather than inside it on the first pass.
- Keep public copy concrete: breeding records, lineage, offline access, expected births, backup, and sync.
- Avoid generic SaaS claims that could apply to any dashboard.
- Keep guide pages useful, source-aware, and connected to real product strengths.
- Use real BreedZ screenshots or realistic mockups with readable UI. Good first screenshots: dashboard lifecycle panels, animal detail/timeline, birth outcome flow, lineage/parent-offspring view, and sync/settings card.
- Use alternating feature bands for "Inside The App": track each animal, keep lineage linked, follow the breeding cycle, see what needs attention, and back up records.
- Keep problem, what-you-get, how-it-works, offline-first, and free/premium sections visually distinct without making the page feel flashy.
- Do not use Stripe checkout screens as the main premium visual. Premium should feel like unlimited herd records plus sync/backup across devices.

## SEO Planning Link

SEO-specific content strategy lives in `.agents/skills/breedz-seo-i18n/SKILL.md`.
