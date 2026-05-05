import test from 'node:test'
import assert from 'node:assert/strict'

import {
  isRecordDeleted,
  markRecordDeleted,
  markRecordDirty,
  markRecordSynced,
  markRecordSyncError,
  normalizeLocalSyncMetadata,
  stripLocalSyncMetadata,
} from '../src/utils/sync-metadata.js'

test('normalizes missing sync metadata as dirty by default', () => {
  assert.deepEqual(normalizeLocalSyncMetadata(), {
    dirty: true,
    deleted: false,
    lastSyncedAt: '',
    cloudUpdatedAt: '',
    deviceId: '',
    error: '',
    schemaVersion: 1,
  })
})

test('marks records dirty, synced, errored, and deleted', () => {
  const record = {
    id: 'animal-1',
    updatedAt: '2026-05-04T00:00:00.000Z',
    sync: {
      dirty: false,
      deleted: false,
      lastSyncedAt: '2026-05-03T00:00:00.000Z',
      cloudUpdatedAt: '2026-05-03T00:00:00.000Z',
      deviceId: 'device-1',
      error: 'Old error',
    },
  }

  const dirtyRecord = markRecordDirty(record)
  assert.equal(dirtyRecord.sync.dirty, true)
  assert.equal(dirtyRecord.sync.deleted, false)
  assert.equal(dirtyRecord.sync.error, '')

  const syncedRecord = markRecordSynced(dirtyRecord, {
    cloudUpdatedAt: '2026-05-04T01:00:00.000Z',
    deviceId: 'device-2',
    syncedAt: '2026-05-04T01:00:01.000Z',
  })
  assert.equal(syncedRecord.sync.dirty, false)
  assert.equal(syncedRecord.sync.lastSyncedAt, '2026-05-04T01:00:01.000Z')
  assert.equal(syncedRecord.sync.cloudUpdatedAt, '2026-05-04T01:00:00.000Z')
  assert.equal(syncedRecord.sync.deviceId, 'device-2')

  const erroredRecord = markRecordSyncError(syncedRecord, new Error('Network failed'))
  assert.equal(erroredRecord.sync.dirty, true)
  assert.equal(erroredRecord.sync.error, 'Network failed')

  const deletedRecord = markRecordDeleted(record, {
    timestamp: '2026-05-04T02:00:00.000Z',
  })
  assert.equal(deletedRecord.sync.dirty, true)
  assert.equal(deletedRecord.sync.deleted, true)
  assert.equal(deletedRecord.deletedAt, '2026-05-04T02:00:00.000Z')
  assert.equal(deletedRecord.updatedAt, '2026-05-04T02:00:00.000Z')
  assert.equal(isRecordDeleted(deletedRecord), true)
})

test('strips local sync metadata for portable exports', () => {
  assert.deepEqual(
    stripLocalSyncMetadata({
      id: 'event-1',
      type: 'custom',
      sync: {
        dirty: true,
      },
    }),
    {
      id: 'event-1',
      type: 'custom',
    },
  )
})
