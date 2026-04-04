import { boot } from 'quasar/wrappers'

const corePageLoaders = [
  () => import('pages/DashboardPage.vue'),
  () => import('pages/TutorialPage.vue'),
  () => import('pages/AnimalsPage.vue'),
  () => import('pages/AnimalDetailPage.vue'),
  () => import('pages/EventsPage.vue'),
  () => import('pages/SettingsPage.vue'),
]

function primeOfflineShell() {
  corePageLoaders.forEach((load) => {
    void load()
  })
}

export default boot(() => {
  if (typeof window === 'undefined') {
    return
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      primeOfflineShell()
    })
    return
  }

  window.setTimeout(() => {
    primeOfflineShell()
  }, 1500)
})
