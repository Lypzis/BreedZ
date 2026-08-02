<template>
  <AppPageShell>
    <q-card flat tag="article">
      <q-card-section tag="header">
        <div class="text-overline text-weight-bold text-primary">{{ t('about.overline') }}</div>
        <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">{{ t('about.title') }}</h1>
        <div class="text-body1 text-grey-8">
          {{ t('about.intro') }}
        </div>
      </q-card-section>

      <q-card-section tag="section">
        <div class="column q-gutter-lg">
          <section v-for="block in aboutBlocks" :key="block.title">
            <h2 class="text-h6 text-weight-bold q-mb-sm">{{ block.title }}</h2>
            <div class="text-body1 text-grey-8">
              {{ block.body }}
            </div>
          </section>
        </div>
      </q-card-section>

      <q-card-section id="victor-v-piccoli" tag="section">
        <div class="text-overline text-weight-bold text-primary">{{ t('about.founderOverline') }}</div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-xs">{{ t('about.founderTitle') }}</h2>
        <div class="text-subtitle2 text-primary q-mb-sm">{{ t('about.founderRole') }}</div>
        <p class="text-body1 text-grey-8 q-mb-none">{{ t('about.founderBody') }}</p>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">{{ t('about.editorialOverline') }}</div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-sm">{{ t('about.editorialTitle') }}</h2>
        <p class="text-body1 text-grey-8 q-mb-none">{{ t('about.editorialBody') }}</p>
      </q-card-section>
    </q-card>
  </AppPageShell>
</template>

<script setup>
import AppPageShell from 'src/components/AppPageShell.vue'
import { useMeta } from 'quasar'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18nText } from 'src/i18n'
import { buildPageMeta, buildSiteEntityMeta } from 'src/utils/seo-meta'
import { buildLocalizedPath, localeFromPath, routeSegmentToLocale } from 'src/utils/localeRouting'

const { t, tm } = useI18nText()
const route = useRoute()
const routeLocale = computed(() =>
  typeof route.params.locale === 'string' && route.params.locale
    ? routeSegmentToLocale(route.params.locale)
    : localeFromPath(route.path) || 'en',
)

useMeta(() => {
  const meta = buildPageMeta({
    title: t('about.meta.title'),
    description: t('about.meta.description'),
    path: buildLocalizedPath(routeLocale.value, '/about'),
    locale: routeLocale.value,
    internalPath: '/about',
  })

  return {
    ...meta,
    ...buildSiteEntityMeta({ locale: routeLocale.value, includeFounder: true }),
  }
})

const aboutBlocks = computed(() => tm('about.blocks') ?? [])
</script>
