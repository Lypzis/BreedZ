# Multi-Animal Events Roadmap

## Goal

Evolve the current event system from a single-animal model into a shared event model that can affect multiple animals, while keeping `breeding` as a special case limited to exactly 2 animals.

This should make it possible to register one event for many animals without duplicating records, while keeping the UI and data model understandable.

## Product Decision

We will represent one real-world event as one shared event record.

We will **not** solve this by overloading the Animals page with an "event filter" as the main navigation pattern.

Instead, we will:

- keep the Animals area focused on animals
- keep the Events area focused on events
- add an `EventDetailPage`, similar to `AnimalDetailPage`
- show the list of affected animals inside the event detail page

## Event Model Direction

### New canonical shape

Events should move toward this shape:

```js
{
  id: string,
  animalIds: string[],
  type: 'birth' | 'breeding' | 'sale' | 'vaccination' | 'health_issue' | 'death' | 'custom',
  amount: number | null,
  date: string,
  notes: string,
  createdAt: string,
  updatedAt: string,
}
```

### Transition compatibility

During migration, we may keep legacy compatibility fields temporarily:

- `animalId`
- `partnerAnimalId`

These should be considered transitional, not the long-term source of truth.

Long term, `animalIds` should be the canonical event-to-animal relationship.

## Event Amount Field

Events should gain an optional financial field:

- `amount`

Recommended model:

```js
amount: number | null
```

### Amount meaning

The amount should represent the total value of the event, not a per-animal value.

This keeps the first version simpler, especially for shared events affecting many animals.

If per-animal financial breakdown is needed later, that can be added in a future iteration.

### Currency handling

For now, the model should remain currency-agnostic.

We will:

- not store a currency field yet
- assume the user is working in their own local currency
- format the amount according to the app locale for display purposes

Examples:

- `en`: `1,000.00`
- `pt-BR` / `es`: `1.000,00`

Locale formatting should be treated as presentation behavior, not as an implied stored currency.

### Suggested UI labels

The stored field should stay neutral as `amount`, while UI labels can vary by context:

- `purchase`: price or amount
- `sale`: price or amount
- `vaccination`: cost
- `health_issue`: cost
- `custom`: amount

### Type guidance

- `purchase`: optional but strongly encouraged
- `sale`: optional but strongly encouraged
- `vaccination`: optional
- `health_issue`: optional
- `custom`: optional
- `breeding`: optional
- `birth`: usually hidden or optional
- `death`: optional

## Event Rules By Type

### Purchase

- can affect 1 or more animals
- can include:
  - existing animals already saved in the app
  - newly created animals created during the purchase flow
  - or a mix of both

Purchase is a special event because it may introduce animals into the system for the first time.

For that reason, purchase should not be treated as only a normal "attach existing animals to event" flow.

### Breeding

- must affect exactly 2 animals
- must remain a special case
- both animals must be different
- both animals must be active
- species must match when known
- sexes must be compatible when known

### Birth

- must affect exactly 1 animal

Reason:
- birth belongs to the newborn animal's own timeline
- even when there are twins or multiple offspring, each newborn should have its own birth event

### Sale

- can affect 1 or more animals

### Vaccination

- can affect 1 or more animals

### Health issue

- can affect 1 or more animals

### Death

- can affect 1 or more animals

### Custom

- can affect 1 or more animals

## UX Decision

### Event detail page

We will add an `EventDetailPage`.

It should show:

- event type
- event date
- amount, when present
- notes
- affected animals list
- quick links to each animal
- edit action
- delete action

This keeps the mental model clean:

- `AnimalDetailPage`: everything about one animal
- `EventDetailPage`: everything about one event

### Purchase flow

Purchase should have a dedicated creation flow instead of being forced into the generic event dialog.

Recommended UX:

1. purchase details
2. animals in this purchase
3. review and save

Inside the purchase flow, the user should be able to:

- select existing animals
- create one new animal
- create many new animals
- mix existing and new animals in the same purchase

This is cleaner than overloading the standard event modal with repeated full animal forms.

Implemented entry point:

- `purchase` appears as an event type in the regular Add Event dialog
- selecting `purchase` hands off to a dedicated purchase dialog
- the purchase dialog supports existing animals, newly created animals, or both
- new animals from purchase default to `status: active`
- save uses one IndexedDB transaction across animals and events

### Events list

The Events page should remain the main place to browse event records.

Each list item should eventually link to the new event detail page instead of only exposing inline actions.

The event list copy should adapt from "event for animal" to wording that supports:

