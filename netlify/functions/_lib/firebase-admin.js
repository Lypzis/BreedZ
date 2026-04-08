import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

function getRequiredEnv(name) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function getFirebaseAdminConfig() {
  return {
    projectId: getRequiredEnv('FIREBASE_ADMIN_PROJECT_ID'),
    clientEmail: getRequiredEnv('FIREBASE_ADMIN_CLIENT_EMAIL'),
    privateKey: getRequiredEnv('FIREBASE_ADMIN_PRIVATE_KEY').replace(/\\n/g, '\n'),
  }
}

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  return initializeApp({
    credential: cert(getFirebaseAdminConfig()),
  })
}

export function getAdminAuth() {
  return getAuth(getFirebaseAdminApp())
}

export function getAdminDb() {
  return getFirestore(getFirebaseAdminApp())
}

export function getSubscriptionDocRef(uid) {
  return getAdminDb().collection('subscriptions').doc(uid)
}

export function getUserDocRef(uid) {
  return getAdminDb().collection('users').doc(uid)
}
