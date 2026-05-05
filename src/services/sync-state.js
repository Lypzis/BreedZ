import { STORE_NAMES, withStore } from './app-db.js'

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function buildAccountSyncStateId(uid) {
  return `account:${uid}`
}

function buildLocalRecordOwnershipStateId() {
  return 'local-record-ownership'
}

function normalizeStringArray(value) {
  return Array.isArray(value)
    ? [...new Set(value.map(normalizeString).filter(Boolean))]
    : []
}

function normalizeAccountSyncState(uid, state = {}) {
  return {
    id: buildAccountSyncStateId(uid),
    uid,
    animalCloudCursor: normalizeString(state.animalCloudCursor),
    eventCloudCursor: normalizeString(state.eventCloudCursor),
    updatedAt: normalizeString(state.updatedAt),
  }
}

function normalizeLocalRecordOwnershipState(state = {}) {
  return {
    id: buildLocalRecordOwnershipStateId(),
    ownerUid: normalizeString(state.ownerUid),
    keptOnDeviceForUids: normalizeStringArray(state.keptOnDeviceForUids),
    updatedAt: normalizeString(state.updatedAt),
  }
}

export async function getAccountSyncState(uid) {
  if (!uid) {
    throw new Error('A signed-in user is required for sync state.')
  }

  const state = await withStore(
    STORE_NAMES.syncState,
    'readonly',
    (store) => store.get(buildAccountSyncStateId(uid)),
  )

  return normalizeAccountSyncState(uid, state)
}

export async function getLocalRecordOwnershipState() {
  const state = await withStore(
    STORE_NAMES.syncState,
    'readonly',
    (store) => store.get(buildLocalRecordOwnershipStateId()),
  )

  return normalizeLocalRecordOwnershipState(state)
}

export async function updateAccountSyncCursors(uid, cursors = {}) {
  if (!uid) {
    throw new Error('A signed-in user is required for sync state.')
  }

  const currentState = await getAccountSyncState(uid)
  const nextState = normalizeAccountSyncState(uid, {
    ...currentState,
    animalCloudCursor: normalizeString(cursors.animalCloudCursor) || currentState.animalCloudCursor,
    eventCloudCursor: normalizeString(cursors.eventCloudCursor) || currentState.eventCloudCursor,
    updatedAt: new Date().toISOString(),
  })

  await withStore(STORE_NAMES.syncState, 'readwrite', (store) => store.put(nextState))

  return nextState
}

export async function markLocalRecordsOwnedByAccount(uid) {
  if (!uid) {
    throw new Error('A signed-in user is required for local record ownership.')
  }

  const currentState = await getLocalRecordOwnershipState()
  const nextState = normalizeLocalRecordOwnershipState({
    ...currentState,
    ownerUid: uid,
    keptOnDeviceForUids: currentState.keptOnDeviceForUids.filter((item) => item !== uid),
    updatedAt: new Date().toISOString(),
  })

  await withStore(STORE_NAMES.syncState, 'readwrite', (store) => store.put(nextState))

  return nextState
}

export async function markLocalRecordsKeptOnDeviceForAccount(uid) {
  if (!uid) {
    throw new Error('A signed-in user is required for local record ownership.')
  }

  const currentState = await getLocalRecordOwnershipState()
  const nextState = normalizeLocalRecordOwnershipState({
    ...currentState,
    keptOnDeviceForUids: [...currentState.keptOnDeviceForUids, uid],
    updatedAt: new Date().toISOString(),
  })

  await withStore(STORE_NAMES.syncState, 'readwrite', (store) => store.put(nextState))

  return nextState
}
