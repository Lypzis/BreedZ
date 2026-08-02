<template>
  <AppPageShell>
    <q-card flat tag="article">
      <q-card-section tag="header">
        <GuideBreadcrumbs :title="t('guideCattleLineage.title')" />
        <div class="text-overline text-weight-bold text-primary">{{ t('guideCattleLineage.overline') }}</div>
        <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
          {{ t('guideCattleLineage.title') }}
        </h1>
        <div class="text-body1 text-grey-7">
          {{ t('guideCattleLineage.description') }}
        </div>
        <GuideAttribution :published-at="guide.publishedAt" :modified-at="guide.modifiedAt" />
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideCattleLineage.hookOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleLineage.hookTitle') }}
        </h2>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideCattleLineage.hookDescription') }}
        </div>

        <q-list>
          <q-item v-for="item in hookItems" :key="item">
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
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideCattleLineage.realFarmsOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleLineage.realFarmsTitle') }}
        </h2>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideCattleLineage.realFarmsDescription') }}
        </div>

        <q-list>
          <q-item v-for="item in realFarmsItems" :key="item">
            <q-item-section avatar>
              <q-icon name="report_problem" color="accent" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-banner rounded class="bg-orange-1 text-brown-9 q-mt-md">
          <template #avatar>
            <q-icon name="trending_down" color="warning" />
          </template>
          {{ t('guideCattleLineage.realFarmsTakeaway') }}
        </q-banner>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideCattleLineage.systemOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleLineage.systemTitle') }}
        </h2>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideCattleLineage.systemDescription') }}
        </div>

        <div class="column q-gutter-md">
          <q-card
            v-for="step in systemSteps"
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

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideCattleLineage.changesOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleLineage.changesTitle') }}
        </h2>

        <q-list>
          <q-item v-for="item in changesItems" :key="item">
            <q-item-section avatar>
              <q-icon name="task_alt" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-banner rounded class="bg-green-1 text-primary q-mt-md">
          <template #avatar>
            <q-icon name="insights" color="primary" />
          </template>
          {{ t('guideCattleLineage.changesTakeaway') }}
        </q-banner>
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideCattleLineage.toolsOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleLineage.toolsTitle') }}
        </h2>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideCattleLineage.toolsDescription') }}
        </div>

        <q-list>
          <q-item v-for="item in toolsItems" :key="item">
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
          :label="t('guideCattleLineage.openApp')"
          :to="dashboardPath"
          class="q-mt-md"
        />
      </q-card-section>

      <q-card-section tag="section">
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideCattleLineage.takeawayOverline') }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleLineage.takeawayTitle') }}
        </h2>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideCattleLineage.takeawayDescription') }}
        </div>
        <q-banner rounded class="bg-grey-1 text-grey-8">
          <template #avatar>
            <q-icon name="summarize" color="primary" />
          </template>
          {{ t('guideCattleLineage.takeawayBanner') }}
        </q-banner>
      </q-card-section>

      <GuideSourcesSection :sources="sources" />

      <GuideRelatedLink
        :title="t('guideBreedingRecordsApp.title')"
        :description="t('guideBreedingRecordsApp.description')"
        :to="breedingRecordsAppGuidePath"
      />

      <GuideShareSection
        :title="t('guideCattleLineage.title')"
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

const guide = useGuideMeta('cattleLineage', t, routeLocale)

const dashboardPath = computed(() => '/')
const breedingRecordsAppGuidePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/breeding-records-app'),
)
const sharePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/how-to-track-cattle-lineage'),
)
const sources = [
  {
    title: 'Record Keeping for the Beef Herd',
    publisher: 'University of Maryland Extension',
    url: 'https://extension.umd.edu/resource/record-keeping-beef-herd/',
  },
  {
    title: 'Production Records for Commercial Cow-Calf Operations',
    publisher: 'University of Missouri Extension',
    url: 'https://extension.missouri.edu/publications/g2045',
  },
  {
    title: 'Calving Book',
    publisher: 'North Dakota State University Extension',
    url: 'https://www.ndsu.edu/agriculture/extension/publications/calving-book',
  },
  {
    title: 'Identification Systems',
    publisher: 'Beef Improvement Federation Guidelines',
    url: 'https://guidelines.beefimprovement.org/index.php/Identification_Systems',
  },
]
const hookItems = computed(() => tm('guideCattleLineage.hookItems') ?? [])
const realFarmsItems = computed(() => tm('guideCattleLineage.realFarmsItems') ?? [])
const systemSteps = computed(() => tm('guideCattleLineage.systemSteps') ?? [])
const changesItems = computed(() => tm('guideCattleLineage.changesItems') ?? [])
const toolsItems = computed(() => tm('guideCattleLineage.toolsItems') ?? [])
</script>
