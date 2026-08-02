<template>
  <AppPageShell>
    <q-card flat>
      <q-card-section tag="header">
        <div class="text-overline text-weight-bold text-primary">{{ t('guidesHub.overline') }}</div>
        <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
          {{ t('guidesHub.title') }}
        </h1>
        <div class="text-body1 text-grey-7">
          {{ t('guidesHub.description') }}
        </div>
      </q-card-section>

      <q-card-section v-for="group in guideGroups" :key="group.titleKey" tag="section">
        <div class="text-overline text-weight-bold text-primary">
          {{ t(group.overlineKey) }}
        </div>
        <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t(group.titleKey) }}
        </h2>

        <div class="row q-col-gutter-md">
          <div v-for="guide in group.guides" :key="guide.to" class="col-12 col-md-6">
            <q-card flat bordered class="full-height">
              <q-card-section>
                <div class="row items-start q-col-gutter-sm">
                  <div class="col-auto">
                    <q-icon :name="guide.icon" color="primary" size="sm" />
                  </div>
                  <div class="col">
                    <div class="text-subtitle1 text-weight-bold">{{ t(guide.titleKey) }}</div>
                    <div class="text-body2 text-grey-7 q-mt-sm">
                      {{ t(guide.descriptionKey) }}
                    </div>
                  </div>
                </div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat color="primary" icon="open_in_new" :label="t('guidesHub.openGuide')" :to="guide.to" />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <q-card-section tag="section">
        <q-banner rounded class="bg-green-1 text-primary">
          <template #avatar>
            <q-icon name="dashboard" color="primary" />
          </template>
          <div class="row items-center q-col-gutter-sm">
            <div class="col">
              <div class="text-subtitle2 text-weight-bold">{{ t('guidesHub.appCtaTitle') }}</div>
              <div class="text-caption text-grey-8">{{ t('guidesHub.appCtaDescription') }}</div>
            </div>
            <div class="col-12 col-sm-auto">
              <q-btn unelevated color="primary" icon="open_in_new" :label="t('common.openApp')" to="/" />
            </div>
          </div>
        </q-banner>
      </q-card-section>

      <GuideShareSection :title="t('guidesHub.title')" :path="sharePath" />
    </q-card>
  </AppPageShell>
</template>

<script setup>
import { computed } from 'vue'
import { useMeta } from 'quasar'
import { useRoute } from 'vue-router'
import AppPageShell from 'src/components/AppPageShell.vue'
import GuideShareSection from 'src/components/GuideShareSection.vue'
import { useI18nText } from 'src/i18n'
import { buildLocalizedPath, localeFromPath, routeSegmentToLocale } from 'src/utils/localeRouting'
import { buildPageMeta } from 'src/utils/seo-meta'

const { t } = useI18nText()
const route = useRoute()
const routeLocale = computed(() =>
  typeof route.params.locale === 'string' && route.params.locale
    ? routeSegmentToLocale(route.params.locale)
    : localeFromPath(route.path) || 'en',
)

useMeta(() =>
  buildPageMeta({
    title: t('guidesHub.meta.title'),
    description: t('guidesHub.meta.description'),
    path: buildLocalizedPath(routeLocale.value, '/guides'),
    locale: routeLocale.value,
    internalPath: '/guides',
  }),
)

const sharePath = computed(() => buildLocalizedPath(routeLocale.value, '/guides'))

function guidePath(path) {
  return buildLocalizedPath(routeLocale.value, path)
}

const guideGroups = computed(() => [
  {
    overlineKey: 'guidesHub.breedingOverline',
    titleKey: 'guidesHub.breedingTitle',
    guides: [
      {
        titleKey: 'guideBreedingDates.title',
        descriptionKey: 'home.breedingGuideDescription',
        icon: 'event',
        to: guidePath('/guides/track-cattle-breeding-dates'),
      },
      {
        titleKey: 'guideCowPregnancy.title',
        descriptionKey: 'home.cowPregnancyGuideDescription',
        icon: 'pregnant_woman',
        to: guidePath('/guides/how-long-is-cow-pregnancy'),
      },
      {
        titleKey: 'guideCattleGestationCalculator.title',
        descriptionKey: 'guidesHub.gestationCalculatorDescription',
        icon: 'calculate',
        to: guidePath('/guides/cattle-gestation-calculator'),
      },
    ],
  },
  {
    overlineKey: 'guidesHub.recordsOverline',
    titleKey: 'guidesHub.recordsTitle',
    guides: [
      {
        titleKey: 'home.lineageGuideTitle',
        descriptionKey: 'home.lineageGuideDescription',
        icon: 'family_restroom',
        to: guidePath('/guides/how-to-track-cattle-lineage'),
      },
      {
        titleKey: 'home.recordKeepingGuideTitle',
        descriptionKey: 'home.recordKeepingGuideDescription',
        icon: 'assignment',
        to: guidePath('/guides/best-cattle-record-keeping-methods'),
      },
      {
        titleKey: 'guideCattleBreedingRecordKeepingSystem.title',
        descriptionKey: 'guidesHub.breedingRecordKeepingSystemDescription',
        icon: 'fact_check',
        to: guidePath('/guides/cattle-breeding-record-keeping-system'),
      },
    ],
  },
  {
    overlineKey: 'guidesHub.workflowOverline',
    titleKey: 'guidesHub.workflowTitle',
    guides: [
      {
        titleKey: 'guideBreedingManagementApp.title',
        descriptionKey: 'guidesHub.breedingManagementAppDescription',
        icon: 'event_repeat',
        to: guidePath('/guides/breeding-management-app'),
      },
      {
        titleKey: 'home.breedingRecordsAppGuideTitle',
        descriptionKey: 'home.breedingRecordsAppGuideDescription',
        icon: 'phone_iphone',
        to: guidePath('/guides/breeding-records-app'),
      },
      {
        titleKey: 'home.lostRecordsGuideTitle',
        descriptionKey: 'home.lostRecordsGuideDescription',
        icon: 'report_problem',
        to: guidePath('/guides/lost-breeding-records-what-to-do'),
      },
    ],
  },
])
</script>
