<template>
  <AppPageShell>
    <q-card flat tag="article">
      <q-card-section tag="header">
        <GuideBreadcrumbs :title="t('guideCattleBreedingRecordKeepingSystem.title')" />
        <div class="text-overline text-weight-bold text-primary">{{ t('guideCattleBreedingRecordKeepingSystem.overline') }}</div>
        <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
          {{ t('guideCattleBreedingRecordKeepingSystem.title') }}
        </h1>
        <div class="text-body1 text-grey-7">
          {{ t('guideCattleBreedingRecordKeepingSystem.description') }}
        </div>
        <GuideAttribution :published-at="guide.publishedAt" :modified-at="guide.modifiedAt" />
      </q-card-section>

      <q-card-section tag="section">
        <q-banner rounded class="bg-green-1 text-primary">
          <template #avatar>
            <q-icon name="assignment" color="primary" />
          </template>
          <span class="text-weight-bold">{{ t('guideCattleBreedingRecordKeepingSystem.shortAnswerLabel') }}</span>
          {{ ` ${t('guideCattleBreedingRecordKeepingSystem.shortAnswer')}` }}
        </q-banner>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideCattleBreedingRecordKeepingSystem.structureOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleBreedingRecordKeepingSystem.structureTitle') }}
        </h2>

        <div class="column q-gutter-md">
          <q-card v-for="item in structureItems" :key="item.title" flat bordered>
            <q-card-section>
              <h3 class="text-subtitle1 text-weight-bold text-primary q-my-none">{{ item.title }}</h3>
              <div class="text-body2 text-grey-7 q-mt-sm">{{ item.description }}</div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideCattleBreedingRecordKeepingSystem.workflowOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleBreedingRecordKeepingSystem.workflowTitle') }}
        </h2>

        <q-list>
          <q-item v-for="item in workflowItems" :key="item">
            <q-item-section avatar>
              <q-icon name="event_repeat" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideCattleBreedingRecordKeepingSystem.mistakesOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleBreedingRecordKeepingSystem.mistakesTitle') }}
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
          {{ t('guideCattleBreedingRecordKeepingSystem.breedzOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleBreedingRecordKeepingSystem.breedzTitle') }}
        </h2>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideCattleBreedingRecordKeepingSystem.breedzDescription') }}
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
              :label="t('guideCattleBreedingRecordKeepingSystem.openApp')"
              :to="dashboardPath"
              class="full-width"
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn
              outline
              color="primary"
              icon="event_repeat"
              :label="t('guideCattleBreedingRecordKeepingSystem.openManagementGuide')"
              :to="managementGuidePath"
              class="full-width"
            />
          </div>
        </div>
      </q-card-section>

      <GuideFaqSection
        :overline="t('guideCattleBreedingRecordKeepingSystem.faqOverline')"
        :title="t('guideCattleBreedingRecordKeepingSystem.faqTitle')"
        :faqs="faqs"
      />

      <GuideSourcesSection :sources="sources" />

      <GuideRelatedLink
        :title="t('guideBreedingManagementApp.title')"
        :description="t('guideBreedingManagementApp.description')"
        :to="managementGuidePath"
      />

      <GuideShareSection
        :title="t('guideCattleBreedingRecordKeepingSystem.title')"
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

const guide = useGuideMeta('cattleBreedingRecordKeepingSystem', t, routeLocale)

const dashboardPath = computed(() => '/')
const managementGuidePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/breeding-management-app'),
)
const sharePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/cattle-breeding-record-keeping-system'),
)
const sources = [
  {
    title: 'Production Records for Commercial Cow-Calf Operations',
    publisher: 'University of Missouri Extension',
    url: 'https://extension.missouri.edu/publications/g2045',
  },
  {
    title: 'Identification Systems',
    publisher: 'Beef Improvement Federation Guidelines',
    url: 'https://guidelines.beefimprovement.org/index.php/Identification_Systems',
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
]

const structureItems = computed(() => tm('guideCattleBreedingRecordKeepingSystem.structureItems') ?? [])
const workflowItems = computed(() => tm('guideCattleBreedingRecordKeepingSystem.workflowItems') ?? [])
const mistakeItems = computed(() => tm('guideCattleBreedingRecordKeepingSystem.mistakeItems') ?? [])
const breedzItems = computed(() => tm('guideCattleBreedingRecordKeepingSystem.breedzItems') ?? [])
const faqs = computed(() => tm('guideCattleBreedingRecordKeepingSystem.faqs') ?? [])
</script>
