<template>
  <q-layout view="lHh lpR lFf">
    <q-header bordered class="bg-white text-primary">
      <q-toolbar class="q-px-sm q-py-sm">
        <router-link :to="homePath" class="brand-link row items-center no-wrap q-gutter-sm">
          <q-avatar rounded size="42px">
            <img :src="logoIcon" :alt="t('brand.name')" />
          </q-avatar>
          <div class="brand-name">
            <div class="text-h6 text-weight-bold">{{ t('brand.name') }}</div>
          </div>
        </router-link>

        <q-space />

        <q-btn flat no-caps dense color="primary" icon="dashboard" :label="t('common.openApp')"
          :aria-label="t('common.openApp')" @click="openApp" class="q-mr-sm" />

        <q-btn-toggle :model-value="selectedLocale" @update:model-value="onLocaleChange" class="language-toggle" dense
          no-caps unelevated color="white" text-color="primary" toggle-color="green-1" toggle-text-color="primary"
          :aria-label="t('language.selector')" :options="localeOptions" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer bordered class="bg-white text-grey-8">
      <div class="row items-center justify-between q-col-gutter-md q-px-md q-py-sm">
        <div class="col-12 col-md-auto row items-center q-gutter-md footer-links">
          <router-link :to="localizedPath('/guides')">{{ t('footer.guides') }}</router-link>
          <router-link :to="localizedPath('/about')">{{ t('footer.about') }}</router-link>
          <router-link :to="localizedPath('/contact')">{{ t('footer.contact') }}</router-link>
          <router-link :to="localizedPath('/privacy')">{{ t('footer.privacy') }}</router-link>
          <router-link :to="localizedPath('/terms')">{{ t('footer.terms') }}</router-link>
        </div>

        <div class="col-12 col-md-auto row items-center q-gutter-sm text-caption">
          <q-avatar rounded size="24px">
            <img :src="logoSmall" :alt="t('brand.name')" />
          </q-avatar>
          <span v-html="t('footer.copyright')" />
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { useMeta } from 'quasar'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18nText } from 'src/i18n'
import { buildLocalizedPath, localeFromPath, routeSegmentToLocale } from 'src/utils/localeRouting'
import { buildLocalizedAlternateLinks } from 'src/utils/seo-meta'

const logoIcon = '/icons/favicon-96x96.png'
const logoSmall = '/icons/favicon-48x48.png'

const { locale, t, setLocale } = useI18nText()
const route = useRoute()
const router = useRouter()

const routeLocale = computed(() =>
  typeof route.params.locale === 'string' && route.params.locale
    ? routeSegmentToLocale(route.params.locale)
    : localeFromPath(route.path) || locale.value,
)

const localeOptions = computed(() => [
  { label: t('language.en'), value: 'en' },
  { label: t('language.ptBr'), value: 'pt-BR' },
  { label: t('language.es'), value: 'es' },
])

const homePath = computed(() => buildLocalizedPath(routeLocale.value, '/'))

const selectedLocale = ref(routeLocale.value)

useMeta(() => ({
  link: buildLocalizedAlternateLinks(route.path),
}))

watch(routeLocale, (value) => {
  if (selectedLocale.value !== value) {
    selectedLocale.value = value
  }
})

function localizedPath(path) {
  return buildLocalizedPath(routeLocale.value, path)
}

async function onLocaleChange(value) {
  if (!value || value === routeLocale.value) {
    selectedLocale.value = routeLocale.value
    return
  }

  selectedLocale.value = value
  setLocale(value)
  await router.replace(buildLocalizedPath(value, route.fullPath))
}

async function openApp() {
  if (typeof window !== 'undefined' && window.navigator.onLine) {
    window.location.assign('/')
    return
  }

  await router.push('/')
}
</script>

<style scoped>
.brand-link {
  color: inherit;
  text-decoration: none;
}

.footer-links a {
  color: var(--q-primary);
  text-decoration: none;
}

.footer-links a:hover {
  text-decoration: underline;
}

.language-toggle :deep(.q-btn-item) {
  padding-left: 10px;
  padding-right: 10px;
}

@media (max-width: 599px) {
  .footer-links {
    justify-content: flex-start;
  }
}

@media (max-width: 440px) {
  .brand-name {
    display: none;
  }
}
</style>
