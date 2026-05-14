# BreedZ Next Additions Roadmap

## Goal

This roadmap lists the next necessary additions for BreedZ after the current MVP foundation.

BreedZ already has a strong base for offline animal records, breeding history, lineage, multi-animal events, purchases, sales, deaths, expected birth events, backups, SSR public pages, and PWA offline launch. The next work should focus on turning those records into dependable farm workflows without making the UI heavy.

## Product Priorities

Recommended order:

1. Account-linked cloud sync and backup
2. Breeding lifecycle workflows
3. Smarter breeding date assistance
4. Reminders and notifications
5. Farm or herd grouping
6. Structured health records
7. Better animal identity and data integrity
8. Deeper financial records

The first four items are the most important for a breeding-focused farm app. The others become more important as BreedZ grows from herd recordkeeping into broader farm management.

## 1. Account-Linked Cloud Sync And Backup

### Why

The app has authentication and premium billing, but farm data is still stored locally in IndexedDB. A signed-in user should not expect their herd to disappear when they switch devices, lose a phone, clear browser data, or reinstall the PWA.

### First Version

- Keep IndexedDB as the fast offline-first source of truth.
- Add a Firestore-backed sync layer for signed-in users.
- Sync `animals` and `events` first.
- Keep manual Excel export/import as a safety fallback.
- Show sync state clearly in the app shell or Settings page.

### Implementation Steps

1. Add cloud document structure:
   - `users/{uid}/animals/{animalId}`
   - `users/{uid}/events/{eventId}`
   - optional `users/{uid}/syncState/meta`

2. Add sync metadata locally:
   - `dirty`
   - `deleted`
   - `lastSyncedAt`
   - `cloudUpdatedAt`
   - `syncError`

3. Update local write paths:
   - create animal
   - update animal
   - delete animal
   - create event
   - update event
   - delete event
   - purchase event transaction

4. Build a sync service:
   - push dirty local records when online
   - pull cloud records after sign-in
   - merge records by `updatedAt`
   - keep deleted records as tombstones until synced

5. Add conflict behavior:
   - last-write-wins for the first version
   - preserve local backup export before any destructive cloud import
   - log unresolved conflicts for later tooling

6. Add UI states:
   - signed out: local-only mode
   - signed in and synced
   - syncing
   - offline changes pending
   - sync failed

7. Add tests:
   - local record marked dirty after edit
   - dirty record pushed to cloud
   - cloud record pulled into empty local database
   - local delete syncs as cloud delete or tombstone
   - offline edits retry after network returns

### Later

- Multi-device conflict review screen
- Automatic encrypted backup snapshots
- Restore from cloud backup
- Export before restore

## 2. Breeding Lifecycle Workflows

### Why

BreedZ already records breeding events, partners, expected birth, and births. The next step is to model the real breeding lifecycle: bred, pregnancy checked, expected to calve, calved, open, failed, aborted, weaned.

### First Version

Add workflow events that connect to a breeding record:

- `pregnancy_check`
- `breeding_failed`
- `abortion`
- `weaning`

Keep them as event types first. Avoid building a complicated state machine until actual user behavior proves it is needed.

### Implementation Steps

1. Extend event types:
   - add `pregnancy_check`
   - add `breeding_failed`
   - add `abortion`
   - add `weaning`

2. Add event-specific fields through a generic `details` object:
   - pregnancy check result: `pregnant`, `open`, `unknown`
   - method: `palpation`, `ultrasound`, `blood_test`, `visual`, `other`
   - linked breeding event id
   - linked expected birth event id

3. Update event normalization and backup:
   - persist `details`
   - validate known detail fields
   - preserve unknown detail fields for forward compatibility

4. Add UI flows:
   - from a breeding event detail page, add pregnancy check
   - from expected birth, record calving or failed outcome
   - from animal detail, show breeding status summary

5. Add outcome handling:
   - pregnancy check `open` can close or mark the expected birth as not applicable
   - `breeding_failed` can close linked expected birth
   - `abortion` can close linked expected birth
   - birth can complete the breeding cycle

6. Add dashboard sections:
   - pregnancy checks due
   - expected births due soon
   - overdue expected births
   - unresolved breeding records

7. Add tests:
   - pregnancy check links to breeding
   - failed breeding closes expected birth
   - birth completes expected birth workflow
   - dashboard groups due and overdue breeding follow-ups

