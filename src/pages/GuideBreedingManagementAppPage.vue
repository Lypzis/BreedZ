<template>
  <AppPageShell>
    <q-card flat tag="article">
      <q-card-section tag="header">
        <GuideBreadcrumbs :title="t('guideBreedingManagementApp.title')" />
        <div class="text-overline text-weight-bold text-primary">{{ t('guideBreedingManagementApp.overline') }}</div>
        <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
          {{ t('guideBreedingManagementApp.title') }}
        </h1>
        <div class="text-body1 text-grey-7">
          {{ t('guideBreedingManagementApp.description') }}
        </div>
        <GuideAttribution :published-at="guide.publishedAt" :modified-at="guide.modifiedAt" />
      </q-card-section>

      <q-card-section tag="section">
        <q-banner rounded class="bg-green-1 text-primary">
          <template #avatar>
            <q-icon name="event_repeat" color="primary" />
          </template>
          <span class="text-weight-bold">{{ t('guideBreedingManagementApp.shortAnswerLabel') }}</span>
          {{ ` ${t('guideBreedingManagementApp.shortAnswer')}` }}
        </q-banner>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideBreedingManagementApp.problemOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideBreedingManagementApp.problemTitle') }}
        </h2>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideBreedingManagementApp.problemDescription') }}
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
          {{ t('guideBreedingManagementApp.workflowOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideBreedingManagementApp.workflowTitle') }}
        </h2>

        <div class="column q-gutter-md">
          <q-card v-for="item in workflowItems" :key="item.title" flat bordered>
            <q-card-section>
              <h3 class="text-subtitle1 text-weight-bold text-primary q-my-none">{{ item.title }}</h3>
              <div class="text-body2 text-grey-7 q-mt-sm">{{ item.description }}</div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideBreedingManagementApp.mustHaveOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideBreedingManagementApp.mustHaveTitle') }}
        </h2>

        <q-list>
          <q-item v-for="item in mustHaveItems" :key="item">
            <q-item-section avatar>
              <q-icon name="task_alt" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideBreedingManagementApp.avoidOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideBreedingManagementApp.avoidTitle') }}
        </h2>

        <q-list>
          <q-item v-for="item in avoidItems" :key="item">
            <q-item-section avatar>
              <q-icon name="remove_circle_outline" color="accent" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideBreedingManagementApp.breedzOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideBreedingManagementApp.breedzTitle') }}
        </h2>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideBreedingManagementApp.breedzDescription') }}
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
              :label="t('guideBreedingManagementApp.openApp')"
              :to="dashboardPath"
              class="full-width"
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn
              outline
              color="primary"
              icon="phone_iphone"
              :label="t('guideBreedingManagementApp.openRecordsGuide')"
              :to="recordsAppGuidePath"
              class="full-width"
            />
          </div>
        </div>
      </q-card-section>

      <GuideFaqSection
        :overline="t('guideBreedingManagementApp.faqOverline')"
        :title="t('guideBreedingManagementApp.faqTitle')"
        :faqs="faqs"
      />

      <GuideSourcesSection :sources="sources" />

      <GuideRelatedLink
        :title="t('guideBreedingRecordsApp.title')"
        :description="t('guideBreedingRecordsApp.description')"
        :to="recordsAppGuidePath"
      />

      <GuideShareSection
        :title="t('guideBreedingManagementApp.title')"
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

const guide = useGuideMeta('breedingManagementApp', t, routeLocale)

const dashboardPath = computed(() => '/')
const recordsAppGuidePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/breeding-records-app'),
)
const sharePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/breeding-management-app'),
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
    title: 'Pregnancy Determination in Cattle',
    publisher: 'Merck Veterinary Manual',
    url: 'https://www.merckvetmanual.com/management-and-nutrition/management-of-reproduction-cattle/pregnancy-determination-in-cattle',
  },
  {
    title: 'Management of Calving in Cattle',
    publisher: 'Merck Veterinary Manual',
    url: 'https://www.merckvetmanual.com/management-and-nutrition/management-of-reproduction-cattle/management-of-calving-in-cattle',
  },
  {
    title: 'Calving Book',
    publisher: 'North Dakota State University Extension',
    url: 'https://www.ndsu.edu/agriculture/extension/publications/calving-book',
  },
]
const problemItems = computed(() => tm('guideBreedingManagementApp.problemItems') ?? [])
const workflowItems = computed(() => tm('guideBreedingManagementApp.workflowItems') ?? [])
const mustHaveItems = computed(() => tm('guideBreedingManagementApp.mustHaveItems') ?? [])
const avoidItems = computed(() => tm('guideBreedingManagementApp.avoidItems') ?? [])
const breedzItems = computed(() => tm('guideBreedingManagementApp.breedzItems') ?? [])
const faqs = computed(() => tm('guideBreedingManagementApp.faqs') ?? [])
</script>
