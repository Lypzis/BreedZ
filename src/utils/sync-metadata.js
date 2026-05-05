export const LOCAL_SYNC_SCHEMA_VERSION = 1

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function normalizeLocalSyncMetadata(sync, options = {}) {
  const dirtyIfMissing = options.dirtyIfMissing !== false

  if (!sync || typeof sync !== 'object' || Array.isArray(sync)) {
    return {
      dirty: dirtyIfMissing,
      deleted: false,
      lastSyncedAt: '',
      cloudUpdatedAt: '',
      deviceId: '',
      error: '',
      schemaVersion: LOCAL_SYNC_SCHEMA_VERSION,
    }
  }

  return {
    dirty: sync.dirty !== false,
    deleted: sync.deleted === true,
    lastSyncedAt: normalizeString(sync.lastSyncedAt),
    cloudUpdatedAt: normalizeString(sync.cloudUpdatedAt),
    deviceId: normalizeString(sync.deviceId),
    error: normalizeString(sync.error),
    schemaVersion: LOCAL_SYNC_SCHEMA_VERSION,
  }
}

export function buildDirtySyncMetadata(sync, options = {}) {
  const normalizedSync = normalizeLocalSyncMetadata(sync)

  return {
    ...normalizedSync,
    dirty: true,
    deleted: options.deleted === true,
    deviceId: normalizeString(options.deviceId) || normalizedSync.deviceId,
    error: '',
  }
}

export function markRecordDirty(record, options = {}) {
  return {
    ...record,
    sync: buildDirtySyncMetadata(record?.sync, options),
  }
}

export function markRecordDeleted(record, options = {}) {
  const timestamp = options.timestamp ?? new Date().toISOString()

  return markRecordDirty(
    {
      ...record,
      deletedAt: record?.deletedAt || timestamp,
      updatedAt: timestamp,
    },
    {
      ...options,
      deleted: true,
    },
  )
}

export function markRecordSynced(record, options = {}) {
  const syncedAt = options.syncedAt ?? new Date().toISOString()
  const normalizedSync = normalizeLocalSyncMetadata(record?.sync)

  return {
    ...record,
    sync: {
      ...normalizedSync,
      dirty: false,
      lastSyncedAt: syncedAt,
      cloudUpdatedAt: normalizeString(options.cloudUpdatedAt) || normalizedSync.cloudUpdatedAt,
      deviceId: normalizeString(options.deviceId) || normalizedSync.deviceId,
      error: '',
      schemaVersion: LOCAL_SYNC_SCHEMA_VERSION,
    },
  }
}

export function markRecordSyncError(record, error) {
  const normalizedSync = normalizeLocalSyncMetadata(record?.sync)
  const message = error instanceof Error ? error.message : String(error || 'Sync failed.')

  return {
    ...record,
    sync: {
      ...normalizedSync,
      dirty: true,
      error: message,
      schemaVersion: LOCAL_SYNC_SCHEMA_VERSION,
    },
  }
}

export function isRecordDeleted(record) {
  return record?.sync?.deleted === true || Boolean(record?.deletedAt)
}

export function stripLocalSyncMetadata(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return record
  }

  const { sync, ...publicRecord } = record
  void sync

  return publicRecord
}

export function stripLocalSyncMetadataFromRecords(records = []) {
  return records.map(stripLocalSyncMetadata)
}
