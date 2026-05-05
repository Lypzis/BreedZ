import { STORE_NAMES, withStore } from './app-db.js'
import { getAccountSyncState, updateAccountSyncCursors } from './sync-state.js'
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

function getMaxCloudUpdatedAt(cloudRecords = []) {
  return cloudRecords
    .map(getCloudUpdatedAt)
    .filter(Boolean)
    .sort()
    .at(-1) ?? ''
}

function compareTimestampValues(leftValue, rightValue) {
  if (!leftValue || !rightValue) {
    return 0
  }

  return String(leftValue).localeCompare(String(rightValue))
}

function didRecordChangeSinceSnapshot(currentRecord, snapshotRecord) {
  return (
    (currentRecord?.updatedAt ?? '') !== (snapshotRecord?.updatedAt ?? '') ||
    (currentRecord?.deletedAt ?? '') !== (snapshotRecord?.deletedAt ?? '')
  )
}

function isCloudRecordAlreadyApplied(localRecord, cloudRecord) {
  const localSync = normalizeLocalSyncMetadata(localRecord?.sync)
  const localCloudUpdatedAt = localSync.cloudUpdatedAt
  const cloudUpdatedAt = getCloudUpdatedAt(cloudRecord)

  return Boolean(
    localCloudUpdatedAt &&
    cloudUpdatedAt &&
    compareTimestampValues(cloudUpdatedAt, localCloudUpdatedAt) <= 0,
  )
}

function isPermissionDeniedError(error) {
  return error?.code === 'permission-denied' ||
    String(error?.message || '').toLowerCase().includes('missing or insufficient permissions')
}

function stripCloudOnlyFields(cloudRecord) {
  const {
    clientUpdatedAt,
    deviceId,
    schemaVersion,
    serverUpdatedAt,
    sync,
    ...localRecord
  } = cloudRecord ?? {}

  void clientUpdatedAt
  void deviceId
  void schemaVersion
  void serverUpdatedAt
  void sync

  return localRecord
}

function markPulledRecordSynced(record, cloudRecord, options = {}) {
  const deleted = Boolean(cloudRecord?.deletedAt)
  const cloudUpdatedAt = getCloudUpdatedAt(cloudRecord)
  const deviceId = cloudRecord?.deviceId ?? options.deviceId ?? ''

  return markRecordSynced(
    {
      ...record,
      deletedAt: cloudRecord?.deletedAt ?? record?.deletedAt ?? null,
      sync: normalizeLocalSyncMetadata(
        {
          dirty: false,
          deleted,
          cloudUpdatedAt,
          deviceId,
        },
        { dirtyIfMissing: false },
      ),
    },
    {
      cloudUpdatedAt,
      deviceId,
      syncedAt: options.syncedAt,
    },
  )
}

function normalizeCloudAnimalForLocal(cloudRecord, options = {}) {
  return markPulledRecordSynced(stripCloudOnlyFields(cloudRecord), cloudRecord, options)
}

