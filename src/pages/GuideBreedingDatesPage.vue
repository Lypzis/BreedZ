<template>
  <AppPageShell>
    <q-card flat tag="article">
      <q-card-section tag="header">
        <GuideBreadcrumbs :title="t('guideBreedingDates.title')" />
        <div class="text-overline text-weight-bold text-primary">{{ t('guideBreedingDates.overline') }}</div>
        <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
          {{ t('guideBreedingDates.title') }}
        </h1>
        <div class="text-body1 text-grey-7">
          {{ t('guideBreedingDates.description') }}
        </div>
        <GuideAttribution :published-at="guide.publishedAt" :modified-at="guide.modifiedAt" />
      </q-card-section>

      <q-card-section tag="section">
        <q-banner rounded class="bg-green-1 text-primary">
          <template #avatar>
            <q-icon name="fact_check" color="primary" />
          </template>
          <span class="text-weight-bold">{{ t('guideBreedingDates.shortAnswerLabel') }}</span>
          {{ ` ${t('guideBreedingDates.shortAnswer')}` }}
        </q-banner>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideBreedingDates.minimumRecordOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideBreedingDates.minimumRecordTitle') }}
        </h2>
        <p class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideBreedingDates.minimumRecordDescription') }}
        </p>

        <q-markup-table flat bordered wrap-cells class="text-left">
          <thead>
            <tr>
              <th>{{ t('guideBreedingDates.minimumRecordColumn') }}</th>
              <th>{{ t('guideBreedingDates.minimumWhyColumn') }}</th>
              <th>{{ t('guideBreedingDates.minimumNextColumn') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in minimumRecordRows" :key="row.record">
              <td>{{ row.record }}</td>
              <td>{{ row.why }}</td>
              <td>{{ row.next }}</td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>

      <q-card-section tag="section">
        <figure class="q-ma-none">
          <q-img
            src="/images/landing/breeding-event.png"
            :alt="t('guideBreedingDates.screenshotAlt')"
            fit="contain"
            class="rounded-borders bg-grey-1"
          />
          <figcaption class="text-caption text-grey-7 q-mt-sm">
            {{ t('guideBreedingDates.screenshotCaption') }}
          </figcaption>
        </figure>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideBreedingDates.problemOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideBreedingDates.problemTitle') }}
        </h2>

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

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideBreedingDates.logicOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideBreedingDates.logicTitle') }}
        </h2>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideBreedingDates.logicDescription') }}
        </div>

        <q-list>
          <q-item v-for="step in logicSteps" :key="step">
            <q-item-section avatar>
              <q-icon name="check_circle" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ step }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-banner rounded class="bg-grey-1 text-grey-8 q-mt-md">
          <template #avatar>
            <q-icon name="event" color="primary" />
          </template>
          <span class="text-weight-medium">{{ t('guideBreedingDates.exampleLabel') }}</span>
          {{ ` ${t('guideBreedingDates.exampleText')}` }}
        </q-banner>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideBreedingDates.commonWaysOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideBreedingDates.commonWaysTitle') }}
        </h2>

        <q-list>
          <q-item v-for="item in commonWaysItems" :key="item">
            <q-item-section avatar>
              <q-icon name="description" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideBreedingDates.mistakesOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideBreedingDates.mistakesTitle') }}
        </h2>

        <q-list>
          <q-item v-for="item in mistakesItems" :key="item">
            <q-item-section avatar>
              <q-icon name="report_problem" color="accent" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideBreedingDates.breaksOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideBreedingDates.breaksTitle') }}
        </h2>

        <q-list>
          <q-item v-for="item in breaksItems" :key="item">
            <q-item-section avatar>
              <q-icon name="error_outline" color="accent" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideBreedingDates.betterWayOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideBreedingDates.betterWayTitle') }}
        </h2>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideBreedingDates.betterWayDescription') }}
        </div>

        <q-list>
          <q-item v-for="item in betterWayItems" :key="item">
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
          :label="t('guideBreedingDates.openApp')"
          :to="dashboardPath"
          class="q-mt-md"
        />
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideBreedingDates.tipsOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideBreedingDates.tipsTitle') }}
        </h2>

        <q-list>
          <q-item v-for="item in tipsItems" :key="item">
            <q-item-section avatar>
              <q-icon name="lightbulb" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <GuideFaqSection
        :overline="t('guideBreedingDates.faqOverline')"
        :title="t('guideBreedingDates.faqTitle')"
        :faqs="faqs"
      />

      <GuideSourcesSection :sources="sources" />

      <GuideRelatedLink
        :title="t('guideCattleGestationCalculator.title')"
        :description="t('guideCattleGestationCalculator.description')"
        :to="gestationCalculatorPath"
      />

      <GuideRelatedLink
        :title="t('guideLostBreedingRecords.title')"
        :description="t('guideLostBreedingRecords.description')"
        :to="lostRecordsPath"
      />

      <GuideShareSection
        :title="t('guideBreedingDates.title')"
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

const guide = useGuideMeta('breedingDates', t, routeLocale)

const dashboardPath = computed(() => '/')
const gestationCalculatorPath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/cattle-gestation-calculator'),
)
const lostRecordsPath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/lost-breeding-records-what-to-do'),
)
const sharePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/track-cattle-breeding-dates'),
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
    title: 'Overview of Prolonged Gestation in Cattle and Sheep',
    publisher: 'Merck Veterinary Manual',
    url: 'https://www.merckvetmanual.com/reproductive-system/prolonged-gestation-in-cattle-and-sheep/overview-of-prolonged-gestation-in-cattle-and-sheep',
  },
]
const problemItems = computed(() => tm('guideBreedingDates.problemItems') ?? [])
const minimumRecordRows = computed(() => tm('guideBreedingDates.minimumRecordRows') ?? [])
const logicSteps = computed(() => tm('guideBreedingDates.logicSteps') ?? [])
const commonWaysItems = computed(() => tm('guideBreedingDates.commonWaysItems') ?? [])
const mistakesItems = computed(() => tm('guideBreedingDates.mistakesItems') ?? [])
const breaksItems = computed(() => tm('guideBreedingDates.breaksItems') ?? [])
const betterWayItems = computed(() => tm('guideBreedingDates.betterWayItems') ?? [])
const tipsItems = computed(() => tm('guideBreedingDates.tipsItems') ?? [])
const faqs = computed(() => tm('guideBreedingDates.faqs') ?? [])
</script>
