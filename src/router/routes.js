const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/DashboardPage.vue') },
      { path: 'tutorial', component: () => import('pages/TutorialPage.vue') },
      { path: 'animals', component: () => import('pages/AnimalsPage.vue') },
      { path: 'animals/:id', component: () => import('pages/AnimalDetailPage.vue') },
      { path: 'events', component: () => import('pages/EventsPage.vue') },
      { path: 'account', component: () => import('pages/AccountPage.vue') },
      { path: 'settings', component: () => import('pages/SettingsPage.vue') },
    ],
  },
  {
    path: '/en',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'guides/track-cattle-breeding-dates', component: () => import('pages/GuideBreedingDatesPage.vue') },
      { path: 'terms', component: () => import('pages/TermsPage.vue') },
      { path: 'privacy', component: () => import('pages/PrivacyPage.vue') },
      { path: 'contact', component: () => import('pages/ContactPage.vue') },
      { path: 'about', component: () => import('pages/AboutPage.vue') },
    ],
  },
  {
    path: '/pt-br',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'guides/track-cattle-breeding-dates', redirect: '/pt-br/guias/acompanhar-datas-de-cobertura-no-gado' },
      { path: 'guias/acompanhar-datas-de-cobertura-no-gado', component: () => import('pages/GuideBreedingDatesPage.vue') },
      { path: 'terms', redirect: '/pt-br/termos' },
      { path: 'termos', component: () => import('pages/TermsPage.vue') },
      { path: 'privacy', redirect: '/pt-br/privacidade' },
      { path: 'privacidade', component: () => import('pages/PrivacyPage.vue') },
      { path: 'contact', redirect: '/pt-br/contato' },
      { path: 'contato', component: () => import('pages/ContactPage.vue') },
      { path: 'about', redirect: '/pt-br/sobre' },
      { path: 'sobre', component: () => import('pages/AboutPage.vue') },
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
