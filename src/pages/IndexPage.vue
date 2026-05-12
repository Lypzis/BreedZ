<template>
  <AppPageShell>
    <q-card flat>
      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">{{ t('home.overline') }}</div>
        <h1 class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
          {{ t('home.heroTitle') }}
        </h1>
        <div class="text-body1 text-grey-7">
          {{ t('home.heroSubtitle') }}
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-auto">
            <q-btn unelevated color="primary" :label="installButtonLabel" icon="download" :disable="isInstalled"
              @click="handleInstallClick" />
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn outline color="primary" icon="dashboard" :label="t('home.openDashboard')" :to="dashboardPath" />
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <q-banner rounded class="bg-grey-1 text-grey-8">
          <template #avatar>
            <q-icon name="task_alt" color="primary" />
          </template>
          {{ t('home.heroBanner') }}
        </q-banner>

        <q-banner v-if="installHintVisible || installStatusMessage" rounded class="bg-white text-grey-8 q-mt-md">
          {{ installStatusMessage || installInstructions }}
        </q-banner>
      </q-card-section>

      <q-card-section>
        <q-card class="q-pa-lg">
          <div class="row items-center q-col-gutter-lg">
            <div class="col-12 col-md-6 self-center landing-hero-media">
              <q-img :src="logoFull" :alt="t('brand.name')" fit="contain" no-spinner class="landing-hero-image" />
            </div>
            <div class="col-12 col-md-6">
              <div class="text-overline text-weight-bold text-primary">
                {{ t('home.appOverline') }}
              </div>
              <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
                {{ t('home.appTitle') }}
              </div>

              <q-list>
                <q-item v-for="item in appItems" :key="item.title" class="q-px-none">
                  <q-item-section>
                    <div class="row items-center justify-between q-col-gutter-sm">
                      <div class="row items-center q-col-gutter-sm">
                        <div class="col-auto">
                          <q-icon :name="item.icon" color="primary" />
                        </div>
                        <div class="col">
                          <q-item-label class="text-weight-medium">{{ item.title }}</q-item-label>
                        </div>
                      </div>

                    </div>
                    <q-item-label caption class="q-mt-xs">
                      {{ item.description }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card>
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-accent">
          {{ t('home.problemOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('home.problemTitle') }}
        </div>

        <q-list>
          <q-item v-for="problem in breedingProblems" :key="problem">
            <q-item-section avatar>
              <q-icon name="warning_amber" color="accent" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ problem }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">
          {{ t('home.featuresOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('home.featuresTitle') }}
        </div>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('home.featuresDescription') }}
        </div>

        <q-list>
          <q-item v-for="feature in recordFeatures" :key="feature.label">
            <q-item-section avatar>
              <q-icon :name="feature.icon" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ feature.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">
          {{ t('home.howItWorksOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('home.howItWorksTitle') }}
        </div>

        <q-list>
          <q-item v-for="step in fieldSteps" :key="step.step">
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white">{{ step.step }}</q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ step.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-btn unelevated color="primary" icon="school" :label="t('home.openTutorial')" :to="tutorialPath"
          class="q-mt-md" />
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">
          {{ t('home.offlineOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('home.offlineTitle') }}
        </div>

        <q-list>
          <q-item v-for="item in offlineBenefits" :key="item.label">
            <q-item-section avatar>
              <q-icon :name="item.icon" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">
          {{ t('home.premiumOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('home.premiumTitle') }}
        </div>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('home.premiumDescription') }}
        </div>

        <q-list>
          <q-item v-for="item in premiumItems" :key="item">
            <q-item-section avatar>
              <q-icon name="workspace_premium" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">
          {{ t('home.guidesOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('home.guidesTitle') }}
        </div>
        <div class="text-body1 text-grey-7 q-mb-md">
          {{ t('home.guidesDescription') }}
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6 col-lg-4">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle1 text-weight-bold">{{ t('guideBreedingDates.title') }}</div>
                <div class="text-body2 text-grey-7 q-mt-sm">
                  {{ t('home.breedingGuideDescription') }}
                </div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat color="primary" icon="open_in_new" :label="t('home.openBreedingGuide')"
                  :to="breedingGuidePath" />
              </q-card-actions>
            </q-card>
          </div>

          <div class="col-12 col-md-6 col-lg-4">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle1 text-weight-bold">{{ t('home.cowPregnancyGuideTitle') }}</div>
                <div class="text-body2 text-grey-7 q-mt-sm">
                  {{ t('home.cowPregnancyGuideDescription') }}
                </div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat color="primary" icon="open_in_new" :label="t('home.openCowPregnancyGuide')"
                  :to="cowPregnancyGuidePath" />
              </q-card-actions>
            </q-card>
          </div>

          <div class="col-12 col-md-6 col-lg-4">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle1 text-weight-bold">{{ t('home.lineageGuideTitle') }}</div>
                <div class="text-body2 text-grey-7 q-mt-sm">
                  {{ t('home.lineageGuideDescription') }}
                </div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat color="primary" icon="open_in_new" :label="t('home.openLineageGuide')"
                  :to="lineageGuidePath" />
              </q-card-actions>
            </q-card>
          </div>

          <div class="col-12 col-md-6 col-lg-4">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle1 text-weight-bold">{{ t('home.recordKeepingGuideTitle') }}</div>
                <div class="text-body2 text-grey-7 q-mt-sm">
                  {{ t('home.recordKeepingGuideDescription') }}
                </div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat color="primary" icon="open_in_new" :label="t('home.openRecordKeepingGuide')"
                  :to="recordKeepingGuidePath" />
              </q-card-actions>
            </q-card>
          </div>

          <div class="col-12 col-md-6 col-lg-4">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle1 text-weight-bold">{{ t('home.breedingRecordsAppGuideTitle') }}</div>
                <div class="text-body2 text-grey-7 q-mt-sm">
                  {{ t('home.breedingRecordsAppGuideDescription') }}
                </div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat color="primary" icon="open_in_new" :label="t('home.openBreedingRecordsAppGuide')"
                  :to="breedingRecordsAppGuidePath" />
              </q-card-actions>
            </q-card>
          </div>

          <div class="col-12 col-md-6 col-lg-4">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle1 text-weight-bold">{{ t('home.lostRecordsGuideTitle') }}</div>
                <div class="text-body2 text-grey-7 q-mt-sm">
                  {{ t('home.lostRecordsGuideDescription') }}
                </div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat color="primary" icon="open_in_new" :label="t('home.openLostRecordsGuide')"
                  :to="lostRecordsGuidePath" />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-accent">
          {{ t('home.faqOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('home.faqTitle') }}
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

      <q-card-section class="q-mb-md">
        <div class="text-overline text-weight-bold text-primary">
          {{ t('home.ctaOverline') }}
        </div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">
          {{ t('home.ctaTitle') }}
        </div>
        <div class="row q-col-gutter-sm">
          <div class="col-6 col-sm-auto">
            <q-btn unelevated color="primary" :label="installButtonLabel" icon="download" :disable="isInstalled"
              @click="handleInstallClick" />
          </div>
          <div class="col-6 col-sm-auto">
            <q-btn outline color="primary" icon="dashboard" :label="t('common.openApp')" :to="dashboardPath" />
          </div>
        </div>
        <div class="text-caption text-grey-7 q-mt-sm">{{ t('common.noSignupRequired') }}</div>
      </q-card-section>

      <GuideShareSection :title="t('brand.name')" :path="sharePath" message-prefix="homeShare" />
    </q-card>
  </AppPageShell>
</template>

<script setup>
import { computed } from 'vue'
import { useMeta } from 'quasar'
import { useRoute } from 'vue-router'
import AppPageShell from 'src/components/AppPageShell.vue'
import GuideShareSection from 'src/components/GuideShareSection.vue'
import logoFull from 'src/assets/logo-hero.webp'
import { useInstallPrompt } from 'src/composables/useInstallPrompt'
import { useI18nText } from 'src/i18n'
import { buildPageMeta } from 'src/utils/seo-meta'
import { buildLocalizedPath, localeFromPath, routeSegmentToLocale } from 'src/utils/localeRouting'

const { t, tm } = useI18nText()
const route = useRoute()
const routeLocale = computed(() =>
  typeof route.params.locale === 'string' && route.params.locale
    ? routeSegmentToLocale(route.params.locale)
    : localeFromPath(route.path) || 'en',
)

useMeta(() =>
  buildPageMeta({
    title: t('home.meta.title'),
    description: t('home.meta.description'),
    path: buildLocalizedPath(routeLocale.value, '/'),
  }),
)

const dashboardPath = computed(() => '/')
const tutorialPath = computed(() => '/tutorial')
const sharePath = computed(() => buildLocalizedPath(routeLocale.value, '/'))
const breedingGuidePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/track-cattle-breeding-dates'),
)
const cowPregnancyGuidePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/how-long-is-cow-pregnancy'),
)
const lineageGuidePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/how-to-track-cattle-lineage'),
)
const recordKeepingGuidePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/best-cattle-record-keeping-methods'),
)
const breedingRecordsAppGuidePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/breeding-records-app'),
)
const lostRecordsGuidePath = computed(() =>
  buildLocalizedPath(routeLocale.value, '/guides/lost-breeding-records-what-to-do'),
)

const {
  installButtonLabel,
  installHintVisible,
  installInstructions,
  installStatusMessage,
  isInstalled,
  handleInstallClick,
} = useInstallPrompt()

const breedingProblems = computed(() => tm('home.problemItems') ?? [])
const recordFeatures = computed(() =>
  (tm('home.featuresItems') ?? []).map((label, index) => ({
    icon: ['pets', 'family_restroom', 'event', 'save'][index] ?? 'task_alt',
    label,
  })),
)
const fieldSteps = computed(() =>
  (tm('home.howItWorksItems') ?? []).map((label, index) => ({
    step: String(index + 1),
    label,
  })),
)
const offlineBenefits = computed(() =>
  (tm('home.offlineItems') ?? []).map((label, index) => ({
    icon: ['wifi_off', 'save', 'download_done', 'cloud_sync'][index] ?? 'task_alt',
    label,
  })),
)
const premiumItems = computed(() => tm('home.premiumItems') ?? [])
const faqs = computed(() => tm('home.faqs') ?? [])
const appItems = computed(() =>
  (tm('home.appItems') ?? []).map((item, index) => ({
    ...item,
    icon: ['pets', 'family_restroom', 'event', 'dashboard', 'backup'][index] ?? 'task_alt',
  })),
)
</script>

<style scoped>
.landing-hero-media {
  display: flex;
  align-items: center;
}

.landing-hero-image {
  max-width: 320px;
  margin: 0 auto;
}
</style>
