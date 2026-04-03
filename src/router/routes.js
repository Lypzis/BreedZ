const routes = [
  {
    path: '/:locale(en|pt-br)?',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'app', component: () => import('pages/DashboardPage.vue') },
      { path: 'app/tutorial', component: () => import('pages/TutorialPage.vue') },
      { path: 'app/animals', component: () => import('pages/AnimalsPage.vue') },
      { path: 'app/animals/:id', component: () => import('pages/AnimalDetailPage.vue') },
      { path: 'app/events', component: () => import('pages/EventsPage.vue') },
      { path: 'app/settings', component: () => import('pages/SettingsPage.vue') },
      { path: 'guides/track-cattle-breeding-dates', component: () => import('pages/GuideBreedingDatesPage.vue') },
      { path: 'terms', component: () => import('pages/TermsPage.vue') },
      { path: 'privacy', component: () => import('pages/PrivacyPage.vue') },
      { path: 'contact', component: () => import('pages/ContactPage.vue') },
      { path: 'about', component: () => import('pages/AboutPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
