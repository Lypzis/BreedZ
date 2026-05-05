import { STORE_NAMES, withStore } from './app-db.js'
import { normalizeEventRecord } from '../utils/event-records.js'
import {
  markRecordSynced,
  markRecordSyncError,
  normalizeLocalSyncMetadata,
} from '../utils/sync-metadata.js'

function normalizeAnimalForSync(animal) {
  return {
    ...animal,
    sync: normalizeLocalSyncMetadata(animal?.sync),
  }
}

function normalizeEventForSync(event) {
  const normalizedEvent = normalizeEventRecord(event)

  return {
    ...normalizedEvent,
    sync: normalizeLocalSyncMetadata(normalizedEvent.sync),
  }
}

function isPendingSyncRecord(record) {
  return normalizeLocalSyncMetadata(record?.sync).dirty === true
}

function getCloudUpdatedAt(cloudRecord) {
  const value = cloudRecord?.serverUpdatedAt ?? cloudRecord?.cloudUpdatedAt

  if (!value) {
    return ''
  }

  if (typeof value === 'string') {
    return value
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toISOString()
  }

  if (typeof value.toDate === 'function') {
    const date = value.toDate()
    return Number.isNaN(date.getTime()) ? '' : date.toISOString()
  }

  return ''
}

function didRecordChangeSinceSnapshot(currentRecord, snapshotRecord) {
  return (
    (currentRecord?.updatedAt ?? '') !== (snapshotRecord?.updatedAt ?? '') ||
    (currentRecord?.deletedAt ?? '') !== (snapshotRecord?.deletedAt ?? '')
  )
}

function isPermissionDeniedError(error) {
  return error?.code === 'permission-denied' ||
    String(error?.message || '').toLowerCase().includes('missing or insufficient permissions')
}

async function getLocalRecord(storeName, id) {
  if (!id) {
    return null
  }

  return (await withStore(storeName, 'readonly', (store) => store.get(id))) ?? null
}

async function putLocalRecord(storeName, record) {
  await withStore(storeName, 'readwrite', (store) => store.put(record))
}

async function markLocalRecordSynced(storeName, snapshotRecord, options = {}) {
  const currentRecord = await getLocalRecord(storeName, snapshotRecord.id)

  if (!currentRecord) {
    return { skipped: true, reason: 'missing' }
  }

  if (didRecordChangeSinceSnapshot(currentRecord, snapshotRecord)) {
    return { skipped: true, reason: 'changed' }
  }

  await putLocalRecord(
    storeName,
    markRecordSynced(currentRecord, {
      cloudUpdatedAt: getCloudUpdatedAt(options.cloudRecord),
      deviceId: options.deviceId,
      syncedAt: options.syncedAt,
    }),
  )

  return { skipped: false }
}

async function markLocalRecordSyncError(storeName, snapshotRecord, error) {
  const currentRecord = await getLocalRecord(storeName, snapshotRecord.id)

  if (!currentRecord || didRecordChangeSinceSnapshot(currentRecord, snapshotRecord)) {
    return
  }

  await putLocalRecord(storeName, markRecordSyncError(currentRecord, error))
}

async function resolveCloudPushers(options = {}) {
  if (options.pushAnimalToCloud && options.pushEventToCloud) {
    return {
      pushAnimalToCloud: options.pushAnimalToCloud,
      pushEventToCloud: options.pushEventToCloud,
    }
  }

  return import('./cloud-sync.js')
}

export async function listPendingSyncRecords() {
  const [animals, events] = await Promise.all([
    withStore(STORE_NAMES.animals, 'readonly', (store) => store.getAll()),
    withStore(STORE_NAMES.events, 'readonly', (store) => store.getAll()),
  ])

  return {
    animals: (animals ?? []).map(normalizeAnimalForSync).filter(isPendingSyncRecord),
    events: (events ?? []).map(normalizeEventForSync).filter(isPendingSyncRecord),
  }
}

export async function pushPendingSyncRecords(uid, options = {}) {
  if (!uid) {
    throw new Error('A signed-in user is required for cloud sync.')
  }

  const deviceId = options.deviceId ?? ''
  const { pushAnimalToCloud, pushEventToCloud } = await resolveCloudPushers(options)
  const pending = await listPendingSyncRecords()
  const result = {
    attempted: pending.animals.length + pending.events.length,
    pushed: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  }

  for (const animal of pending.animals) {
    try {
      const cloudRecord = await pushAnimalToCloud(uid, animal, deviceId)
      const syncResult = await markLocalRecordSynced(STORE_NAMES.animals, animal, {
        cloudRecord,
        deviceId,
      })

      if (syncResult.skipped) {
        result.skipped += 1
      } else {
        result.pushed += 1
      }
    } catch (error) {
      await markLocalRecordSyncError(STORE_NAMES.animals, animal, error)
      result.failed += 1
      result.errors.push({ collection: STORE_NAMES.animals, id: animal.id, error })

      if (isPermissionDeniedError(error)) {
        return result
      }
    }
  }

  for (const event of pending.events) {
    try {
      const cloudRecord = await pushEventToCloud(uid, event, deviceId)
      const syncResult = await markLocalRecordSynced(STORE_NAMES.events, event, {
        cloudRecord,
        deviceId,
      })

      if (syncResult.skipped) {
        result.skipped += 1
      } else {
        result.pushed += 1
      }
    } catch (error) {
      await markLocalRecordSyncError(STORE_NAMES.events, event, error)
      result.failed += 1
      result.errors.push({ collection: STORE_NAMES.events, id: event.id, error })

      if (isPermissionDeniedError(error)) {
        return result
      }
    }
  }

  return result
}
