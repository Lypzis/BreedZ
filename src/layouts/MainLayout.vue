<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      bordered
      class="text-white"
      style="background: linear-gradient(270deg, var(--q-secondary) 0%, var(--q-primary) 100%)"
    >
      <q-toolbar class="q-px-sm q-py-xs">
        <q-btn
          flat
          dense
          round
          icon="menu"
          :aria-label="t('nav.toggle')"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <router-link :to="dashboardPath" class="row items-center no-wrap q-gutter-sm text-white" style="text-decoration: none">
            <q-avatar rounded size="42px">
              <img :src="logoIcon" :alt="t('brand.iconAlt')" />
            </q-avatar>
            <div class="brand-name">
              <div class="text-h6 text-weight-bold">{{ t('brand.name') }}</div>
            </div>
          </router-link>
        </q-toolbar-title>

        <q-chip
          v-if="showNetworkStatusChip"
          dense
          square
          :icon="isOnline ? 'wifi' : 'wifi_off'"
          :color="isOnline ? 'green-1' : 'brown-1'"
          :text-color="isOnline ? 'primary' : 'brown-10'"
          class="q-chip q-pr-xs q-mr-md"
        >
          {{ isOnline ? t('layout.online') : t('layout.offline') }}
        </q-chip>

        <q-btn-toggle
          v-model="selectedLocale"
          class="language-toggle"
          dense
          no-caps
          unelevated
          color="white"
          text-color="primary"
          toggle-color="green-1"
          toggle-text-color="primary"
          :aria-label="t('language.selector')"
          :options="localeOptions"
        />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above :width="260" bordered class="bg-white">
      <div class="fit column no-wrap">
        <q-item clickable :to="dashboardPath" class="bg-green-1 q-py-md">
          <q-item-section>
            <q-item-label class="text-h6 text-weight-bold text-primary">{{ t('brand.name') }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-list padding>
          <q-item
            v-for="item in navItems"
            :key="item.label"
            :clickable="Boolean(item.to)"
            :disable="!item.to"
            :to="item.to"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-card flat class="q-ma-md bg-green-1">
          <q-card-section>
            <div class="text-subtitle2 text-weight-bold text-primary">{{ t('layout.localFirstTitle') }}</div>
            <div class="text-caption text-grey-8">{{ t('layout.localFirstBody') }}</div>
          </q-card-section>
        </q-card>

        <q-space />

        <div class=" q-pb-sm">
          <q-separator class="q-mb-sm" />

          <q-list>
            <q-item clickable :to="localizedPath('/contact')" class="rounded-borders">
              <q-item-section avatar>
                <q-icon name="mail" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ t('footer.contact') }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable :to="localizedPath('/privacy')" class="rounded-borders">
              <q-item-section avatar>
                <q-icon name="privacy_tip" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ t('footer.privacy') }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable :to="localizedPath('/terms')" class="rounded-borders">
              <q-item-section avatar>
                <q-icon name="gavel" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ t('footer.terms') }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable :to="localizedPath('/about')" class="rounded-borders">
              <q-item-section avatar>
                <q-icon name="info" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ t('footer.about') }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <div class="row items-center q-gutter-sm q-px-md q-pb-md text-caption text-grey-7">
          <q-avatar rounded size="24px">
            <img :src="logoSmall" :alt="t('brand.smallIconAlt')" />
          </q-avatar>
          <span v-html="t('footer.copyright')" />
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNetworkStatus } from 'src/composables/useNetworkStatus'
import { useI18nText } from 'src/i18n'
import { buildLocalizedPath, isAppShellPath, localeFromPath, routeSegmentToLocale } from 'src/utils/localeRouting'

const logoIcon = '/icons/favicon-96x96.png'
const logoSmall = '/icons/favicon-48x48.png'

const { locale, setLocale, t } = useI18nText()
const route = useRoute()
const router = useRouter()
const { isOnline, isReady: networkStatusReady } = useNetworkStatus()

const routeLocale = computed(() =>
  typeof route.params.locale === 'string' && route.params.locale
    ? routeSegmentToLocale(route.params.locale)
    : localeFromPath(route.path) || locale.value,
)
const showNetworkStatusChip = computed(() => networkStatusReady.value && isAppShellPath(route.path))
const dashboardPath = computed(() => '/')

const navItems = computed(() => [
  {
    label: t('nav.dashboard'),
    icon: 'today',
    to: '/',
  },
  {
    label: t('nav.animals'),
    icon: 'pets',
    to: '/animals',
  },
  {
    label: t('nav.events'),
    icon: 'assignment',
    to: '/events',
  },
  {
    label: t('nav.tutorial'),
    icon: 'school',
    to: '/tutorial',
  },
  {
    label: t('nav.settings'),
    icon: 'settings',
    to: '/settings',
  },
  {
    label: t('nav.account'),
    icon: 'account_circle',
    to: '/account',
  },
])

const localeOptions = computed(() => [
  { label: t('language.en'), value: 'en' },
  { label: t('language.ptBr'), value: 'pt-BR' },
  { label: t('language.es'), value: 'es' },
])

const selectedLocale = computed({
  get: () => routeLocale.value,
  set: async (value) => {
    setLocale(value)

    if (isAppShellPath(route.path)) {
      return
    }

    await router.replace(buildLocalizedPath(value, route.fullPath))
  },
})

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function localizedPath(path) {
  return buildLocalizedPath(routeLocale.value, path)
}
</script>

<style scoped>
.language-toggle :deep(.q-btn-item) {
  padding-left: 10px;
  padding-right: 10px;
}

@media (max-width: 415px) {
  .brand-name {
    display: none;
  }
}
</style>
