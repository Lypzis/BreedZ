<template>
  <AppPageShell>
    <q-card flat>
      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">{{ t('guideBreedingRecordsApp.overline') }}</div>
        <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
          {{ t('guideBreedingRecordsApp.title') }}
        </h1>
        <div class="text-body1 text-grey-7">
          {{ t('guideBreedingRecordsApp.description') }}
        </div>
        <GuideWrittenDate />
      </q-card-section>

      <q-card-section>
        <q-banner rounded class="bg-green-1 text-primary">
          <template #avatar>
            <q-icon name="fact_check" color="primary" />
          </template>
          <span class="text-weight-bold">{{ t('guideBreedingRecordsApp.shortAnswerLabel') }}</span>
          {{ ` ${t('guideBreedingRecordsApp.shortAnswer')}` }}
        </q-banner>
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideBreedingRecordsApp.problemOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideBreedingRecordsApp.problemTitle') }}
        </div>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideBreedingRecordsApp.problemDescription') }}
        </div>

        <q-list>
          <q-item v-for="item in problemItems" :key="item">
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
          {{ t('guideBreedingRecordsApp.mustHaveOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideBreedingRecordsApp.mustHaveTitle') }}
        </div>

        <div class="column q-gutter-md">
          <q-card v-for="item in mustHaveItems" :key="item.title" flat bordered>
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold text-primary">{{ item.title }}</div>
              <div class="text-body2 text-grey-7 q-mt-sm">{{ item.description }}</div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideBreedingRecordsApp.workflowOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideBreedingRecordsApp.workflowTitle') }}
        </div>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideBreedingRecordsApp.workflowDescription') }}
        </div>

        <q-list>
          <q-item v-for="item in workflowItems" :key="item">
            <q-item-section avatar>
              <q-icon name="task_alt" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideBreedingRecordsApp.compareOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideBreedingRecordsApp.compareTitle') }}
        </div>

        <q-list>
          <q-item v-for="item in compareItems" :key="item">
            <q-item-section avatar>
              <q-icon name="balance" color="accent" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideBreedingRecordsApp.breedzOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideBreedingRecordsApp.breedzTitle') }}
        </div>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideBreedingRecordsApp.breedzDescription') }}
        </div>

        <q-list>
          <q-item v-for="item in breedzItems" :key="item">
            <q-item-section avatar>
              <q-icon name="devices" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <div class="row q-col-gutter-sm q-mt-md">
          <div class="col-12 col-sm-auto">
            <q-btn
              unelevated
              color="primary"
              icon="open_in_new"
              :label="t('guideBreedingRecordsApp.openApp')"
              :to="dashboardPath"
              class="full-width"
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn
              outline
              color="primary"
              icon="event"
              :label="t('guideBreedingRecordsApp.openBreedingDatesGuide')"
              :to="breedingDatesGuidePath"
              class="full-width"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideBreedingRecordsApp.faqOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideBreedingRecordsApp.faqTitle') }}
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

      <GuideSourcesSection :sources="sources" />

      <GuideRelatedLink
        :title="t('guideCattleRecordKeeping.title')"
        :description="t('guideCattleRecordKeeping.description')"
        :to="recordKeepingGuidePath"
      />

      <GuideShareSection
        :title="t('guideBreedingRecordsApp.title')"
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
import GuideRelatedLink from 'src/components/GuideRelatedLink.vue'
import GuideShareSection from 'src/components/GuideShareSection.vue'
import GuideSourcesSection from 'src/components/GuideSourcesSection.vue'
import GuideWrittenDate from 'src/components/GuideWrittenDate.vue'
import { useI18nText } from 'src/i18n'
import { buildLocalizedPath, localeFromPath, routeSegmentToLocale } from 'src/utils/localeRouting'
import { buildPageMeta } from 'src/utils/seo-meta'

const { t, tm } = useI18nText()
const route = useRoute()
const routeLocale = computed(() =>
  typeof route.params.locale === 'string' && route.params.locale
    ? routeSegmentToLocale(route.params.locale)
    : localeFromPath(route.path) || 'en',
)

useMeta(() =>
  buildPageMeta({
    title: t('guideBreedingRecordsApp.meta.title'),
    description: t('guideBreedingRecordsApp.meta.description'),
    path: buildLocalizedPath(routeLocale.value, '/guides/breeding-records-app'),
  }),
)

const dashboardPath = computed(() => '/')
const breedingDatesGuidePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/track-cattle-breeding-dates'),
)
const recordKeepingGuidePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/best-cattle-record-keeping-methods'),
)
const sharePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/breeding-records-app'),
)
const sources = [
  {
    title: 'Production Records for Commercial Cow-Calf Operations',
    publisher: 'University of Missouri Extension',
    url: 'https://extension.missouri.edu/publications/g2045',
  },
  {
    title: 'Cow-Calf Production Record Software',
    publisher: 'Oklahoma State University Extension',
    url: 'https://extension.okstate.edu/fact-sheets/cow-calf-production-record-software.html',
  },
  {
    title: 'Calving Book',
    publisher: 'North Dakota State University Extension',
    url: 'https://www.ndsu.edu/agriculture/extension/publications/calving-book',
  },
  {
    title: 'How to Evaluate Animal Performance in the Cow-Calf Herd',
    publisher: 'University of Maryland Extension',
    url: 'https://extension.umd.edu/resource/how-evaluate-animal-performance-cow-calf-herd',
  },
]
const problemItems = computed(() => tm('guideBreedingRecordsApp.problemItems') ?? [])
const mustHaveItems = computed(() => tm('guideBreedingRecordsApp.mustHaveItems') ?? [])
const workflowItems = computed(() => tm('guideBreedingRecordsApp.workflowItems') ?? [])
const compareItems = computed(() => tm('guideBreedingRecordsApp.compareItems') ?? [])
const breedzItems = computed(() => tm('guideBreedingRecordsApp.breedzItems') ?? [])
const faqs = computed(() => tm('guideBreedingRecordsApp.faqs') ?? [])
</script>
