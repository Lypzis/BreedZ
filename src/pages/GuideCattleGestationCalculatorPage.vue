<template>
  <AppPageShell>
    <q-card flat tag="article">
      <q-card-section tag="header">
        <GuideBreadcrumbs :title="t('guideCattleGestationCalculator.title')" />
        <div class="text-overline text-weight-bold text-primary">{{ t('guideCattleGestationCalculator.overline') }}</div>
        <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
          {{ t('guideCattleGestationCalculator.title') }}
        </h1>
        <div class="text-body1 text-grey-7">
          {{ t('guideCattleGestationCalculator.description') }}
        </div>
        <GuideAttribution :published-at="guide.publishedAt" :modified-at="guide.modifiedAt" />
      </q-card-section>

      <q-card-section tag="section">
        <q-banner rounded class="bg-green-1 text-primary">
          <template #avatar>
            <q-icon name="event_available" color="primary" />
          </template>
          <span class="text-weight-bold">{{ t('guideCattleGestationCalculator.shortAnswerLabel') }}</span>
          {{ ` ${t('guideCattleGestationCalculator.shortAnswer')}` }}
        </q-banner>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideCattleGestationCalculator.calculatorOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleGestationCalculator.calculatorTitle') }}
        </h2>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideCattleGestationCalculator.calculatorDescription') }}
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="breedingDate"
              outlined
              type="date"
              :label="t('guideCattleGestationCalculator.breedingDateLabel')"
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              v-model.number="gestationDays"
              outlined
              type="number"
              min="250"
              max="310"
              :label="t('guideCattleGestationCalculator.gestationDaysLabel')"
              :error="!isGestationDaysValid"
              :error-message="t('guideCattleGestationCalculator.gestationDaysError')"
            />
          </div>
        </div>

        <output aria-live="polite">
          <q-banner rounded class="bg-green-1 text-primary q-mt-md">
            <template #avatar>
              <q-icon name="event_available" color="primary" />
            </template>
            <div class="column q-gutter-xs">
              <div>
                <span class="text-weight-bold">{{ t('guideCattleGestationCalculator.estimatedCalvingDate') }}:</span>
                {{ estimatedCalvingDateLabel }}
              </div>
              <div>
                <span class="text-weight-bold">{{ t('guideCattleGestationCalculator.watchWindow') }}:</span>
                {{ watchWindowLabel }}
              </div>
            </div>
          </q-banner>
        </output>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideCattleGestationCalculator.exampleOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleGestationCalculator.exampleTitle') }}
        </h2>
        <p class="text-body1 text-grey-7">{{ t('guideCattleGestationCalculator.exampleDescription') }}</p>
        <figure class="q-ma-none q-mt-md">
          <q-img
            src="/images/landing/expected-birth.png"
            :alt="t('guideCattleGestationCalculator.screenshotAlt')"
            fit="contain"
            class="rounded-borders bg-grey-1"
          />
          <figcaption class="text-caption text-grey-7 q-mt-sm">
            {{ t('guideCattleGestationCalculator.screenshotCaption') }}
          </figcaption>
        </figure>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideCattleGestationCalculator.howItWorksOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleGestationCalculator.howItWorksTitle') }}
        </h2>

        <q-list>
          <q-item v-for="item in howItWorksItems" :key="item">
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
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideCattleGestationCalculator.quickTableOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleGestationCalculator.quickTableTitle') }}
        </h2>

        <q-markup-table flat bordered class="text-left">
          <thead>
            <tr>
              <th>{{ t('guideCattleGestationCalculator.quickTableQuestion') }}</th>
              <th>{{ t('guideCattleGestationCalculator.quickTableAnswer') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in quickTableRows" :key="row.question">
              <td>{{ row.question }}</td>
              <td>{{ row.answer }}</td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideCattleGestationCalculator.recordkeepingOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleGestationCalculator.recordkeepingTitle') }}
        </h2>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideCattleGestationCalculator.recordkeepingDescription') }}
        </div>

        <q-list>
          <q-item v-for="item in recordkeepingItems" :key="item">
            <q-item-section avatar>
              <q-icon name="assignment" color="accent" />
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
              :label="t('guideCattleGestationCalculator.openApp')"
              :to="dashboardPath"
              class="full-width"
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn
              outline
              color="primary"
              icon="event"
              :label="t('guideCattleGestationCalculator.openPregnancyGuide')"
              :to="cowPregnancyGuidePath"
              class="full-width"
            />
          </div>
        </div>
      </q-card-section>

      <GuideFaqSection
        :overline="t('guideCattleGestationCalculator.faqOverline')"
        :title="t('guideCattleGestationCalculator.faqTitle')"
        :faqs="faqs"
      />

      <GuideSourcesSection :sources="sources" />

      <GuideRelatedLink
        :title="t('guideCowPregnancy.title')"
        :description="t('guideCowPregnancy.description')"
        :to="cowPregnancyGuidePath"
      />

      <GuideRelatedLink
        :title="t('guideBreedingDates.title')"
        :description="t('guideBreedingDates.description')"
        :to="breedingDatesGuidePath"
      />

      <GuideShareSection
        :title="t('guideCattleGestationCalculator.title')"
        :path="sharePath"
      />
    </q-card>
  </AppPageShell>
</template>

<script setup>
import { computed, ref } from 'vue'
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
import { formatDisplayDate, todayDateString } from 'src/utils/dates'
import { buildGestationWatchWindow } from 'src/utils/gestation'
import { buildLocalizedPath, localeFromPath, routeSegmentToLocale } from 'src/utils/localeRouting'

const { t, tm } = useI18nText()
const route = useRoute()
const routeLocale = computed(() =>
  typeof route.params.locale === 'string' && route.params.locale
    ? routeSegmentToLocale(route.params.locale)
    : localeFromPath(route.path) || 'en',
)

const guide = useGuideMeta('cattleGestationCalculator', t, routeLocale)

const breedingDate = ref(todayDateString())
const gestationDays = ref(283)
const dashboardPath = computed(() => '/')
const cowPregnancyGuidePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/how-long-is-cow-pregnancy'),
)
const breedingDatesGuidePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/track-cattle-breeding-dates'),
)
const sharePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/cattle-gestation-calculator'),
)
const sources = [
  {
    title: 'Beef & Dairy Cattle Gestation and Calving Date Calculator',
    publisher: 'University of Wisconsin-Madison Division of Extension',
    url: 'https://livestock.extension.wisc.edu/articles/beef-dairy-cattle-gestation-and-calving-date-calculator/',
  },
  {
    title: 'Calving Book',
    publisher: 'North Dakota State University Extension',
    url: 'https://www.ndsu.edu/agriculture/extension/publications/calving-book',
  },
  {
    title: 'Management of Calving in Cattle',
    publisher: 'Merck Veterinary Manual',
    url: 'https://www.merckvetmanual.com/management-and-nutrition/management-of-reproduction-cattle/management-of-calving-in-cattle',
  },
  {
    title: 'Pregnancy Determination in Cattle',
    publisher: 'Merck Veterinary Manual',
    url: 'https://www.merckvetmanual.com/management-and-nutrition/management-of-reproduction-cattle/pregnancy-determination-in-cattle',
  },
]
const howItWorksItems = computed(() => tm('guideCattleGestationCalculator.howItWorksItems') ?? [])
const quickTableRows = computed(() => tm('guideCattleGestationCalculator.quickTableRows') ?? [])
const recordkeepingItems = computed(() => tm('guideCattleGestationCalculator.recordkeepingItems') ?? [])
const faqs = computed(() => tm('guideCattleGestationCalculator.faqs') ?? [])
const isGestationDaysValid = computed(() => {
  const days = Number(gestationDays.value)
  return Number.isFinite(days) && days >= 250 && days <= 310
})
const estimate = computed(() =>
  isGestationDaysValid.value
    ? buildGestationWatchWindow(breedingDate.value, Number(gestationDays.value), 7)
    : { estimatedDate: '', windowStart: '', windowEnd: '' },
)
const estimatedCalvingDate = computed(() => estimate.value.estimatedDate)
const watchWindowStart = computed(() => estimate.value.windowStart)
const watchWindowEnd = computed(() => estimate.value.windowEnd)
const estimatedCalvingDateLabel = computed(() =>
  estimatedCalvingDate.value ? formatDisplayDate(estimatedCalvingDate.value) : t('common.dateNotSet'),
)
const watchWindowLabel = computed(() => {
  if (!watchWindowStart.value || !watchWindowEnd.value) {
    return t('common.dateNotSet')
  }

  return `${formatDisplayDate(watchWindowStart.value)} - ${formatDisplayDate(watchWindowEnd.value)}`
})

</script>
