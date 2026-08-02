<template>
  <AppPageShell>
    <q-card flat tag="article">
      <q-card-section tag="header">
        <GuideBreadcrumbs :title="t('guideCattleRecordKeeping.title')" />
        <div class="text-overline text-weight-bold text-primary">{{ t('guideCattleRecordKeeping.overline') }}</div>
        <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
          {{ t('guideCattleRecordKeeping.title') }}
        </h1>
        <div class="text-body1 text-grey-7">
          {{ t('guideCattleRecordKeeping.description') }}
        </div>
        <GuideAttribution :published-at="guide.publishedAt" :modified-at="guide.modifiedAt" />
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideCattleRecordKeeping.problemOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleRecordKeeping.problemTitle') }}
        </h2>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideCattleRecordKeeping.problemDescription') }}
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

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideCattleRecordKeeping.methodsOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleRecordKeeping.methodsTitle') }}
        </h2>
        <div class="column q-gutter-md">
          <q-card
            v-for="method in methods"
            :key="method.title"
            flat
            bordered
          >
            <q-card-section>
              <h3 class="text-subtitle1 text-weight-bold text-primary q-my-none">{{ method.title }}</h3>
              <div class="text-body2 text-grey-7 q-mt-sm">{{ method.description }}</div>
              <q-list dense class="q-mt-sm">
                <q-item v-for="item in method.items" :key="item">
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
          {{ t('guideCattleRecordKeeping.bestOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleRecordKeeping.bestTitle') }}
        </h2>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideCattleRecordKeeping.bestDescription') }}
        </div>

        <q-list>
          <q-item v-for="item in bestItems" :key="item">
            <q-item-section avatar>
              <q-icon name="task_alt" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-banner rounded class="bg-grey-1 text-grey-8 q-mt-md">
          <template #avatar>
            <q-icon name="fact_check" color="primary" />
          </template>
          {{ t('guideCattleRecordKeeping.bestBanner') }}
        </q-banner>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideCattleRecordKeeping.compareOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleRecordKeeping.compareTitle') }}
        </h2>

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

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideCattleRecordKeeping.breedzOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleRecordKeeping.breedzTitle') }}
        </h2>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideCattleRecordKeeping.breedzDescription') }}
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

        <q-btn
          unelevated
          color="primary"
          icon="open_in_new"
          :label="t('guideCattleRecordKeeping.openApp')"
          :to="dashboardPath"
          class="q-mt-md"
        />
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideCattleRecordKeeping.checklistOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleRecordKeeping.checklistTitle') }}
        </h2>

        <q-list>
          <q-item v-for="item in checklistItems" :key="item">
            <q-item-section avatar>
              <q-icon name="done_all" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <GuideFaqSection
        :overline="t('guideCattleRecordKeeping.faqOverline')"
        :title="t('guideCattleRecordKeeping.faqTitle')"
        :faqs="faqs"
      />

      <GuideSourcesSection :sources="sources" />

      <GuideRelatedLink
        :title="t('guideBreedingRecordsApp.title')"
        :description="t('guideBreedingRecordsApp.description')"
        :to="breedingRecordsAppGuidePath"
      />

      <GuideShareSection
        :title="t('guideCattleRecordKeeping.title')"
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

const guide = useGuideMeta('cattleRecordKeeping', t, routeLocale)

const dashboardPath = computed(() => '/')
const breedingRecordsAppGuidePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/breeding-records-app'),
)
const sharePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/best-cattle-record-keeping-methods'),
)
const sources = [
  {
    title: 'Record Keeping for the Beef Herd',
    publisher: 'University of Maryland Extension',
    url: 'https://extension.umd.edu/resource/record-keeping-beef-herd/',
  },
  {
    title: 'How to Evaluate Animal Performance in the Cow-Calf Herd',
    publisher: 'University of Maryland Extension',
    url: 'https://extension.umd.edu/resource/how-evaluate-animal-performance-cow-calf-herd/',
  },
  {
    title: 'Cow-Calf Production Record Software',
    publisher: 'Oklahoma State University Extension',
    url: 'https://extension.okstate.edu/fact-sheets/cow-calf-production-record-software.html',
  },
  {
    title: 'Managing What You Measure',
    publisher: 'North Dakota State University Extension',
    url: 'https://www.ndsu.edu/agriculture/extension/publications/managing-what-you-measure-current-and-historical-cow-herd-appraisal',
  },
]
const problemItems = computed(() => tm('guideCattleRecordKeeping.problemItems') ?? [])
const methods = computed(() => tm('guideCattleRecordKeeping.methods') ?? [])
const bestItems = computed(() => tm('guideCattleRecordKeeping.bestItems') ?? [])
const compareItems = computed(() => tm('guideCattleRecordKeeping.compareItems') ?? [])
const breedzItems = computed(() => tm('guideCattleRecordKeeping.breedzItems') ?? [])
const checklistItems = computed(() => tm('guideCattleRecordKeeping.checklistItems') ?? [])
const faqs = computed(() => tm('guideCattleRecordKeeping.faqs') ?? [])
</script>
