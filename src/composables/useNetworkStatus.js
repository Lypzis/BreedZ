import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export function useNetworkStatus() {
  const isOnline = ref(true)
  const isReady = ref(false)

  function syncNetworkStatus() {
    isOnline.value = window.navigator.onLine
  }

  onMounted(() => {
    syncNetworkStatus()
    isReady.value = true

    window.addEventListener('online', syncNetworkStatus)
    window.addEventListener('offline', syncNetworkStatus)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('online', syncNetworkStatus)
    window.removeEventListener('offline', syncNetworkStatus)
  })

  return {
    isOnline,
    isReady,
    isOffline: computed(() => isReady.value && !isOnline.value),
  }
}