function normalizeCloudEventForLocal(cloudRecord, options = {}) {
  const normalizedEvent = normalizeEventRecord(stripCloudOnlyFields(cloudRecord))

  return markPulledRecordSynced(normalizedEvent, cloudRecord, options)
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

async function resolveCloudReaders(options = {}) {
  if (options.listCloudAnimalsChangedSince && options.listCloudEventsChangedSince) {
    return {
      listCloudAnimalsChangedSince: options.listCloudAnimalsChangedSince,
      listCloudEventsChangedSince: options.listCloudEventsChangedSince,
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

async function pullCloudCollection({ cloudRecords, normalizeCloudRecord, storeName, syncedAt }) {
  const result = {
    attempted: cloudRecords.length,
    pulled: 0,
    skipped: 0,
    conflicts: 0,
    failed: 0,
    errors: [],
  }

  for (const cloudRecord of cloudRecords) {
    try {
      if (!cloudRecord?.id) {
        result.skipped += 1
        continue
      }

      const localRecord = await getLocalRecord(storeName, cloudRecord.id)
      const localSync = normalizeLocalSyncMetadata(localRecord?.sync)

      if (localRecord && localSync.dirty) {
        result.skipped += 1
        result.conflicts += 1
        continue
      }

      if (localRecord && isCloudRecordAlreadyApplied(localRecord, cloudRecord)) {
        result.skipped += 1
        continue
      }

      await putLocalRecord(storeName, normalizeCloudRecord(cloudRecord, { syncedAt }))
      result.pulled += 1
    } catch (error) {
      result.failed += 1
      result.errors.push({ collection: storeName, id: cloudRecord?.id ?? '', error })
    }
  }

  return result
}

function combineSyncResults(pushResult, pullResult) {
  return {
    ...pushResult,
    failed: pushResult.failed + pullResult.failed,
    skipped: pushResult.skipped + pullResult.skipped,
    errors: [...pushResult.errors, ...pullResult.errors],
    pulled: pullResult.pulled,
    pullAttempted: pullResult.attempted,
    pullConflicts: pullResult.conflicts,
    pullFailed: pullResult.failed,
    pullSkipped: pullResult.skipped,
    animalCloudCursor: pullResult.animalCloudCursor,
    eventCloudCursor: pullResult.eventCloudCursor,
  }
}

export async function pullCloudSyncRecords(uid, options = {}) {
  if (!uid) {
    throw new Error('A signed-in user is required for cloud sync.')
  }

  const { listCloudAnimalsChangedSince, listCloudEventsChangedSince } = await resolveCloudReaders(options)
  const syncedAt = options.syncedAt ?? new Date().toISOString()
  const syncState = options.skipPullCursor === true
    ? { animalCloudCursor: '', eventCloudCursor: '' }
    : await getAccountSyncState(uid)
  const animalSinceDate = options.animalSinceDate
    ?? options.sinceDate
    ?? syncState.animalCloudCursor
    ?? null
  const eventSinceDate = options.eventSinceDate
    ?? options.sinceDate
    ?? syncState.eventCloudCursor
    ?? null
  const [cloudAnimals, cloudEvents] = await Promise.all([
    listCloudAnimalsChangedSince(uid, animalSinceDate),
    listCloudEventsChangedSince(uid, eventSinceDate),
  ])
  const animalResult = await pullCloudCollection({
    cloudRecords: cloudAnimals ?? [],
    normalizeCloudRecord: normalizeCloudAnimalForLocal,
    storeName: STORE_NAMES.animals,
    syncedAt,
  })
  const eventResult = await pullCloudCollection({
    cloudRecords: cloudEvents ?? [],
    normalizeCloudRecord: normalizeCloudEventForLocal,
    storeName: STORE_NAMES.events,
    syncedAt,
  })
  const animalCloudCursor = animalResult.failed === 0 ? getMaxCloudUpdatedAt(cloudAnimals) : ''
  const eventCloudCursor = eventResult.failed === 0 ? getMaxCloudUpdatedAt(cloudEvents) : ''

  if (options.skipPullCursor !== true && (animalCloudCursor || eventCloudCursor)) {
    await updateAccountSyncCursors(uid, {
      animalCloudCursor,
      eventCloudCursor,
    })
  }

  return {
    attempted: animalResult.attempted + eventResult.attempted,
    pulled: animalResult.pulled + eventResult.pulled,
    skipped: animalResult.skipped + eventResult.skipped,
    conflicts: animalResult.conflicts + eventResult.conflicts,
    failed: animalResult.failed + eventResult.failed,
    errors: [...animalResult.errors, ...eventResult.errors],
    animalCloudCursor,
    eventCloudCursor,
  }
}

export async function syncPremiumRecords(uid, options = {}) {
  const pushResult = await pushPendingSyncRecords(uid, options)

  if (pushResult.failed > 0) {
    return {
      ...pushResult,
      pulled: 0,
      pullAttempted: 0,
      pullConflicts: 0,
      pullFailed: 0,
      pullSkipped: 0,
      animalCloudCursor: '',
      eventCloudCursor: '',
    }
  }

  let pullResult

  try {
    pullResult = await pullCloudSyncRecords(uid, options)
  } catch (error) {
    pullResult = {
      attempted: 0,
      pulled: 0,
      skipped: 0,
      conflicts: 0,
      failed: 1,
      errors: [{ collection: 'cloud-pull', id: '', error }],
      animalCloudCursor: '',
      eventCloudCursor: '',
    }
  }

  return combineSyncResults(pushResult, pullResult)
}
