# BreedZ Product Roadmap

Last updated: 2026-05-19

## Product Direction

BreedZ is an offline-first farm management app focused on breeding records, animal lineage, and clean day-to-day herd operations.

The current app already has the important foundation:

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

The next work should improve farm usefulness without making the app feel heavy.

## Current Priorities

1. Finish reminder preferences inside the dashboard experience.
2. Add farm/herd/location grouping.
3. Add structured health records.
4. Improve animal identity and data integrity.
5. Add deeper financial reporting.
6. Continue SEO guide publishing and maintenance.

Cloud sync and the core breeding lifecycle are now past the first-version milestone. Future work in those areas should be treated as polish or advanced workflow work, not MVP blockers.

## 1. Account-Linked Cloud Sync And Backup

Status: first version complete.

Completed:

- Firestore document structure for account-owned `animals` and `events`
- local sync metadata
- dirty record push
- cloud pull into local IndexedDB
- per-account pull cursor
- tombstones / soft deletes
- sync status in Settings
- offline pending state
- premium wall for cloud sync
- local unowned record detection and account attachment flow
- tests for push, pull, tombstones, failed sync, and account ownership guard

Still Missing:

- conflict review screen for rare multi-device collisions
- explicit restore-from-cloud flow
- automatic backup snapshots
- more detailed sync diagnostics for support

Later:

- encrypted backup snapshots
- multi-user farm/account sharing
- admin tools for sync repair

## 2. Breeding Lifecycle Workflows

Status: first version complete.

Completed:

- `pregnancy_check`
- `breeding_failed`
- `abortion`
- `weaning`
- event `details` normalization and backup compatibility
- linked breeding and expected birth records
- expected birth resolution through birth, failed breeding, or abortion
- dashboard lifecycle sections:
  - pregnancy checks due
  - expected births due soon
  - overdue expected births
  - unresolved breedings
- birth flow that can create newborn animals
- birth flow that can link existing animals as offspring
- editable dam and sire pickers with sex filtering
- parent updates for existing offspring selected in a birth event
- dedicated weaning shortcut from birth records and animal detail

Still Missing:

- multiple-offspring polish, especially clearer twin/group labels
- birth outcome review screen for larger births
- better reproductive performance summaries

Later:

- rebreeding reminders after failed pregnancy
- calving difficulty score
- weaning groups
- conception rate, birth rate, and days-open metrics

## 3. Smarter Breeding Date Assistance

Status: first version complete.

Completed:

- species-based expected birth suggestions
- cattle gestation average support
- manual expected birth override protection
- fallback behavior for unknown/custom species
- public cattle gestation calculator guide
- tests for expected birth date calculation and manual override behavior

Still Missing:

- user-configurable gestation defaults
- calving window display instead of only one date in some app surfaces
- breed-specific gestation adjustments

Later:

- connect the public calculator more directly to app record creation
- custom species gestation settings

## 4. Reminder Preferences And Priority Dashboard

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

Still Missing:

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

## 5. Farm, Herd, Lot, And Pasture Grouping

Status: not started.

Why:

Animals and events work for MVP, but real operations often need location and group context.

First Version:

1. Add lightweight grouping records:
   - herds
   - lots
   - pastures / locations
2. Add optional animal fields:
   - `herdId`
   - `locationId`
3. Add management UI:
   - create
   - rename
   - archive
4. Add animal filters:
   - by herd
   - by location
5. Add movement event:
   - from location
   - to location
   - affected animals
6. Add tests:
   - animal belongs to herd/location
   - movement updates current location
   - archived location remains visible on old events

Later:

- multi-farm account support
- shared farm users and roles
- pasture occupancy reports

## 6. Structured Health Records

Status: not started.

Why:

The app has health-related event types, but notes alone are not enough for useful treatment and withdrawal tracking.

First Version:

1. Add structured vaccination details:
   - product
   - dose
   - route
   - batch / lot number
   - withdrawal end date
   - next dose date
2. Add structured health issue details:
   - condition
   - severity
   - treatment
   - veterinarian
   - follow-up date
   - withdrawal end date
3. Show fields only for health event types.
4. Add dashboard health follow-ups:
   - next dose due
   - health follow-up due
   - withdrawal active
5. Add backup and migration tests.

Later:

- medicine inventory
- treatment protocol templates
- vet contacts
- compliance reports

## 7. Animal Identity And Data Integrity

Status: not started.

Why:

Animal identity is the foundation of every farm record. BreedZ should protect users from duplicate or ambiguous records without slowing down entry.

First Version:

1. Add optional identity fields:
   - official ID
   - secondary tag
   - microchip
   - brand
   - registration number
2. Add soft duplicate warnings:
   - same tag
   - same official ID
   - same name plus birth date
3. Improve archive behavior:
   - prefer archive over destructive delete
   - keep events and lineage intact
4. Add data integrity checks:
   - no self-parent
   - no lineage cycle
   - parent sex warning
   - parent birth date warning
5. Add tests for duplicate warnings and lineage safety.

Later:

- animal photos
- document attachments
- audit history
- merge duplicate animals

## 8. Deeper Financial Records

Status: partially started.

Completed:

- event amounts
- purchase and sale events
- income/expense split in Overview
- net recorded result

Still Missing:

- app-level currency preference
- date-range financial summaries
- current month and year-to-date reporting
- vendor / buyer / payment status
- receipt/reference fields
- finance-specific export sheet

Later:

- profit per animal
- cost per herd/location
- inventory valuation
- invoices and receipts

## 9. SEO And Public Content

Status: active.

Completed Guides:

- `track-cattle-breeding-dates`
- `how-long-is-cow-pregnancy`
- `cattle-gestation-calculator`
- `how-to-track-cattle-lineage`
- `best-cattle-record-keeping-methods`
- `breeding-records-app`
- `lost-breeding-records-what-to-do`

Current SEO Priority:

1. `breeding-management-app`
2. `breeding-record-keeping-app`
3. `cattle-record-keeping-system`
4. `animal-lineage-tracking-software`
5. `how-to-track-cattle-pedigree`
6. `how-to-avoid-missing-calving-dates`
7. `cattle-app-offline`
8. `forgot-cow-breeding-date`

Rules For New Guides:

- write EN first, then PT-BR and ES
- add route and localized slugs
- add sitemap entries
- add source links when the topic needs trust
- add one related-guide link
- avoid splitting near-duplicate keyword pages unless Search Console data justifies it

Maintenance:

- split `src/i18n/messages.js` into per-locale files before adding many more guides
- add a localized guides hub when the guide library is larger

## Cross-Cutting Rules

Clean UI:

- keep the default experience simple
- put advanced fields behind expandable sections
- avoid giant universal forms
- use event-specific fields when the event type needs them

Offline First:

- core workflows must work offline
- never require cloud sync to view or edit local records
- queued sync state must stay visible
- manual backup must remain available

Data Safety:

- prefer soft delete for records referenced by events or lineage
- preserve unknown fields in imports where possible
- add migration tests for schema changes
- backup before destructive restore/import behavior

Release Discipline:

- keep each feature slice small enough to test manually
- add model/service tests for every data-shape change
- avoid major UI expansion without a clear farm workflow behind it
