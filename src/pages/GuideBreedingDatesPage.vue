<template>
  <AppPageShell>
        <q-card flat>
          <q-card-section>
            <div class="text-overline text-weight-bold text-primary">{{ t('guideBreedingDates.overline') }}</div>
            <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
              {{ t('guideBreedingDates.title') }}
            </h1>
            <div class="text-body1 text-grey-7">
              {{ t('guideBreedingDates.description') }}
            </div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-auto">
                <q-btn
                  unelevated
                  color="primary"
                  icon="dashboard"
                  :label="t('guideBreedingDates.openApp')"
                  :to="dashboardPath"
                />
              </div>
              <div class="col-12 col-sm-auto">
                <q-btn
                  outline
                  color="primary"
                  icon="school"
                  :label="t('guideBreedingDates.openTutorial')"
                  :to="tutorialPath"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-section>
            <div class="text-overline text-weight-bold text-accent">
              {{ t('guideBreedingDates.problemOverline') }}
            </div>
            <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
              {{ t('guideBreedingDates.problemTitle') }}
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

          <q-card-section>
            <div class="text-overline text-weight-bold text-primary">
              {{ t('guideBreedingDates.logicOverline') }}
            </div>
            <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
              {{ t('guideBreedingDates.logicTitle') }}
            </div>
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

          <q-card-section>
            <div class="text-overline text-weight-bold text-primary">
              {{ t('guideBreedingDates.commonWaysOverline') }}
            </div>
            <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
              {{ t('guideBreedingDates.commonWaysTitle') }}
            </div>

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

          <q-card-section>
            <div class="text-overline text-weight-bold text-accent">
              {{ t('guideBreedingDates.breaksOverline') }}
            </div>
            <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
              {{ t('guideBreedingDates.breaksTitle') }}
            </div>

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

          <q-card-section>
            <div class="text-overline text-weight-bold text-primary">
              {{ t('guideBreedingDates.betterWayOverline') }}
            </div>
            <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
              {{ t('guideBreedingDates.betterWayTitle') }}
            </div>
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

          <q-card-section>
            <div class="text-overline text-weight-bold text-primary">
              {{ t('guideBreedingDates.tipsOverline') }}
            </div>
            <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
              {{ t('guideBreedingDates.tipsTitle') }}
            </div>

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

          <q-card-section>
            <div class="text-overline text-weight-bold text-accent">
              {{ t('guideBreedingDates.faqOverline') }}
            </div>
            <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
              {{ t('guideBreedingDates.faqTitle') }}
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
    title: t('guideBreedingDates.meta.title'),
    description: t('guideBreedingDates.meta.description'),
    path: buildLocalizedPath(routeLocale.value, '/guides/track-cattle-breeding-dates'),
  }),
)

const dashboardPath = computed(() => '/')
const tutorialPath = computed(() => '/tutorial')
const problemItems = computed(() => tm('guideBreedingDates.problemItems') ?? [])
const logicSteps = computed(() => tm('guideBreedingDates.logicSteps') ?? [])
const commonWaysItems = computed(() => tm('guideBreedingDates.commonWaysItems') ?? [])
const breaksItems = computed(() => tm('guideBreedingDates.breaksItems') ?? [])
const betterWayItems = computed(() => tm('guideBreedingDates.betterWayItems') ?? [])
const tipsItems = computed(() => tm('guideBreedingDates.tipsItems') ?? [])
const faqs = computed(() => tm('guideBreedingDates.faqs') ?? [])
</script>
