import { STORE_NAMES, withStore } from './app-db.js'
import {
  getLocalRecordOwnershipState,
  markLocalRecordsKeptOnDeviceForAccount,
  markLocalRecordsOwnedByAccount,
} from './sync-state.js'
import { markRecordDirty, normalizeLocalSyncMetadata } from '../utils/sync-metadata.js'

function isDeletedRecord(record) {
  return Boolean(record?.deletedAt) || normalizeLocalSyncMetadata(record?.sync).deleted === true
}

async function listAllLocalSyncRecords() {
  const [animals, events] = await Promise.all([
    withStore(STORE_NAMES.animals, 'readonly', (store) => store.getAll()),
    withStore(STORE_NAMES.events, 'readonly', (store) => store.getAll()),
  ])

  return {
    animals: animals ?? [],
    events: events ?? [],
  }
}

async function markStoreRecordsDirtyForAccountJoin(storeName, records = []) {
  await withStore(STORE_NAMES[storeName], 'readwrite', (store) => {
    for (const record of records) {
      store.put(markRecordDirty(record, { deleted: isDeletedRecord(record) }))
    }
  })
}

export async function getLocalRecordSyncReadiness(uid) {
  if (!uid) {
    return {
      canSync: false,
      skippedReason: 'signed-out',
      animals: 0,
      events: 0,
      total: 0,
    }
  }

  const [{ animals, events }, ownershipState] = await Promise.all([
    listAllLocalSyncRecords(),
    getLocalRecordOwnershipState(),
  ])
  const total = animals.length + events.length
  const summary = {
    animals: animals.length,
    events: events.length,
    total,
  }

  if (total === 0) {
    return {
      ...summary,
      canSync: true,
      skippedReason: '',
      status: 'empty',
    }
  }

  if (ownershipState.ownerUid === uid) {
    return {
      ...summary,
      canSync: true,
      skippedReason: '',
      status: 'owned-by-current-account',
    }
  }

  if (ownershipState.ownerUid) {
    return {
      ...summary,
      canSync: false,
      skippedReason: 'local-records-owned-by-another-account',
      status: 'owned-by-another-account',
    }
  }

  if (ownershipState.keptOnDeviceForUids.includes(uid)) {
    return {
      ...summary,
      canSync: false,
      skippedReason: 'local-records-kept-on-device',
      status: 'kept-on-device',
    }
  }

  return {
    ...summary,
    canSync: false,
    skippedReason: 'local-records-need-decision',
    status: 'needs-decision',
  }
}

export async function joinLocalRecordsToAccount(uid) {
  if (!uid) {
    throw new Error('A signed-in user is required to join local records.')
  }

  const ownershipState = await getLocalRecordOwnershipState()

  if (ownershipState.ownerUid && ownershipState.ownerUid !== uid) {
    throw new Error('These local records are already connected to another account.')
  }

  const records = await listAllLocalSyncRecords()

  await Promise.all([
    markStoreRecordsDirtyForAccountJoin('animals', records.animals),
    markStoreRecordsDirtyForAccountJoin('events', records.events),
  ])

  return markLocalRecordsOwnedByAccount(uid)
}

export function keepLocalRecordsOnDeviceForAccount(uid) {
  return markLocalRecordsKeptOnDeviceForAccount(uid)
}

export async function markPulledRecordsOwnedByAccount(uid) {
  if (!uid) {
    return null
  }

  return markLocalRecordsOwnedByAccount(uid)
}