### Completed Finish Item

- Added a dedicated `weaning` shortcut from birth records and animal detail pages. The event keeps a link back to the birth record when one is available.

### Later

- Rebreeding reminders after failed pregnancy
- Calving difficulty score
- Multiple offspring from one pregnancy
- Weaning groups
- Reproductive performance metrics

## 3. Smarter Breeding Date Assistance

### Why

The app currently lets users manually add expected birth dates. The README already describes a stronger version: suggest expected birth dates from species gestation rules.

### First Version

When saving a breeding event, suggest a default expected birth date if the female animal's species is known.

Status: complete for this pass.

Completed:
- species-based expected birth suggestions in `EventFormDialog`
- manual expected birth date override protection
- guided birth dialog used for both standalone birth events and expected birth outcomes
- expected birth outcome flow that resolves the expected birth when birth is recorded
- newborn animal creation from a birth event
- existing offspring linking from a birth event
- editable dam and sire pickers with sex filtering
- parent links and empty birth dates updated for existing offspring selected in a birth event
- standalone birth events allowed without a linked breeding event

### Implementation Steps

1. Add gestation rules:
   - cattle: 283 days
   - sheep: 147 days
   - goat: 150 days
   - pig: 114 days
   - horse: 340 days
   - fallback: no automatic date

2. Add a utility:
   - `getGestationDaysForSpecies(species)`
   - `buildExpectedBirthDate(breedingDate, species)`

3. Update `EventFormDialog`:
   - when type is `breeding`, detect female animal in the pair
   - prefill expected birth date when toggle is enabled
   - update suggestion if breeding date changes
   - keep user edits if the user manually changes the date

4. Add copy:
   - "Suggested from species gestation average"
   - "Adjust if your herd uses a different estimate"

5. Add tests:
   - cattle breeding date plus 283 days
   - unknown species does not suggest a date
   - manual edit is preserved after suggestion

### Later

- User-configurable gestation defaults
- Calving window instead of single date
- Breed-specific gestation adjustments
- Public gestation calculator page connected to the app
- Multiple-offspring polish, such as twin-specific labels and clearer counts
- Birth outcome review screen before save for larger births
- Reproductive performance metrics such as conception rate, birth rate, and days open

## 4. Reminders And Notifications

### Why

Dashboard reminders are useful when the user opens the app, but farm work often needs alerts before the user remembers to check. A PWA should make upcoming breeding and health tasks harder to miss.

### First Version

Start with in-app reminder preferences and PWA notification support for expected births and pending confirmations.

### Implementation Steps

1. Add reminder preferences:
   - reminders enabled
   - days before expected birth
   - days before scheduled event
   - quiet mode toggle

2. Add reminder calculation utilities:
   - due today
   - due soon
   - overdue
   - needs confirmation

3. Add Settings UI:
   - enable reminders
   - request notification permission
   - show current browser permission state

4. Add service worker notification support:
   - receive scheduled reminder messages
   - show notification with event title and date
   - open app to the event detail page

5. Add fallback for browsers without scheduled notifications:
   - show prominent in-app reminders on launch
   - show "notifications unavailable" state

6. Add tests:
   - expected birth due soon calculation
   - overdue expected birth calculation
   - pending event confirmation calculation

### Later

- Cloud scheduled reminders for signed-in users
- Email reminders
- Calendar export
- Per-event reminder override

## 5. Farm, Herd, Lot, And Pasture Grouping

### Why

The current data model has animals and events only. That is clean for MVP, but real operations often need to know where an animal is, which herd it belongs to, or which pasture/lot it moved through.

### First Version

Add lightweight grouping without forcing every user into complex farm setup.

### Implementation Steps

1. Add optional group fields to animals:
   - `farmId`
   - `herdId`
   - `lotId`
   - `pastureId`

2. Add local stores:
   - `farms`
   - `herds`
   - `locations`

3. Add simple Settings or Management screens:
   - create herd
   - create pasture/location
   - rename
   - archive

4. Add animal form fields:
   - herd
   - location

5. Add movement event:
   - `movement`
   - from location
   - to location
   - date
   - affected animal ids

6. Update filters:
   - animals by herd
   - animals by location
   - events by location

7. Add tests:
   - animal can belong to herd/location
   - movement event updates current location
   - archived location remains visible on old events

