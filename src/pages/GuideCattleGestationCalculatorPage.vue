<template>
  <AppPageShell>
    <q-card flat>
      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">{{ t('guideCattleGestationCalculator.overline') }}</div>
        <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
          {{ t('guideCattleGestationCalculator.title') }}
        </h1>
        <div class="text-body1 text-grey-7">
          {{ t('guideCattleGestationCalculator.description') }}
        </div>
        <GuideWrittenDate />
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideCattleGestationCalculator.calculatorOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleGestationCalculator.calculatorTitle') }}
        </div>
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
            />
          </div>
        </div>

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
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideCattleGestationCalculator.howItWorksOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleGestationCalculator.howItWorksTitle') }}
        </div>

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

      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideCattleGestationCalculator.quickTableOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleGestationCalculator.quickTableTitle') }}
        </div>

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

      <q-card-section>
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideCattleGestationCalculator.recordkeepingOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleGestationCalculator.recordkeepingTitle') }}
        </div>
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

      <q-card-section>
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideCattleGestationCalculator.faqOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCattleGestationCalculator.faqTitle') }}
        </div>

        <q-list>
          <q-item v-for="faq in faqs" :key="faq.question">
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ faq.question }}</q-item-label>
              <q-item-label caption class="text-grey-7">{{ faq.answer }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <GuideSourcesSection :sources="sources" />

      <GuideRelatedLink
        :title="t('guideCowPregnancy.title')"
        :description="t('guideCowPregnancy.description')"
        :to="cowPregnancyGuidePath"
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
import { useMeta } from 'quasar'
import { useRoute } from 'vue-router'
import AppPageShell from 'src/components/AppPageShell.vue'
import GuideRelatedLink from 'src/components/GuideRelatedLink.vue'
import GuideShareSection from 'src/components/GuideShareSection.vue'
import GuideSourcesSection from 'src/components/GuideSourcesSection.vue'
import GuideWrittenDate from 'src/components/GuideWrittenDate.vue'
import { useI18nText } from 'src/i18n'
import { formatDisplayDate, todayDateString } from 'src/utils/dates'
import { buildLocalizedPath, localeFromPath, routeSegmentToLocale } from 'src/utils/localeRouting'
import { buildPageMeta } from 'src/utils/seo-meta'

const { t, tm } = useI18nText()
const route = useRoute()
const routeLocale = computed(() =>
  typeof route.params.locale === 'string' && route.params.locale
    ? routeSegmentToLocale(route.params.locale)
    : localeFromPath(route.path) || 'en',
)

useMeta(() =>
  buildPageMeta({
    title: t('guideCattleGestationCalculator.meta.title'),
    description: t('guideCattleGestationCalculator.meta.description'),
    path: buildLocalizedPath(routeLocale.value, '/guides/cattle-gestation-calculator'),
  }),
)

const breedingDate = ref(todayDateString())
const gestationDays = ref(283)
const dashboardPath = computed(() => '/')
const cowPregnancyGuidePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/how-long-is-cow-pregnancy'),
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
const estimatedCalvingDate = computed(() => addDaysToDateString(breedingDate.value, gestationDays.value))
const watchWindowStart = computed(() => addDaysToDateString(estimatedCalvingDate.value, -7))
const watchWindowEnd = computed(() => addDaysToDateString(estimatedCalvingDate.value, 7))
const estimatedCalvingDateLabel = computed(() =>
  estimatedCalvingDate.value ? formatDisplayDate(estimatedCalvingDate.value) : t('common.dateNotSet'),
)
const watchWindowLabel = computed(() => {
  if (!watchWindowStart.value || !watchWindowEnd.value) {
    return t('common.dateNotSet')
  }

  return `${formatDisplayDate(watchWindowStart.value)} - ${formatDisplayDate(watchWindowEnd.value)}`
})

function addDaysToDateString(value, days) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value ?? ''))) {
    return ''
  }

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    Number.isNaN(date.getTime())
    || date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    return ''
  }

  date.setUTCDate(date.getUTCDate() + Number(days || 0))

  const resultYear = date.getUTCFullYear()
  const resultMonth = String(date.getUTCMonth() + 1).padStart(2, '0')
  const resultDay = String(date.getUTCDate()).padStart(2, '0')

  return `${resultYear}-${resultMonth}-${resultDay}`
}
</script>
