import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from 'src/services/firebase'
import { normalizeEventRecord } from 'src/utils/event-records'

export const CLOUD_SYNC_SCHEMA_VERSION = 1

const CLOUD_COLLECTIONS = {
  animals: 'animals',
  events: 'events',
}

function assertCloudRecordInput(uid, record, recordType) {
  if (!uid) {
    throw new Error('A signed-in user is required for cloud sync.')
  }

  if (!record?.id) {
    throw new Error(`Cannot sync ${recordType} without an id.`)
  }
}

function removeUndefinedFields(value) {
  if (Array.isArray(value)) {
    return value.map(removeUndefinedFields)
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  const prototype = Object.getPrototypeOf(value)

  if (prototype !== Object.prototype && prototype !== null) {
    return value
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([key, entryValue]) => [key, removeUndefinedFields(entryValue)]),
  )
}

function normalizeSinceDate(value) {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsedDate = new Date(value)
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
  }

  return value
}

function collectionRef(uid, collectionName) {
  return collection(db, 'users', uid, collectionName)
}

function recordRef(uid, collectionName, recordId) {
  return doc(db, 'users', uid, collectionName, recordId)
}

function buildBaseCloudRecord(record, deviceId) {
  const now = new Date().toISOString()

  return removeUndefinedFields({
    ...record,
    sync: undefined,
    deletedAt: record.deletedAt ?? null,
    clientUpdatedAt: record.updatedAt || record.clientUpdatedAt || now,
    serverUpdatedAt: serverTimestamp(),
    deviceId: deviceId || '',
    schemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
  })
}

function cloudSnapshotToRecords(snapshot) {
  return snapshot.docs.map((documentSnapshot) => ({
    id: documentSnapshot.id,
    ...documentSnapshot.data(),
  }))
}

async function listCloudRecordsChangedSince(uid, collectionName, sinceDate) {
  if (!uid) {
    throw new Error('A signed-in user is required for cloud sync.')
  }

  const normalizedSinceDate = normalizeSinceDate(sinceDate)
  const recordsRef = collectionRef(uid, collectionName)
  const recordsQuery = normalizedSinceDate
    ? query(recordsRef, where('serverUpdatedAt', '>', normalizedSinceDate), orderBy('serverUpdatedAt', 'asc'))
    : query(recordsRef, orderBy('serverUpdatedAt', 'asc'))
  const snapshot = await getDocs(recordsQuery)

  return cloudSnapshotToRecords(snapshot)
}

export async function pushAnimalToCloud(uid, animal, deviceId = '') {
  assertCloudRecordInput(uid, animal, 'animal')

  const cloudAnimal = buildBaseCloudRecord(animal, deviceId)
  await setDoc(recordRef(uid, CLOUD_COLLECTIONS.animals, animal.id), cloudAnimal, { merge: true })

  return cloudAnimal
}

export async function pushEventToCloud(uid, event, deviceId = '') {
  assertCloudRecordInput(uid, event, 'event')

  const normalizedEvent = normalizeEventRecord(event)
  const cloudEvent = buildBaseCloudRecord(normalizedEvent, deviceId)
  await setDoc(recordRef(uid, CLOUD_COLLECTIONS.events, normalizedEvent.id), cloudEvent, { merge: true })

  return cloudEvent
}

export function listCloudAnimalsChangedSince(uid, sinceDate = null) {
  return listCloudRecordsChangedSince(uid, CLOUD_COLLECTIONS.animals, sinceDate)
}

export function listCloudEventsChangedSince(uid, sinceDate = null) {
  return listCloudRecordsChangedSince(uid, CLOUD_COLLECTIONS.events, sinceDate)
}