### Later

- Multi-farm account support
- User roles per farm
- Shared farm access
- Pasture occupancy reports

## 6. Structured Health Records

### Why

`vaccination` and `health_issue` are useful, but notes are not enough for operational health records. Farmers often need product, dosage, withdrawal, vet, and follow-up data.

### First Version

Keep health events simple but add structured details where they matter.

### Implementation Steps

1. Extend `vaccination` event details:
   - product
   - dose
   - route
   - batch/lot number
   - withdrawal end date
   - next dose date

2. Extend `health_issue` event details:
   - condition
   - severity
   - treatment
   - veterinarian
   - follow-up date
   - withdrawal end date

3. Add form sections:
   - show structured health fields only for health event types
   - keep notes available
   - keep all fields optional at first

4. Add dashboard health follow-ups:
   - next dose due
   - health follow-up due
   - withdrawal active

5. Add tests:
   - health details persist
   - backup round-trip preserves details
   - withdrawal active is calculated correctly

### Later

- Medicine inventory
- Treatment protocol templates
- Vet contact records
- Compliance reports

## 7. Animal Identity And Data Integrity

### Why

Animal identity is the foundation of farm records. BreedZ currently supports tag or name, but it should gradually protect users from duplicate or ambiguous records.

### First Version

Improve identifiers and safety without blocking fast entry.

### Implementation Steps

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

3. Add archive behavior:
   - archive animal instead of hard delete
   - keep lineage and historical events intact

4. Update delete flow:
   - explain event and lineage impact
   - prefer archive
   - keep hard delete behind a stronger confirmation

5. Add data integrity checks:
   - no self-parent
   - no impossible lineage cycle
   - parent sex warning
   - birth date before parent birth date warning

6. Add tests:
   - duplicate tag warning
   - archived animal remains in historical event
   - lineage cycle rejected
   - parent birth date warning

### Later

- Animal photos
- Document attachments
- Audit history
- Merge duplicate animals

## 8. Deeper Financial Records

### Why

BreedZ already has event amounts and overview totals. That is useful, but farm finance needs more structure if it becomes a real operations feature.

### First Version

Add better categorization and period reporting while keeping the event-based model.

### Implementation Steps

1. Add app-level currency preference:
   - currency code
   - display style
   - default from locale if not set

2. Add financial details:
   - vendor
   - buyer
   - payment method
   - payment status
   - receipt/reference number

3. Add financial filters:
   - by date range
   - by event type
   - by income/expense
   - by animal/herd/location later

4. Update Overview:
   - current month
   - year to date
   - custom date range
   - income
   - expenses
   - net result

5. Add export improvements:
   - finance-specific sheet
   - totals by category
   - totals by period

6. Add tests:
   - currency formatting
   - date-range financial totals
   - pending events excluded from financial totals
   - export includes financial summary

### Later

- Invoices and receipts
- Profit per animal
- Cost per herd
- Inventory valuation
- Stripe is only for BreedZ subscription billing, not farm finance processing

## Cross-Cutting Requirements

### Clean UI Rules

- Keep the default experience simple.
- Put advanced fields behind expandable sections.
- Prefer event-specific fields over giant universal forms.
- Keep first-run flow focused on adding animals and first breeding/event records.
- Avoid making the app feel like accounting or compliance software unless the user opens those areas.

### Offline-First Rules

- Every core workflow must work offline.
- Offline edits must be visibly queued for sync.
- Manual export must remain available even after cloud sync ships.
- Never require cloud sync to view or edit existing local records.

### Data Safety Rules

- Backup before destructive import or cloud restore.
- Preserve unknown fields in import where possible.
- Keep migration tests for every schema change.
- Prefer soft delete for records referenced by lineage or events.

### Suggested Release Slices

1. Sync foundation:
   - local dirty metadata
   - signed-in cloud backup
   - sync status UI

2. Breeding workflow:
   - pregnancy check
   - failed breeding
   - expected birth completion
   - dashboard follow-ups

3. Smarter dates:
   - gestation rules
   - suggested expected birth dates
   - calving window copy

4. Reminder layer:
   - reminder preferences
   - in-app due/overdue logic
   - notification permission flow

5. Farm operations layer:
   - herds/locations
   - movement events
   - structured health details

6. Hardening:
   - archive instead of delete
   - duplicate detection
   - financial reporting by period
