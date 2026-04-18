<template>
  <AppPageShell :lg="7">
        <q-card flat>
          <q-card-section>
            <div class="text-overline text-weight-bold text-primary">{{ t('terms.overline') }}</div>
            <div class="text-h4 text-weight-bold q-mt-sm q-mb-sm">{{ t('terms.title') }}</div>
            <div class="text-caption text-grey-7 q-mb-lg">{{ t('terms.lastUpdated') }}</div>

            <div class="column q-gutter-lg">
              <div v-for="block in termsBlocks" :key="block.title">
                <div class="text-h6 text-weight-bold q-mb-sm">{{ block.title }}</div>
                <div class="text-body1 text-grey-8">
                  {{ block.body }}
                </div>
              </div>

              <div>
                <div class="text-h6 text-weight-bold q-mb-sm">{{ t('terms.contactTitle') }}</div>
                <div class="text-body1 text-grey-8">
                  {{ t('terms.contactBody') }}
                  <a href="mailto:legal@breedz.app" class="text-primary">legal@breedz.app</a>.
                </div>
              </div>
            </div>
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
import { buildPageMeta } from 'src/utils/seo-meta'
import { buildLocalizedPath, localeFromPath, routeSegmentToLocale } from 'src/utils/localeRouting'

const { t, tm } = useI18nText()
const route = useRoute()
const routeLocale = computed(() =>
  typeof route.params.locale === 'string' && route.params.locale
    ? routeSegmentToLocale(route.params.locale)
    : localeFromPath(route.path) || 'en',
)

useMeta(() =>
  buildPageMeta({
    title: t('terms.meta.title'),
    description: t('terms.meta.description'),
    path: buildLocalizedPath(routeLocale.value, '/terms'),
  }),
)

const termsBlocks = computed(() => tm('terms.blocks') ?? [])
</script>
