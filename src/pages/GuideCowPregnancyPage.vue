<template>
  <AppPageShell>
    <q-card flat>
      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">{{ t('guideCowPregnancy.overline') }}</div>
        <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
          {{ t('guideCowPregnancy.title') }}
        </h1>
        <div class="text-body1 text-grey-7">
          {{ t('guideCowPregnancy.description') }}
        </div>
      </q-card-section>

      <q-card-section>
        <q-banner rounded class="bg-green-1 text-primary">
          <template #avatar>
            <q-icon name="event_available" color="primary" />
          </template>
          <span class="text-weight-bold">{{ t('guideCowPregnancy.shortAnswerLabel') }}</span>
          {{ ` ${t('guideCowPregnancy.shortAnswer')}` }}
        </q-banner>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-auto">
            <q-btn
              unelevated
              color="primary"
              icon="dashboard"
              :label="t('guideCowPregnancy.openApp')"
              :to="dashboardPath"
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn
              outline
              color="primary"
              icon="event"
              :label="t('guideCowPregnancy.openBreedingDatesGuide')"
              :to="breedingDatesGuidePath"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideCowPregnancy.timelineOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCowPregnancy.timelineTitle') }}
        </div>
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

      <q-card-section>
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideCowPregnancy.variationOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCowPregnancy.variationTitle') }}
        </div>

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

      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideCowPregnancy.trackingOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCowPregnancy.trackingTitle') }}
        </div>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('guideCowPregnancy.trackingDescription') }}
        </div>

        <div class="column q-gutter-md">
          <q-card v-for="step in trackingSteps" :key="step.title" flat bordered>
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold text-primary">{{ step.title }}</div>
              <div class="text-body2 text-grey-7 q-mt-sm">{{ step.description }}</div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideCowPregnancy.mistakesOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCowPregnancy.mistakesTitle') }}
        </div>

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

      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">
          {{ t('guideCowPregnancy.breedzOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCowPregnancy.breedzTitle') }}
        </div>
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

        <q-btn
          unelevated
          color="primary"
          icon="open_in_new"
          :label="t('guideCowPregnancy.openApp')"
          :to="dashboardPath"
          class="q-mt-md"
        />
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-accent">
          {{ t('guideCowPregnancy.faqOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('guideCowPregnancy.faqTitle') }}
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
    </q-card>
  </AppPageShell>
</template>

<script setup>
import { computed } from 'vue'
import { useMeta } from 'quasar'
import { useRoute } from 'vue-router'
import AppPageShell from 'src/components/AppPageShell.vue'
import { useI18nText } from 'src/i18n'
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
    title: t('guideCowPregnancy.meta.title'),
    description: t('guideCowPregnancy.meta.description'),
    path: buildLocalizedPath(routeLocale.value, '/guides/how-long-is-cow-pregnancy'),
  }),
)

const dashboardPath = computed(() => '/')
const breedingDatesGuidePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/track-cattle-breeding-dates'),
)
const timelineItems = computed(() => tm('guideCowPregnancy.timelineItems') ?? [])
const variationItems = computed(() => tm('guideCowPregnancy.variationItems') ?? [])
const trackingSteps = computed(() => tm('guideCowPregnancy.trackingSteps') ?? [])
const mistakeItems = computed(() => tm('guideCowPregnancy.mistakeItems') ?? [])
const breedzItems = computed(() => tm('guideCowPregnancy.breedzItems') ?? [])
const faqs = computed(() => tm('guideCowPregnancy.faqs') ?? [])
</script>
