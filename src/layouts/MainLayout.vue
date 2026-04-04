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
            <div>
              <div class="text-h6 text-weight-bold">{{ t('brand.name') }}</div>
            </div>
          </router-link>
        </q-toolbar-title>

        <q-btn-toggle
          v-model="selectedLocale"
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
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer bordered class="bg-white text-grey-8">
      <q-toolbar class="q-py-sm">
        <div class="row items-center justify-between full-width q-col-gutter-md">
          <div class="col-12 col-md-auto">
            <div class="row items-center q-gutter-md text-caption">
              <q-btn flat dense no-caps color="grey-8" :label="t('footer.terms')" :to="localizedPath('/terms')" />
              <q-btn flat dense no-caps color="grey-8" :label="t('footer.privacy')" :to="localizedPath('/privacy')" />
              <q-btn flat dense no-caps color="grey-8" :label="t('footer.contact')" :to="localizedPath('/contact')" />
              <q-btn flat dense no-caps color="grey-8" :label="t('footer.about')" :to="localizedPath('/about')" />
            </div>
          </div>

          <div class="col-12 col-md-auto">
            <div class="row items-center q-gutter-sm text-caption">
              <q-avatar rounded size="24px">
                <img :src="logoSmall" :alt="t('brand.smallIconAlt')" />
              </q-avatar>
              <span v-html="t('footer.copyright')" />
            </div>
          </div>
        </div>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18nText } from 'src/i18n'
import { buildLocalizedPath, routeSegmentToLocale, stripLocaleFromPath } from 'src/utils/localeRouting'

const logoIcon = '/icons/favicon-96x96.png'
const logoSmall = '/icons/favicon-32x32.png'

const { locale, setLocale, t } = useI18nText()
const route = useRoute()
const router = useRouter()

const routeLocale = computed(() =>
  typeof route.params.locale === 'string' && route.params.locale
    ? routeSegmentToLocale(route.params.locale)
    : locale.value,
)
const dashboardPath = computed(() => '/app')

const navItems = computed(() => [
  {
    label: t('nav.dashboard'),
    icon: 'today',
    to: '/app',
  },
  {
    label: t('nav.animals'),
    icon: 'pets',
    to: '/app/animals',
  },
  {
    label: t('nav.events'),
    icon: 'assignment',
    to: '/app/events',
  },
  {
    label: t('nav.settings'),
    icon: 'settings',
    to: '/app/settings',
  },
  {
    label: t('nav.tutorial'),
    icon: 'school',
    to: '/app/tutorial',
  },
])

const localeOptions = computed(() => [
  { label: t('language.en'), value: 'en' },
  { label: t('language.ptBr'), value: 'pt-BR' },
])

const selectedLocale = computed({
  get: () => routeLocale.value,
  set: async (value) => {
    setLocale(value)

    if (stripLocaleFromPath(route.path).startsWith('/app')) {
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
