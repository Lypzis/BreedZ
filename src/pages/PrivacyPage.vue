<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-7">
        <q-card flat>
          <q-card-section>
            <div class="text-overline text-weight-bold text-primary">{{ t('privacy.overline') }}</div>
            <div class="text-h4 text-weight-bold q-mt-sm q-mb-sm">{{ t('privacy.title') }}</div>
            <div class="text-caption text-grey-7 q-mb-lg">{{ t('privacy.lastUpdated') }}</div>

            <div class="column q-gutter-lg">
              <div v-for="block in privacyBlocks" :key="block.title">
                <div class="text-h6 text-weight-bold q-mb-sm">{{ block.title }}</div>
                <div class="text-body1 text-grey-8">
                  {{ block.body }}
                </div>
              </div>

              <div>
                <div class="text-h6 text-weight-bold q-mb-sm">{{ t('privacy.contactTitle') }}</div>
                <div class="text-body1 text-grey-8">
                  {{ t('privacy.contactBody') }}
                  <a href="mailto:privacy@breedz.app" class="text-primary">privacy@breedz.app</a>.
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useMeta } from 'quasar'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18nText } from 'src/i18n'
import { buildPageMeta } from 'src/utils/seo-meta'
import { buildLocalizedPath, routeSegmentToLocale } from 'src/utils/localeRouting'

const { t, tm } = useI18nText()
const route = useRoute()
const routeLocale = computed(() => routeSegmentToLocale(route.params.locale))

useMeta(() =>
  buildPageMeta({
    title: t('privacy.meta.title'),
    description: t('privacy.meta.description'),
    path: buildLocalizedPath(routeLocale.value, '/privacy'),
  }),
)

const privacyBlocks = computed(() => tm('privacy.blocks') ?? [])
</script>
