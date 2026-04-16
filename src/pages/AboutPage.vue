<template>
  <AppPageShell :lg="7">
        <q-card flat>
          <q-card-section>
            <div class="text-overline text-weight-bold text-primary">{{ t('about.overline') }}</div>
            <div class="text-h4 text-weight-bold q-mt-sm q-mb-sm">{{ t('about.title') }}</div>
            <div class="text-body1 text-grey-8 q-mb-lg">
              {{ t('about.intro') }}
            </div>

            <div class="column q-gutter-lg">
              <div v-for="block in aboutBlocks" :key="block.title">
                <div class="text-h6 text-weight-bold q-mb-sm">{{ block.title }}</div>
                <div class="text-body1 text-grey-8">
                  {{ block.body }}
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
    title: t('about.meta.title'),
    description: t('about.meta.description'),
    path: buildLocalizedPath(routeLocale.value, '/about'),
    trailingSlash: true,
  }),
)

const aboutBlocks = computed(() => tm('about.blocks') ?? [])
</script>
