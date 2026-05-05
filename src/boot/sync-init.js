import { defineBoot } from '#q-app/wrappers'
import { watch } from 'vue'
import { Dialog, Notify } from 'quasar'
import LocalRecordsJoinDialog from 'src/components/LocalRecordsJoinDialog.vue'
import { t } from 'src/i18n'
import { useAuthStore } from 'src/stores/auth-store'
import {
  getLocalRecordSyncReadiness,
  joinLocalRecordsToAccount,
  keepLocalRecordsOnDeviceForAccount,
} from 'src/services/sync-ownership'
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
  let localRecordDecisionPromise = null
  let lastLocalRecordWarning = ''

  async function refreshStoresAfterPull(result) {
    if ((result?.pulled ?? 0) <= 0) {
      return
    }

    await Promise.all([animalsStore.loadAnimals(), eventsStore.loadEvents()])
  }

  async function requestForegroundSync() {
    if (!await ensureLocalRecordsCanSync()) {
      return
    }

    await refreshStoresAfterPull(await requestPremiumSyncNow('foreground'))
  }

  async function promptForLocalRecordDecision(readiness) {
    if (localRecordDecisionPromise) {
      return localRecordDecisionPromise
    }

    localRecordDecisionPromise = new Promise((resolve) => {
      Dialog.create({
        component: LocalRecordsJoinDialog,
        componentProps: {
          animals: readiness.animals,
          events: readiness.events,
        },
      })
        .onOk(async () => {
          try {
            await joinLocalRecordsToAccount(authStore.user.uid)
            await Promise.all([animalsStore.loadAnimals(), eventsStore.loadEvents()])
            Notify.create({
              color: 'positive',
              message: t('settings.localRecordsJoined'),
              position: 'top',
            })
            resolve(true)
          } catch (error) {
            Notify.create({
              color: 'negative',
              message: error instanceof Error ? error.message : t('settings.localRecordsJoinFailed'),
              position: 'top',
            })
            resolve(false)
          }
        })
        .onCancel(async () => {
          await keepLocalRecordsOnDeviceForAccount(authStore.user.uid)
          Notify.create({
            color: 'warning',
            message: t('settings.localRecordsKept'),
            position: 'top',
          })
          resolve(false)
        })
        .onDismiss(() => {
          localRecordDecisionPromise = null
        })
    })

    return localRecordDecisionPromise
  }

  async function ensureLocalRecordsCanSync() {
    const uid = authStore.user?.uid ?? ''

    if (!uid || !authStore.isPremium) {
      return false
    }

    const readiness = await getLocalRecordSyncReadiness(uid)

    if (readiness.canSync) {
      return true
    }

    if (readiness.skippedReason === 'local-records-need-decision') {
      return promptForLocalRecordDecision(readiness)
    }

    const warningKey = `${uid}:${readiness.skippedReason}`

    if (warningKey !== lastLocalRecordWarning) {
      lastLocalRecordWarning = warningKey
      Notify.create({
        color: 'warning',
        message: readiness.skippedReason === 'local-records-owned-by-another-account'
          ? t('settings.localRecordsOtherAccountWarning')
          : t('settings.localRecordsKeptSyncPaused'),
        position: 'top',
      })
    }

    return false
  }

  watch(
    () => [authStore.user?.uid ?? '', authStore.isPremium, authStore.isLoaded],
    async ([uid, isPremium, isLoaded]) => {
      if (isLoaded && uid && isPremium) {
        if (!await ensureLocalRecordsCanSync()) {
          return
        }

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