- one animal
- multiple animals

### Animal detail page

Animal detail should continue showing related events, but now a single event may be shared with multiple animals.

From the animal timeline, users should be able to open the corresponding `EventDetailPage`.

## Data / Behavior Impact

The current codebase assumes one primary animal per event in many places, so this is a real model migration, not only a form change.

Areas that will need updates include:

- IndexedDB schema and event indexes
- event create / update / delete services
- event backup import / export normalization
- event filtering and search
- event rendering in dashboard, events list, and animal detail
- status sync logic
- breeding history logic
- quick-add event flows
- purchase-with-animal-creation flow
- amount input, validation, storage, and formatting

## Purchase Event Behavior

### Save order

For purchase, we should save in this order:

1. create any new animals first
2. collect all affected animal ids
3. create one shared `purchase` event using those ids

### Atomicity

The ideal implementation is to save purchased animals and the purchase event in one IndexedDB transaction spanning both stores.

This avoids partial states such as:

- animals created but purchase event missing
- purchase event created without all animals saved

### Initial defaults for newly purchased animals

New animals created from purchase should default to:

- `status: active`

Other defaults can follow the current normal animal creation rules unless product requirements later define purchase-specific defaults.

## Status Rules Impact

Today, animal status changes are derived from event types like `sale` and `death`.

After migration:

- a multi-animal `sale` should update the status of all affected animals
- a multi-animal `death` should update the status of all affected animals
- non-status-changing events should leave statuses untouched

This means status logic must move from "one event updates one animal" to "one event may update many animals".

## Recommended Migration Strategy

### Phase 1: Model foundation

- introduce `animalIds` on events
- introduce optional `amount`
- normalize reads so old events still work
- derive `animalIds` from:
  - `[animalId]` for normal legacy events
  - `[animalId, partnerAnimalId]` for breeding legacy events
- keep writes compatible while the UI is still being migrated

### Phase 2: Service layer

- update event service functions to read/write `animalIds`
- update list-by-animal helpers to match events where `animalIds` contains the animal
- update delete and status-sync paths to handle multiple animals

### Phase 3: Forms and validation

- replace single-animal picker with multi-animal selection for eligible event types
- keep breeding with exactly 2 animals and breeding-specific validation
- keep birth constrained to exactly 1 animal
- introduce a dedicated purchase flow for creating one or many animals during purchase
- add optional amount input with locale-aware formatting

### Phase 4: UI rollout

- update Events page item rendering for multiple animals
- add `EventDetailPage`
- link event rows/cards to the event detail page
- update Animal detail event timeline links
- update dashboard event previews
- display event amount where it adds value
- defer purchase entry point and purchase wizard/dialog to a dedicated purchase implementation phase

### Phase 5: Backup and migration safety

- update backup validation/import/export to support `animalIds`
- confirm legacy backups still import correctly
- confirm existing stored data upgrades cleanly

Implemented safety bridge:

- backup validation/import/export now accepts and emits `animalIds` and `amount`
- legacy backup events still normalize from `animalId` and `partnerAnimalId`
- existing IndexedDB event rows are migrated to the canonical event shape before event listing
- migrated stored events populate the `animalIds` multi-entry index, so per-animal queries work with old data after migration
- migration is idempotent: canonical rows are left untouched on later runs

### Phase 6: Cleanup

- remove legacy dependence on `animalId` / `partnerAnimalId` once all consumers are migrated

## Open Design Constraints

These should remain true while implementing:

- one real-world event should be stored once
- Animals pages should not become the main representation of event records
- breeding should not become an unrestricted multi-animal event
- birth should stay single-animal
- purchase should support creating new animals within the same flow
- event detail should become the canonical view for one event

## Suggested First Implementation Slice

The safest first coding slice is:

1. add normalized `animalIds` support in the service/model layer
2. keep the current UI working through compatibility mapping
3. update per-animal queries and status sync
4. then build the new multi-animal event form and event detail page

This minimizes breakage while we migrate the model underneath the current app.

## Future Settings Expansion

As the app grows, the Settings page should evolve beyond backup/import/export utilities.

Recommended future sections:

- `Preferences`
  - date format
  - amount formatting behavior
  - default event behavior
- `Data`
  - import
  - export
  - backup
  - reset / clear local data
- `Billing`
  - current plan
  - manage subscription
- `About`
  - app version
  - privacy
  - terms
  - contact
- `Advanced`
  - migration tools
  - debug utilities

This should be treated as a future UI organization improvement, not a blocker for the multi-animal event work.
