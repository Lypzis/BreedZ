<template>
  <AppPageShell>
    <q-card flat tag="article">
      <q-card-section tag="header">
        <GuideBreadcrumbs :title="t('guideLostBreedingRecords.title')" />
        <div class="text-overline text-weight-bold text-primary">{{ t('guideLostBreedingRecords.overline') }}</div>
        <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
          {{ t('guideLostBreedingRecords.title') }}
        </h1>
        <div class="text-body1 text-grey-7">
          {{ t('guideLostBreedingRecords.description') }}
        </div>
        <GuideAttribution :published-at="guide.publishedAt" :modified-at="guide.modifiedAt" />
      </q-card-section>

      <q-card-section tag="section">
        <q-banner rounded class="bg-green-1 text-primary">
          <template #avatar>
            <q-icon name="fact_check" color="primary" />
          </template>
          <span class="text-weight-bold">{{ t('guideLostBreedingRecords.shortAnswerLabel') }}</span>
          {{ ` ${t('guideLostBreedingRecords.shortAnswer')}` }}
        </q-banner>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideLostBreedingRecords.evidenceOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideLostBreedingRecords.evidenceTitle') }}
        </h2>
        <p class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideLostBreedingRecords.evidenceDescription') }}
        </p>
        <ol class="q-pl-lg q-my-none">
          <li v-for="item in evidenceItems" :key="item.title" class="q-mb-md">
            <h3 class="text-subtitle1 text-weight-bold text-primary q-my-none">{{ item.title }}</h3>
            <p class="text-body2 text-grey-7 q-mt-xs q-mb-none">{{ item.description }}</p>
          </li>
        </ol>
      </q-card-section>

      <q-card-section tag="section">
        <figure class="q-ma-none">
          <q-img
            src="/images/landing/paper-notes.webp"
            :alt="t('guideLostBreedingRecords.screenshotAlt')"
            fit="cover"
            :ratio="4 / 3"
            class="rounded-borders"
          />
          <figcaption class="text-caption text-grey-7 q-mt-sm">
            {{ t('guideLostBreedingRecords.screenshotCaption') }}
          </figcaption>
        </figure>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideLostBreedingRecords.firstOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideLostBreedingRecords.firstTitle') }}
        </h2>
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

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideLostBreedingRecords.rebuildOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideLostBreedingRecords.rebuildTitle') }}
        </h2>
        <div class="column q-gutter-md">
          <q-card
            v-for="step in rebuildSteps"
            :key="step.title"
            flat
            bordered
          >
            <q-card-section>
              <h3 class="text-subtitle1 text-weight-bold text-primary q-my-none">{{ step.title }}</h3>
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

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideLostBreedingRecords.estimateOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideLostBreedingRecords.estimateTitle') }}
        </h2>
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

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideLostBreedingRecords.saveOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideLostBreedingRecords.saveTitle') }}
        </h2>
        <p class="text-body1 text-grey-7 q-mb-md">{{ t('guideLostBreedingRecords.saveDescription') }}</p>
        <q-markup-table flat bordered wrap-cells class="text-left">
          <thead>
            <tr>
              <th>{{ t('guideLostBreedingRecords.saveEvidenceColumn') }}</th>
              <th>{{ t('guideLostBreedingRecords.saveDateColumn') }}</th>
              <th>{{ t('guideLostBreedingRecords.saveNoteColumn') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in saveRows" :key="row.evidence">
              <td>{{ row.evidence }}</td>
              <td>{{ row.date }}</td>
              <td>{{ row.note }}</td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideLostBreedingRecords.avoidOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideLostBreedingRecords.avoidTitle') }}
        </h2>

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

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideLostBreedingRecords.systemOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideLostBreedingRecords.systemTitle') }}
        </h2>
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

      <GuideFaqSection
        :overline="t('guideLostBreedingRecords.faqOverline')"
        :title="t('guideLostBreedingRecords.faqTitle')"
        :faqs="faqs"
      />

      <GuideSourcesSection :sources="sources" />

      <GuideRelatedLink
        :title="t('guideBreedingRecordsApp.title')"
        :description="t('guideBreedingRecordsApp.description')"
        :to="breedingRecordsAppGuidePath"
      />

      <GuideRelatedLink
        :title="t('guideBreedingDates.title')"
        :description="t('guideBreedingDates.description')"
        :to="breedingDatesGuidePath"
      />

      <GuideShareSection
        :title="t('guideLostBreedingRecords.title')"
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

const GUIDE_PATH = '/guides/lost-breeding-records-what-to-do'

const { t, tm } = useI18nText()
const route = useRoute()
const routeLocale = computed(() =>
  typeof route.params.locale === 'string' && route.params.locale
    ? routeSegmentToLocale(route.params.locale)
    : localeFromPath(route.path) || 'en',
)

const guide = useGuideMeta('lostBreedingRecords', t, routeLocale)

const dashboardPath = computed(() => '/')
const breedingRecordsAppGuidePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/breeding-records-app'),
)
const breedingDatesGuidePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/track-cattle-breeding-dates'),
)
const sharePath = computed(() => buildLocalizedPath(routeLocale.value, GUIDE_PATH))
const sources = [
  {
    title: 'Record Keeping for the Beef Herd',
    publisher: 'University of Maryland Extension',
    url: 'https://extension.umd.edu/resource/record-keeping-beef-herd/',
  },
  {
    title: 'Calving Records 101',
    publisher: 'South Dakota State University Extension',
    url: 'https://extension.sdstate.edu/calving-records-101',
  },
  {
    title: 'Whole Herd Reporting',
    publisher: 'Beef Improvement Federation Guidelines',
    url: 'https://guidelines.beefimprovement.org/index.php/Whole_Herd_Reporting',
  },
  {
    title: 'Cow-Calf Standardized Performance Analysis (SPA)',
    publisher: 'Oklahoma State University Extension',
    url: 'https://extension.okstate.edu/fact-sheets/cow-calf-standardized-performance-analysis-spa-1.html',
  },
]
const firstItems = computed(() => tm('guideLostBreedingRecords.firstItems') ?? [])
const evidenceItems = computed(() => tm('guideLostBreedingRecords.evidenceItems') ?? [])
const rebuildSteps = computed(() => tm('guideLostBreedingRecords.rebuildSteps') ?? [])
const estimateItems = computed(() => tm('guideLostBreedingRecords.estimateItems') ?? [])
const avoidItems = computed(() => tm('guideLostBreedingRecords.avoidItems') ?? [])
const systemItems = computed(() => tm('guideLostBreedingRecords.systemItems') ?? [])
const saveRows = computed(() => tm('guideLostBreedingRecords.saveRows') ?? [])
const faqs = computed(() => tm('guideLostBreedingRecords.faqs') ?? [])
</script>
