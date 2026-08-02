<template>
  <AppPageShell>
    <q-card flat tag="article">
      <q-card-section tag="header">
        <GuideBreadcrumbs :title="t('guideCowPregnancy.title')" />
        <div class="text-overline text-weight-bold text-primary">{{ t('guideCowPregnancy.overline') }}</div>
        <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
          {{ t('guideCowPregnancy.title') }}
        </h1>
        <div class="text-body1 text-grey-7">
          {{ t('guideCowPregnancy.description') }}
        </div>
        <GuideAttribution :published-at="guide.publishedAt" :modified-at="guide.modifiedAt" />
      </q-card-section>

      <q-card-section tag="section">
        <q-banner rounded class="bg-green-1 text-primary">
          <template #avatar>
            <q-icon name="event_available" color="primary" />
          </template>
          <span class="text-weight-bold">{{ t('guideCowPregnancy.shortAnswerLabel') }}</span>
          {{ ` ${t('guideCowPregnancy.shortAnswer')}` }}
        </q-banner>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideCowPregnancy.quickTableOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCowPregnancy.quickTableTitle') }}
        </h2>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideCowPregnancy.quickTableDescription') }}
        </div>

        <q-markup-table flat bordered class="text-left">
          <thead>
            <tr>
              <th>{{ t('guideCowPregnancy.quickTableQuestion') }}</th>
              <th>{{ t('guideCowPregnancy.quickTableAnswer') }}</th>
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
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideCowPregnancy.timelineOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCowPregnancy.timelineTitle') }}
        </h2>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideCowPregnancy.timelineDescription') }}
        </div>

        <q-list>
          <q-item v-for="item in timelineItems" :key="item">
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
          {{ t('guideCowPregnancy.variationOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCowPregnancy.variationTitle') }}
        </h2>

        <q-list>
          <q-item v-for="item in variationItems" :key="item">
            <q-item-section avatar>
              <q-icon name="info" color="accent" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideCowPregnancy.trackingOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCowPregnancy.trackingTitle') }}
        </h2>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideCowPregnancy.trackingDescription') }}
        </div>

        <div class="column q-gutter-md">
          <q-card v-for="step in trackingSteps" :key="step.title" flat bordered>
            <q-card-section>
              <h3 class="text-subtitle1 text-weight-bold text-primary q-my-none">{{ step.title }}</h3>
              <div class="text-body2 text-grey-7 q-mt-sm">{{ step.description }}</div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideCowPregnancy.mistakesOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCowPregnancy.mistakesTitle') }}
        </h2>

        <q-list>
          <q-item v-for="item in mistakeItems" :key="item">
            <q-item-section avatar>
              <q-icon name="warning_amber" color="accent" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideCowPregnancy.breedzOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCowPregnancy.breedzTitle') }}
        </h2>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideCowPregnancy.breedzDescription') }}
        </div>

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

        <div class="row q-col-gutter-sm q-mt-md">
          <div class="col-12 col-sm-auto">
            <q-btn
              unelevated
              color="primary"
              icon="open_in_new"
              :label="t('guideCowPregnancy.openApp')"
              :to="dashboardPath"
              class="full-width"
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn
              outline
              color="primary"
              icon="event"
              :label="t('guideCowPregnancy.openBreedingDatesGuide')"
              :to="breedingDatesGuidePath"
              class="full-width"
            />
          </div>
        </div>
      </q-card-section>

      <GuideFaqSection
        :overline="t('guideCowPregnancy.faqOverline')"
        :title="t('guideCowPregnancy.faqTitle')"
        :faqs="faqs"
      />

      <GuideSourcesSection :sources="sources" />

      <GuideRelatedLink
        :title="t('guideBreedingDates.title')"
        :description="t('guideBreedingDates.description')"
        :to="breedingDatesGuidePath"
      />

      <GuideShareSection
        :title="t('guideCowPregnancy.title')"
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

const guide = useGuideMeta('cowPregnancy', t, routeLocale)

const dashboardPath = computed(() => '/')
const breedingDatesGuidePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/track-cattle-breeding-dates'),
)
const sharePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/how-long-is-cow-pregnancy'),
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
    title: 'Pregnancy Determination in Cattle',
    publisher: 'Merck Veterinary Manual',
    url: 'https://www.merckvetmanual.com/management-and-nutrition/management-of-reproduction-cattle/pregnancy-determination-in-cattle',
  },
  {
    title: 'Management of Calving in Cattle',
    publisher: 'Merck Veterinary Manual',
    url: 'https://www.merckvetmanual.com/management-and-nutrition/management-of-reproduction-cattle/management-of-calving-in-cattle',
  },
]
const quickTableRows = computed(() => tm('guideCowPregnancy.quickTableRows') ?? [])
const timelineItems = computed(() => tm('guideCowPregnancy.timelineItems') ?? [])
const variationItems = computed(() => tm('guideCowPregnancy.variationItems') ?? [])
const trackingSteps = computed(() => tm('guideCowPregnancy.trackingSteps') ?? [])
const mistakeItems = computed(() => tm('guideCowPregnancy.mistakeItems') ?? [])
const breedzItems = computed(() => tm('guideCowPregnancy.breedzItems') ?? [])
const faqs = computed(() => tm('guideCowPregnancy.faqs') ?? [])
</script>
