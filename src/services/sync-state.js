import { STORE_NAMES, withStore } from './app-db.js'

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function buildAccountSyncStateId(uid) {
  return `account:${uid}`
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
