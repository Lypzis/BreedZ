import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)

let firebaseAnalytics = null
let firebaseAppCheck = null

export function initFirebaseAppCheck() {
  if (firebaseAppCheck || typeof window === 'undefined') {
    return firebaseAppCheck
  }

  const siteKey = import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY

  if (!siteKey) {
    return null
  }

  try {
    firebaseAppCheck = initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaEnterpriseProvider(siteKey),
      isTokenAutoRefreshEnabled: true,
    })
  } catch {
    return firebaseAppCheck
  }

  return firebaseAppCheck
}

export async function initFirebaseAnalytics() {
  if (firebaseAnalytics || typeof window === 'undefined') {
    return firebaseAnalytics
  }

  const supported = await isSupported().catch(() => false)

  if (!supported) {
    return null
  }

  firebaseAnalytics = getAnalytics(firebaseApp)
  return firebaseAnalytics
}

export { firebaseConfig, firebaseAnalytics, firebaseAppCheck }
