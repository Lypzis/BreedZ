# BreedZ Offline Data Skill

## When To Use

Use this skill for IndexedDB, animal/event data shapes, backup/import, lifecycle calculations, lineage, premium sync metadata, tombstones, ownership guards, Firestore sync, and offline behavior.

## Core Rules

- IndexedDB is the fast local source of truth.
- Core record keeping must work offline.
- Cloud sync is premium and additive, never required for local use.
- Manual backup/import must remain available as a recovery path.
- Local writes should be marked dirty when they need cloud sync.
- Synced deletes should use tombstones so devices can converge safely.
- Local unowned records must be guarded before attaching them to a signed-in account.
- Preserve unknown/imported fields where compatibility requires it.
- Treat data-shape changes as migration, backup, import, and test work.

## Key Files

- `src/services/app-db.js`
- `src/services/animals-db.js`
- `src/services/events-db.js`
- `src/services/birth-events-db.js`
- `src/services/purchase-events-db.js`
- `src/services/backup-service.js`
- `src/services/cloud-sync.js`
- `src/services/sync-scheduler.js`
- `src/services/sync-state.js`
- `src/services/sync-ownership.js`
- `src/services/animal-status-sync.js`
- `src/utils/backup-data.js`
- `src/utils/backup-workbook.js`
- `src/utils/event-records.js`
- `src/utils/event-status.js`
- `src/utils/dashboard-lifecycle.js`
- `src/utils/gestation.js`
- `src/utils/breeding-history.js`
- `src/utils/breeding-partners.js`
- `src/utils/parent-candidates.js`
- `src/utils/sync-metadata.js`
- `test`

## Data Safety Checklist

- Does the change keep old backup files importable?
- Does it preserve exported workbook compatibility where users depend on it?
- Does it require an IndexedDB version or migration?
- Does it keep lineage and parent/offspring links coherent?
- Does it keep event lifecycle resolution coherent?
- Does it mark records dirty or deleted when cloud sync needs to know?
- Does it avoid hard deletes for synced or referenced records?
- Does it have a focused test for the changed data behavior?

## Validation

Run targeted tests for the touched behavior when possible, then broader checks for shared data changes:

```bash
npm test
npm run lint
```
