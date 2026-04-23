import { boot } from 'quasar/wrappers'

const offlineResourceLoaders = [
  () => import('layouts/MainLayout.vue'),
  () => import('layouts/PublicLayout.vue'),
  () => import('pages/DashboardPage.vue'),
  () => import('pages/TutorialPage.vue'),
  () => import('pages/AnimalsPage.vue'),
  () => import('pages/AnimalDetailPage.vue'),
  () => import('pages/EventsPage.vue'),
  () => import('pages/EventDetailPage.vue'),
  () => import('pages/SettingsPage.vue'),
  () => import('pages/AccountPage.vue'),
  () => import('pages/ResetPasswordPage.vue'),
  () => import('pages/IndexPage.vue'),
  () => import('pages/GuideBreedingDatesPage.vue'),
  () => import('pages/GuideCattleLineagePage.vue'),
  () => import('pages/AboutPage.vue'),
  () => import('pages/ContactPage.vue'),
  () => import('pages/PrivacyPage.vue'),
  () => import('pages/TermsPage.vue'),
  () => import('src/services/backup-service'),
]

function primeOfflineShell() {
  offlineResourceLoaders.forEach((load) => {
    void load()
  })
}

export default boot(() => {
  if (typeof window === 'undefined') {
    return
  }

  window.setTimeout(() => {
    primeOfflineShell()
  }, 250)

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      primeOfflineShell()
    }, { timeout: 2000 })
    return
  }

  window.setTimeout(() => {
    primeOfflineShell()
  }, 1500)
})
