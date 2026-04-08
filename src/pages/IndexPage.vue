<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-6">
        <section class="q-mb-lg">
          <q-card flat>
            <q-card-section class="column items-start">
              <div class="text-overline text-weight-bold text-primary">{{ t('home.overline') }}</div>
              <h1 class="text-h2 text-weight-bold q-mt-sm q-mb-md">{{ t('home.heroTitle') }}</h1>
              <div class="text-subtitle1 text-grey-7">
                {{ t('home.heroSubtitle') }}
              </div>
              
              <q-card-actions align="left" class="q-px-none q-pt-lg q-pb-none q-gutter-sm">
                <!-- <q-btn unelevated color="primary" label="Start free" /> -->
                <q-btn
                  unelevated
                  color="primary"
                  :label="installButtonLabel"
                  icon="download"
                  :disable="isInstalled"
                  @click="handleInstallClick"
                />
                <q-btn outline color="primary" :label="t('home.seeHowItWorks')" to="/tutorial" />
              </q-card-actions>

              <q-banner
                v-if="installHintVisible || installStatusMessage"
                rounded
                class="bg-grey-1 text-grey-8 q-mt-md"
              >
                {{ installStatusMessage || installInstructions }}
              </q-banner>

              <div class="q-mt-lg full-width">
                <div class="row q-col-gutter-lg">
                  <div class="col-10 col-md-8 col-lg-7">
                    <q-img :src="logoFull" :alt="t('brand.logoAlt')" fit="contain" no-spinner class="full-width" />
                    <q-banner rounded class=" text-primary q-mt-md">
                      <template #avatar>
                        <q-icon name="task_alt" color="primary" />
                      </template>
                      {{ t('home.heroBanner') }}
                    </q-banner>
                  </div>
                  <div class="col-12 col-xl-7">
                    <q-card flat class="bg-grey-1">
                      <q-card-section>
                        <div class="text-overline text-weight-bold text-primary">{{ t('home.appOverline') }}</div>
                        <div class="text-subtitle1 text-weight-medium q-mb-md">
                          {{ t('home.appTitle') }}
                        </div>

                        <q-list>
                          <q-item v-for="item in appItems" :key="item.title">
                            <q-item-section avatar>
                              <q-avatar :color="item.avatarColor" :text-color="item.avatarTextColor" :icon="item.icon" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-medium">{{ item.title }}</q-item-label>
                              <q-item-label caption>{{ item.description }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-chip dense :color="item.chipColor" :text-color="item.chipTextColor">{{ item.chip }}</q-chip>
                            </q-item-section>
                          </q-item>
                        </q-list>

                        <q-btn
                          unelevated
                          color="primary"
                          :label="t('home.openDashboard')"
                          icon="dashboard"
                          to="/"
                          class="full-width q-mt-md"
                        />
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </section>

        <section class="q-mb-lg" id="problem">
            <q-card flat>
              <q-card-section>
              <div class="text-overline text-weight-bold text-accent">{{ t('home.problemOverline') }}</div>
              <div class="text-h4 text-weight-bold q-mt-sm q-mb-md">
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
          </q-card>
        </section>

        <section class="q-mb-lg">
            <q-card flat>
              <q-card-section>
              <div class="text-overline text-weight-bold text-primary">{{ t('home.featuresOverline') }}</div>
              <div class="text-h4 text-weight-bold q-mt-sm q-mb-md">
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
          </q-card>
        </section>

        <section class="q-mb-lg" id="how-it-works">
            <q-card flat>
              <q-card-section>
              <div class="text-overline text-weight-bold text-primary">{{ t('home.howItWorksOverline') }}</div>
              <div class="text-h4 text-weight-bold q-mt-sm q-mb-md">
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
            </q-card-section>
          </q-card>
        </section>

        <section class="q-mb-lg">
            <q-card flat>
              <q-card-section>
              <div class="text-overline text-weight-bold text-primary">{{ t('home.offlineOverline') }}</div>
              <div class="text-h4 text-weight-bold q-mt-sm q-mb-md">
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
          </q-card>
        </section>

        <section class="q-mb-lg">
            <q-card flat>
              <q-card-section class="column items-start">
              <div class="text-overline text-weight-bold text-primary">{{ t('home.ctaOverline') }}</div>
              <div class="text-h4 text-weight-bold q-mt-sm q-mb-md">
                {{ t('home.ctaTitle') }}
              </div>

              <div class="row q-col-gutter-sm items-center">
                <div class="col-auto">
                  <!-- <q-btn unelevated color="primary" label="Start free" class="q-mb-sm" /> -->
                  <q-btn
                    unelevated
                    color="primary"
                    :label="installButtonLabel"
                    icon="download"
                    class="q-mb-sm"
                    :disable="isInstalled"
                    @click="handleInstallClick"
                  />
                </div>
                <div class="col-auto">
                  <q-btn
                    outline
                    color="primary"
                    :label="t('home.seeHowItWorks')"
                    to="/tutorial"
                    class="q-mb-sm"
                  />
                </div>
              </div>
              <div class="text-caption text-grey-7">{{ t('common.noSignupRequired') }}</div>
            </q-card-section>
          </q-card>
        </section>

        <section>
            <q-card flat>
              <q-card-section>
              <div class="text-overline text-weight-bold text-accent">{{ t('home.faqOverline') }}</div>
              <div class="text-h4 text-weight-bold q-mt-sm q-mb-md">{{ t('home.faqTitle') }}</div>

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
        </section>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useMeta } from 'quasar'
import { useRoute } from 'vue-router'
import logoFull from 'src/assets/logo-hero.webp'
import { useInstallPrompt } from 'src/composables/useInstallPrompt'
import { useI18nText } from 'src/i18n'
import { buildPageMeta } from 'src/utils/seo-meta'
import { buildLocalizedPath, routeSegmentToLocale } from 'src/utils/localeRouting'

const { t, tm } = useI18nText()
const route = useRoute()
const routeLocale = computed(() => routeSegmentToLocale(route.params.locale))

useMeta(() =>
  buildPageMeta({
    title: t('home.meta.title'),
    description: t('home.meta.description'),
    path: buildLocalizedPath(routeLocale.value, '/'),
  }),
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
    icon: ['pets', 'event', 'child_friendly', 'article'][index] ?? 'task_alt',
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
    icon: ['wifi_off', 'save', 'sync'][index] ?? 'task_alt',
    label,
  })),
)
const faqs = computed(() => tm('home.faqs') ?? [])
const appItems = computed(() => {
  const visuals = [
    { icon: 'pets', avatarColor: 'secondary', avatarTextColor: 'dark', chipColor: 'secondary', chipTextColor: 'dark' },
    { icon: 'family_restroom', avatarColor: 'primary', avatarTextColor: 'white', chipColor: 'accent', chipTextColor: 'white' },
    { icon: 'event', avatarColor: 'accent', avatarTextColor: 'white', chipColor: 'primary', chipTextColor: 'white' },
    { icon: 'dashboard', avatarColor: 'secondary', avatarTextColor: 'dark', chipColor: 'secondary', chipTextColor: 'dark' },
    { icon: 'save', avatarColor: 'primary', avatarTextColor: 'white', chipColor: 'primary', chipTextColor: 'white' },
  ]

  return (tm('home.appItems') ?? []).map((item, index) => ({
    ...item,
    ...visuals[index],
  }))
})
</script>
