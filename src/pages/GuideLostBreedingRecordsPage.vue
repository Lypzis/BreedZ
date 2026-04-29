<template>
  <AppPageShell>
    <q-card flat>
      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">{{ t('guideLostBreedingRecords.overline') }}</div>
        <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
          {{ t('guideLostBreedingRecords.title') }}
        </h1>
        <div class="text-body1 text-grey-7">
          {{ t('guideLostBreedingRecords.description') }}
        </div>
      </q-card-section>

      <q-card-section>
        <q-banner rounded class="bg-green-1 text-primary">
          <template #avatar>
            <q-icon name="fact_check" color="primary" />
          </template>
          <span class="text-weight-bold">{{ t('guideLostBreedingRecords.shortAnswerLabel') }}</span>
          {{ ` ${t('guideLostBreedingRecords.shortAnswer')}` }}
        </q-banner>
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideLostBreedingRecords.firstOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideLostBreedingRecords.firstTitle') }}
        </div>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideLostBreedingRecords.firstDescription') }}
        </div>

        <q-list>
          <q-item v-for="item in firstItems" :key="item">
            <q-item-section avatar>
              <q-icon name="search" color="accent" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideLostBreedingRecords.rebuildOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideLostBreedingRecords.rebuildTitle') }}
        </div>
        <div class="column q-gutter-md">
          <q-card
            v-for="step in rebuildSteps"
            :key="step.title"
            flat
            bordered
          >
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold text-primary">{{ step.title }}</div>
              <div class="text-body2 text-grey-7 q-mt-sm">{{ step.description }}</div>
              <q-list v-if="step.items?.length" dense class="q-mt-sm">
                <q-item v-for="item in step.items" :key="item">
                  <q-item-section avatar>
                    <q-icon name="check_circle" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ item }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideLostBreedingRecords.estimateOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideLostBreedingRecords.estimateTitle') }}
        </div>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideLostBreedingRecords.estimateDescription') }}
        </div>

        <q-list>
          <q-item v-for="item in estimateItems" :key="item">
            <q-item-section avatar>
              <q-icon name="event" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideLostBreedingRecords.avoidOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideLostBreedingRecords.avoidTitle') }}
        </div>

        <q-list>
          <q-item v-for="item in avoidItems" :key="item">
            <q-item-section avatar>
              <q-icon name="warning_amber" color="accent" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideLostBreedingRecords.systemOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideLostBreedingRecords.systemTitle') }}
        </div>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideLostBreedingRecords.systemDescription') }}
        </div>

        <q-list>
          <q-item v-for="item in systemItems" :key="item">
            <q-item-section avatar>
              <q-icon name="task_alt" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-btn
          unelevated
          color="primary"
          icon="open_in_new"
          :label="t('guideLostBreedingRecords.openApp')"
          :to="dashboardPath"
          class="q-mt-md"
        />
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideLostBreedingRecords.faqOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideLostBreedingRecords.faqTitle') }}
        </div>

        <q-list>
          <q-item v-for="faq in faqs" :key="faq.question">
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ faq.question }}</q-item-label>
              <q-item-label caption class="text-grey-7">{{ faq.answer }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <GuideShareSection
        :title="t('guideLostBreedingRecords.title')"
        :path="sharePath"
      />
    </q-card>
  </AppPageShell>
</template>

<script setup>
import { computed } from 'vue'
import { useMeta } from 'quasar'
import { useRoute } from 'vue-router'
import AppPageShell from 'src/components/AppPageShell.vue'
import GuideShareSection from 'src/components/GuideShareSection.vue'
import { useI18nText } from 'src/i18n'
import { buildLocalizedPath, localeFromPath, routeSegmentToLocale } from 'src/utils/localeRouting'
import { buildPageMeta } from 'src/utils/seo-meta'

const GUIDE_PATH = '/guides/lost-breeding-records-what-to-do'

const { t, tm } = useI18nText()
const route = useRoute()
const routeLocale = computed(() =>
  typeof route.params.locale === 'string' && route.params.locale
    ? routeSegmentToLocale(route.params.locale)
    : localeFromPath(route.path) || 'en',
)

useMeta(() =>
  buildPageMeta({
    title: t('guideLostBreedingRecords.meta.title'),
    description: t('guideLostBreedingRecords.meta.description'),
    path: buildLocalizedPath(routeLocale.value, GUIDE_PATH),
  }),
)

const dashboardPath = computed(() => '/')
const sharePath = computed(() => buildLocalizedPath(routeLocale.value, GUIDE_PATH))
const firstItems = computed(() => tm('guideLostBreedingRecords.firstItems') ?? [])
const rebuildSteps = computed(() => tm('guideLostBreedingRecords.rebuildSteps') ?? [])
const estimateItems = computed(() => tm('guideLostBreedingRecords.estimateItems') ?? [])
const avoidItems = computed(() => tm('guideLostBreedingRecords.avoidItems') ?? [])
const systemItems = computed(() => tm('guideLostBreedingRecords.systemItems') ?? [])
const faqs = computed(() => tm('guideLostBreedingRecords.faqs') ?? [])
</script>
