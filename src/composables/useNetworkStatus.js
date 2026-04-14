import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export function useNetworkStatus() {
  const isOnline = ref(true)
  const isReady = ref(false)
  let offlineRetryTimer = null
  let verificationRequestId = 0

  async function verifyReachability() {
    const requestId = ++verificationRequestId
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 3500)

    try {
      const response = await fetch(`/_network-check?ts=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'same-origin',
        signal: controller.signal,
      })

      if (requestId === verificationRequestId) {
        // A real network response, even 404, is enough to consider the app online.
        isOnline.value = Boolean(response)
      }
    } catch {
      if (requestId === verificationRequestId) {
        isOnline.value = false
      }
    } finally {
      window.clearTimeout(timeoutId)
      syncOfflineRetry()
    }
  }

  function syncOfflineRetry() {
    if (offlineRetryTimer !== null) {
      window.clearInterval(offlineRetryTimer)
      offlineRetryTimer = null
    }

    if (!isOnline.value) {
      offlineRetryTimer = window.setInterval(() => {
        void verifyReachability()
      }, 15000)
    }
  }

  function syncNetworkStatus() {
    if (!window.navigator.onLine) {
      isOnline.value = false
      syncOfflineRetry()
      return
    }

    void verifyReachability()
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      syncNetworkStatus()
    }
  }

  onMounted(() => {
    syncNetworkStatus()
    isReady.value = true

    window.addEventListener('online', syncNetworkStatus)
    window.addEventListener('offline', syncNetworkStatus)
    window.addEventListener('focus', syncNetworkStatus)
    window.addEventListener('pageshow', syncNetworkStatus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('online', syncNetworkStatus)
    window.removeEventListener('offline', syncNetworkStatus)
    window.removeEventListener('focus', syncNetworkStatus)
    window.removeEventListener('pageshow', syncNetworkStatus)
    document.removeEventListener('visibilitychange', handleVisibilityChange)

    if (offlineRetryTimer !== null) {
      window.clearInterval(offlineRetryTimer)
    }
  })

  return {
    isOnline,
    isReady,
    isOffline: computed(() => isReady.value && !isOnline.value),
  }
}
