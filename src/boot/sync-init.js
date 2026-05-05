import { defineBoot } from '#q-app/wrappers'
import { watch } from 'vue'
import { useAuthStore } from 'src/stores/auth-store'
import { requestPremiumSyncNow } from 'src/services/sync-scheduler'
import { useAnimalsStore } from 'src/stores/animals-store'
import { useEventsStore } from 'src/stores/events-store'

export default defineBoot(() => {
  if (typeof window === 'undefined') {
    return
  }

  const authStore = useAuthStore()
  const animalsStore = useAnimalsStore()
  const eventsStore = useEventsStore()

  async function refreshStoresAfterPull(result) {
    if ((result?.pulled ?? 0) <= 0) {
      return
    }

    await Promise.all([animalsStore.loadAnimals(), eventsStore.loadEvents()])
  }

  async function requestForegroundSync() {
    await refreshStoresAfterPull(await requestPremiumSyncNow('foreground'))
  }

  watch(
    () => [authStore.user?.uid ?? '', authStore.isPremium, authStore.isLoaded],
    ([uid, isPremium, isLoaded]) => {
      if (isLoaded && uid && isPremium) {
        void requestPremiumSyncNow('account-ready').then(refreshStoresAfterPull)
      }
    },
    { immediate: true },
  )

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      void requestForegroundSync()
    }
  }

  window.addEventListener('online', () => void requestForegroundSync())
  window.addEventListener('focus', () => void requestForegroundSync())
  window.addEventListener('pageshow', () => void requestForegroundSync())
  document.addEventListener('visibilitychange', handleVisibilityChange)
})
