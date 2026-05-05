import { defineBoot } from '#q-app/wrappers'
import { watch } from 'vue'
import { useAuthStore } from 'src/stores/auth-store'
import { requestPremiumSyncNow } from 'src/services/sync-scheduler'

export default defineBoot(() => {
  if (typeof window === 'undefined') {
    return
  }

  const authStore = useAuthStore()

  watch(
    () => [authStore.user?.uid ?? '', authStore.isPremium, authStore.isLoaded],
    ([uid, isPremium, isLoaded]) => {
      if (isLoaded && uid && isPremium) {
        void requestPremiumSyncNow('account-ready')
      }
    },
    { immediate: true },
  )

  function requestForegroundSync() {
    void requestPremiumSyncNow('foreground')
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      requestForegroundSync()
    }
  }

  window.addEventListener('online', requestForegroundSync)
  window.addEventListener('focus', requestForegroundSync)
  window.addEventListener('pageshow', requestForegroundSync)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})
