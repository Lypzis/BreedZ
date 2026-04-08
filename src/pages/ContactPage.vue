<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-7">
        <q-card flat>
          <q-card-section>
            <div class="text-overline text-weight-bold text-primary">{{ t('contact.overline') }}</div>
            <div class="text-h4 text-weight-bold q-mt-sm q-mb-sm">{{ t('contact.title') }}</div>
            <div class="text-body1 text-grey-8 q-mb-lg">
              {{ t('contact.intro') }}
            </div>

            <q-list>
              <q-item v-for="(item, index) in contactItems" :key="item.email">
                <q-item-section avatar>
                  <q-icon :name="contactIcons[index] || 'mail'" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ item.title }}</q-item-label>
                  <q-item-label caption>
                    <a :href="`mailto:${item.email}`" class="text-primary">{{ item.email }}</a>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
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
    title: t('contact.meta.title'),
    description: t('contact.meta.description'),
    path: buildLocalizedPath(routeLocale.value, '/contact'),
  }),
)

const contactItems = computed(() => tm('contact.items') ?? [])
const contactIcons = ['mail', 'support_agent', 'privacy_tip']
</script>
