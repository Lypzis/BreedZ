import { readonly, ref } from 'vue'
import { useAuthStore } from 'src/stores/auth-store'
import { getDeviceId } from './device-id.js'
import { syncPremiumRecords } from './sync-queue.js'

const DEFAULT_DEBOUNCE_MS = 1200

let syncTimer = null
let syncPromise = null
let pendingReason = ''
let lastResult = null
let lastError = null
const isPremiumSyncing = ref(false)
const premiumSyncReason = ref('')

function isBrowserOnline() {
  return typeof navigator === 'undefined' || navigator.onLine !== false
}

function isPremiumSyncAvailable(authStore = useAuthStore()) {
  return Boolean(authStore.user?.uid && authStore.isPremium && isBrowserOnline())
}

function getPremiumSyncSkipReason(authStore = useAuthStore()) {
  if (!authStore.user?.uid) {
    return 'signed-out'
  }

  if (!authStore.isPremium) {
    return 'premium-required'
  }

  if (!isBrowserOnline()) {
    return 'offline'
  }

  return ''
}

function shouldQueueFollowUp(reason) {
  return reason !== 'manual' && reason !== 'settings-manual'
}

async function runPremiumSync(reason = 'manual') {
  const authStore = useAuthStore()

  if (!isPremiumSyncAvailable(authStore)) {
    const skippedReason = getPremiumSyncSkipReason(authStore)

    return {
      attempted: 0,
      pushed: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      skippedReason,
    }
  }

  if (syncPromise) {
    if (shouldQueueFollowUp(reason)) {
      pendingReason = pendingReason || reason
    }

    return syncPromise
  }

  pendingReason = ''
  isPremiumSyncing.value = true
  premiumSyncReason.value = reason
  syncPromise = syncPremiumRecords(authStore.user.uid, {
    deviceId: getDeviceId(),
  })
    .then((result) => {
      lastResult = result
      lastError = null
      return result
    })
    .catch((error) => {
      lastError = error
      throw error
    })
    .finally(() => {
      syncPromise = null
      isPremiumSyncing.value = false
      premiumSyncReason.value = ''

      if (pendingReason) {
        const nextReason = pendingReason
        pendingReason = ''
        requestPremiumSync(nextReason)
      }
    })

  return syncPromise
}

export function requestPremiumSync(reason = 'local-change', options = {}) {
  if (typeof window === 'undefined') {
    return Promise.resolve(null)
  }

  if (syncTimer !== null) {
    window.clearTimeout(syncTimer)
    syncTimer = null
  }

  const debounceMs = options.immediate ? 0 : (options.debounceMs ?? DEFAULT_DEBOUNCE_MS)

  return new Promise((resolve) => {
    syncTimer = window.setTimeout(() => {
      syncTimer = null
      void runPremiumSync(reason)
        .then(resolve)
        .catch(() => resolve(null))
    }, debounceMs)
  })
}

export function requestPremiumSyncNow(reason = 'manual') {
  if (typeof window === 'undefined') {
    return Promise.resolve(null)
  }

  if (syncTimer !== null) {
    window.clearTimeout(syncTimer)
    syncTimer = null
  }

  return runPremiumSync(reason).catch(() => null)
}

export function usePremiumSyncStatus() {
  return {
    isSyncing: readonly(isPremiumSyncing),
    reason: readonly(premiumSyncReason),
  }
}

export function getLastPremiumSyncResult() {
  return lastResult
}

export function getLastPremiumSyncError() {
  return lastError
}
