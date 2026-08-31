<template>
  <AppPageShell>
    <q-card flat tag="article">
      <q-card-section tag="header">
        <GuideBreadcrumbs :title="t('guideAvoidMissingCalvingDates.title')" />
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideAvoidMissingCalvingDates.overline') }}
        </div>
        <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
          {{ t('guideAvoidMissingCalvingDates.title') }}
        </h1>
        <p class="text-body1 text-grey-7 q-mb-none">
          {{ t('guideAvoidMissingCalvingDates.description') }}
        </p>
        <GuideAttribution :published-at="guide.publishedAt" :modified-at="guide.modifiedAt" />
      </q-card-section>

      <q-card-section tag="section" class="q-pt-none">
        <q-img
          src="/images/guides/avoid-missing-calving-dates.webp"
          :alt="t('guideAvoidMissingCalvingDates.imageAlt')"
          ratio="1.5"
          fit="cover"
          class="rounded-borders"
        />
      </q-card-section>

      <q-card-section tag="section">
        <q-banner rounded class="bg-green-1 text-primary">
          <template #avatar>
            <q-icon name="event_available" color="primary" />
          </template>
          <span class="text-weight-bold">{{ t('guideAvoidMissingCalvingDates.shortAnswerLabel') }}</span>
          {{ ` ${t('guideAvoidMissingCalvingDates.shortAnswer')}` }}
        </q-banner>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideAvoidMissingCalvingDates.recordsOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-sm">
          {{ t('guideAvoidMissingCalvingDates.recordsTitle') }}
        </h2>
        <p class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideAvoidMissingCalvingDates.recordsDescription') }}
        </p>

        <div class="column q-gutter-md">
          <q-card v-for="item in recordItems" :key="item.record" flat bordered>
            <q-card-section class="row q-col-gutter-md">
              <h3 class="col-12 col-sm-4 text-subtitle2 text-weight-bold text-primary q-my-none">
                {{ item.record }}
              </h3>
              <div class="col-12 col-sm-4 text-body2 text-grey-8">
                {{ item.capture }}
              </div>
              <div class="col-12 col-sm-4 text-body2 text-grey-7">
                {{ item.use }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideAvoidMissingCalvingDates.windowOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-sm">
          {{ t('guideAvoidMissingCalvingDates.windowTitle') }}
        </h2>
        <p class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideAvoidMissingCalvingDates.windowDescription') }}
        </p>

        <q-list bordered separator>
          <q-item v-for="item in windowItems" :key="item.situation">
            <q-item-section>
              <h3 class="text-subtitle2 text-weight-bold q-my-none">{{ item.situation }}</h3>
              <q-item-label caption class="text-grey-7">{{ item.action }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideAvoidMissingCalvingDates.reviewOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-sm">
          {{ t('guideAvoidMissingCalvingDates.reviewTitle') }}
        </h2>
        <p class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideAvoidMissingCalvingDates.reviewDescription') }}
        </p>

        <q-list>
          <q-item v-for="item in reviewItems" :key="item">
            <q-item-section avatar>
              <q-icon name="check_circle" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideAvoidMissingCalvingDates.unknownOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-sm">
          {{ t('guideAvoidMissingCalvingDates.unknownTitle') }}
        </h2>
        <p class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideAvoidMissingCalvingDates.unknownDescription') }}
        </p>
        <q-btn
          outline
          color="primary"
          icon="report_problem"
          :label="t('guideAvoidMissingCalvingDates.openLostRecordsGuide')"
          :to="lostRecordsGuidePath"
        />
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideAvoidMissingCalvingDates.breedzOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-sm">
          {{ t('guideAvoidMissingCalvingDates.breedzTitle') }}
        </h2>
        <p class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideAvoidMissingCalvingDates.breedzDescription') }}
        </p>

        <q-list>
          <q-item v-for="item in breedzItems" :key="item">
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
          :label="t('guideAvoidMissingCalvingDates.openApp')"
          to="/"
          class="q-mt-md"
        />
      </q-card-section>

      <GuideFaqSection
        :overline="t('guideAvoidMissingCalvingDates.faqOverline')"
        :title="t('guideAvoidMissingCalvingDates.faqTitle')"
        :faqs="faqs"
      />

      <GuideSourcesSection :sources="sources" />

      <GuideRelatedLink
        :title="t('guideCattleGestationCalculator.title')"
        :description="t('guideCattleGestationCalculator.description')"
        :to="gestationCalculatorPath"
      />

      <GuideShareSection
        :title="t('guideAvoidMissingCalvingDates.title')"
        :path="sharePath"
      />
    </q-card>
  </AppPageShell>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppPageShell from 'src/components/AppPageShell.vue'
import GuideAttribution from 'src/components/GuideAttribution.vue'
import GuideBreadcrumbs from 'src/components/GuideBreadcrumbs.vue'
import GuideFaqSection from 'src/components/GuideFaqSection.vue'
import GuideRelatedLink from 'src/components/GuideRelatedLink.vue'
import GuideShareSection from 'src/components/GuideShareSection.vue'
import GuideSourcesSection from 'src/components/GuideSourcesSection.vue'
import { useGuideMeta } from 'src/composables/useGuideMeta'
import { useI18nText } from 'src/i18n'
import { buildLocalizedPath, localeFromPath, routeSegmentToLocale } from 'src/utils/localeRouting'

const { t, tm } = useI18nText()
const route = useRoute()
const routeLocale = computed(() =>
  typeof route.params.locale === 'string' && route.params.locale
    ? routeSegmentToLocale(route.params.locale)
    : localeFromPath(route.path) || 'en',
)

const faqs = computed(() => tm('guideAvoidMissingCalvingDates.faqs') ?? [])
const guide = useGuideMeta('avoidMissingCalvingDates', t, routeLocale, { faqs })

const lostRecordsGuidePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/lost-breeding-records-what-to-do'),
)
const gestationCalculatorPath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/cattle-gestation-calculator'),
)
const sharePath = computed(() => buildLocalizedPath(routeLocale.value, guide.internalPath))
const recordItems = computed(() => tm('guideAvoidMissingCalvingDates.recordItems') ?? [])
const windowItems = computed(() => tm('guideAvoidMissingCalvingDates.windowItems') ?? [])
const reviewItems = computed(() => tm('guideAvoidMissingCalvingDates.reviewItems') ?? [])
const breedzItems = computed(() => tm('guideAvoidMissingCalvingDates.breedzItems') ?? [])

const sources = [
  {
    title: 'Calving Book',
    publisher: 'North Dakota State University Extension',
    url: 'https://www.ndsu.edu/agriculture/extension/publications/calving-book',
  },
  {
    title: 'So You Want to Raise Beef Cattle?',
    publisher: 'Penn State Extension',
    url: 'https://extension.psu.edu/so-you-want-to-raise-beef-cattle',
  },
  {
    title: 'Overview of Prolonged Gestation in Cattle and Sheep',
    publisher: 'Merck Veterinary Manual',
    url: 'https://www.merckvetmanual.com/reproductive-system/prolonged-gestation-in-cattle-and-sheep/overview-of-prolonged-gestation-in-cattle-and-sheep',
  },
  {
    title: 'Monitoring calving traits to improve cow and calf health',
    publisher: 'University of Minnesota Extension',
    url: 'https://extension.umn.edu/dairy-milking-cows/calving-traits',
  },
]
</script>
