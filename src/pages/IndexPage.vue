<template>
  <AppPageShell page-class="landing-page-shell" md="12" lg="11" xl="10">
    <q-card flat class="landing-page">
      <section class="landing-hero">
        <div class="landing-hero__content">
          <div>
            <div class="text-overline text-weight-bold landing-hero__overline">{{ t('home.overline') }}</div>
            <h1 class="landing-hero__title">
              {{ t('home.heroTitle') }}
            </h1>
            <p class="landing-hero__subtitle">
              {{ t('home.heroSubtitle') }}
            </p>
          </div>

          <div class="landing-hero__bottom">
            <div class="row q-col-gutter-sm landing-hero__actions">
              <div class="col-12 col-sm-auto">
                <q-btn unelevated color="white" text-color="primary" :label="installButtonLabel" icon="download"
                  :disable="isInstalled" class="full-width" @click="handleInstallClick" />
              </div>
              <div class="col-12 col-sm-auto">
                <q-btn outline color="white" icon="dashboard" :label="t('home.openDashboard')" :to="dashboardPath"
                  class="full-width landing-hero__secondary-action" />
              </div>
            </div>

            <q-banner rounded class="landing-hero__trust">
              <template #avatar>
                <q-icon name="task_alt" color="white" />
              </template>
              {{ t('home.heroBanner') }}
            </q-banner>
          </div>
        </div>
      </section>

      <q-banner v-if="installHintVisible || installStatusMessage" rounded class="bg-green-1 text-primary q-mt-md">
        {{ installStatusMessage || installInstructions }}
      </q-banner>

      <section class="landing-section landing-section--inside">
        <div class="landing-section-heading row items-center q-col-gutter-md">
          <div class="col-auto">
            <q-img :src="logoIcon" :alt="t('brand.name')" fit="contain" no-spinner class="landing-heading-logo" />
          </div>
          <div class="col">
            <div class="text-overline text-weight-bold text-primary">
              {{ t('home.appOverline') }}
            </div>
            <h2 class="landing-section-title">
              {{ t('home.appTitle') }}
            </h2>
          </div>
        </div>

        <div class="row q-col-gutter-lg q-mt-lg landing-app-grid">
          <div v-for="item in appItems" :key="item.title" class="col-12 col-sm-6 col-lg-4">
            <div class="landing-app-item">
              <q-avatar color="green-1" text-color="primary" size="44px" class="landing-app-item__icon">
                <q-icon :name="item.icon" />
              </q-avatar>
              <div>
                <h3 class="landing-card-title">{{ item.title }}</h3>
                <p class="landing-card-copy">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="landing-section landing-section--compact">
        <div class="row items-center q-col-gutter-xl">
          <div class="col-12 col-md-6">
            <div class="text-overline text-weight-bold text-accent">
              {{ t('home.problemOverline') }}
            </div>
            <h2 class="landing-section-title">
              {{ t('home.problemTitle') }}
            </h2>

            <q-list class="landing-clean-list">
              <q-item v-for="problem in breedingProblems" :key="problem" class="q-px-none">
                <q-item-section avatar>
                  <q-icon name="warning_amber" color="accent" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ problem }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <div class="col-12 col-md-6">
            <div class="landing-context-image">
              <q-img :src="imagePath('paper-notes.webp')" :alt="t('home.problemTitle')" fit="cover" no-spinner />
            </div>
          </div>

        </div>
      </section>

      <section class="landing-section landing-section--compact landing-section--soft">
        <div class="row items-center q-col-gutter-xl">
          <div class="col-12 col-md-6">
            <div class="text-overline text-weight-bold text-primary">
              {{ t('home.featuresOverline') }}
            </div>
            <h2 class="landing-section-title">
              {{ t('home.featuresTitle') }}
            </h2>
            <p class="landing-section-copy">
              {{ t('home.featuresDescription') }}
            </p>

            <q-list class="landing-clean-list">
              <q-item v-for="feature in recordFeatures" :key="feature.label" class="q-px-none">
                <q-item-section avatar>
                  <q-icon :name="feature.icon" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ feature.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <div class="col-12 col-md-6">
            <div class="landing-device-card">
              <div class="landing-tablet">
                <q-img :src="imagePath('dashboard-drawer.png')" :alt="t('home.featuresTitle')" fit="cover" no-spinner />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="landing-section landing-section--compact">
        <div class="row items-center q-col-gutter-xl">
          <div class="col-12 col-md-6">
            <div class="text-overline text-weight-bold text-primary">
              {{ t('home.offlineOverline') }}
            </div>
            <h2 class="landing-section-title">
              {{ t('home.offlineTitle') }}
            </h2>

            <q-list class="landing-clean-list">
              <q-item v-for="item in offlineBenefits" :key="item.label" class="q-px-none">
                <q-item-section avatar>
                  <q-icon :name="item.icon" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ item.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <div class="col-12 col-md-6">
            <div class="landing-context-image">
              <q-img :src="imagePath('fence-tablet.webp')" :alt="t('home.offlineTitle')" fit="cover" no-spinner />
            </div>
          </div>
        </div>
      </section>

      <section class="landing-section landing-section--compact landing-section--soft">
        <div class="row items-center q-col-gutter-xl">
          <div class="col-12 col-md-6">
            <div class="text-overline text-weight-bold text-primary">
              {{ t('home.premiumOverline') }}
            </div>
            <h2 class="landing-section-title">
              {{ t('home.premiumTitle') }}
            </h2>
            <p class="landing-section-copy">
              {{ t('home.premiumDescription') }}
            </p>

            <q-list class="landing-clean-list">
              <q-item v-for="item in premiumItems" :key="item" class="q-px-none">
                <q-item-section avatar>
                  <q-icon name="workspace_premium" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ item }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <div class="col-12 col-md-6">
            <div class="landing-sync-devices">
              <q-img :src="imagePath('sync-devices.webp')" :alt="t('home.premiumTitle')" fit="cover" no-spinner
                class="landing-sync-devices__image" />
              <q-badge color="primary" text-color="white" class="landing-sync-devices__badge">
                <q-icon name="cloud_done" class="q-mr-xs" />
                {{ t('settings.syncOverline') }}
              </q-badge>
            </div>
          </div>
        </div>
      </section>

      <section class="landing-section">
        <div class="row q-col-gutter-xl">
          <div class="col-12 col-md-7">
            <div class="text-overline text-weight-bold text-accent">
              {{ t('home.faqOverline') }}
            </div>
            <h2 class="landing-section-title">
              {{ t('home.faqTitle') }}
            </h2>

            <q-list>
              <q-item v-for="faq in faqs" :key="faq.question" class="q-px-none">
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ faq.question }}</q-item-label>
                  <q-item-label caption class="text-grey-7">{{ faq.answer }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div class="col-12 col-md-5">
            <div class="text-overline text-weight-bold text-primary">
              {{ t('home.guidesOverline') }}
            </div>
            <h2 class="landing-section-title">
              {{ t('home.guidesTitle') }}
            </h2>
            <p class="landing-section-copy">
              {{ t('home.guidesDescription') }}
            </p>
            <div>
              <q-btn outline color="primary" icon="menu_book" :label="t('home.openGuidesHub')" :to="guidesHubPath" />
            </div>
          </div>
        </div>
      </section>

      <section class="landing-section q-mb-md">
        <div class="row q-col-gutter-xl">
          <div class="col-12 col-md-6">
            <div class="text-overline text-weight-bold text-primary">
              {{ t('home.ctaOverline') }}
            </div>
            <h2 class="landing-section-title">
              {{ t('home.ctaTitle') }}
            </h2>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-auto">
                <q-btn unelevated color="primary" :label="installButtonLabel" icon="download" :disable="isInstalled"
                  class="full-width" @click="handleInstallClick" />
              </div>
              <div class="col-12 col-sm-auto">
                <q-btn outline color="primary" icon="dashboard" :label="t('common.openApp')" :to="dashboardPath"
                  class="full-width" />
              </div>
            </div>
            <div class="text-caption text-grey-7 q-mt-sm">{{ t('common.noSignupRequired') }}</div>
          </div>

          <div class="col-12 col-md-6">
            <GuideShareSection :title="t('brand.name')" :path="sharePath" message-prefix="homeShare" />
          </div>


        </div>
      </section>
    </q-card>
  </AppPageShell>
</template>

<script setup>
import { computed } from 'vue'
import { useMeta } from 'quasar'
import { useRoute } from 'vue-router'
import AppPageShell from 'src/components/AppPageShell.vue'
import GuideShareSection from 'src/components/GuideShareSection.vue'
import logoIcon from 'src/assets/logo-icon.png'
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
const sharePath = computed(() => buildLocalizedPath(routeLocale.value, '/'))
const guidesHubPath = computed(() => buildLocalizedPath(routeLocale.value, '/guides'))

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
    icon: ['pets', 'favorite', 'event_repeat', 'payments', 'family_restroom', 'history'][index] ?? 'task_alt',
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
    icon: ['pets', 'family_restroom', 'event', 'payments', 'dashboard', 'backup'][index] ?? 'task_alt',
  })),
)

function imagePath(name) {
  return `/images/landing/${name}`
}
</script>

<style scoped>
.landing-page-shell {
  padding: 0 8px 24px;
}

.landing-page {
  overflow: hidden;
}

.landing-hero {
  position: relative;
  min-height: 80svh;
  display: flex;
  overflow: hidden;
  border-radius: 0 0 8px 8px;
  background:
    linear-gradient(90deg, rgba(22, 55, 31, 0.92), rgba(22, 55, 31, 0.7) 48%, rgba(22, 55, 31, 0.36)),
    url('/images/landing/hero-farm.webp') center / cover;
  color: white;
}

.landing-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  backdrop-filter: blur(3px);
  background: rgba(0, 0, 0, 0.12);
}

.landing-hero__content {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 80svh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(32px, 6vw, 72px);
}

.landing-hero__overline {
  color: rgba(255, 255, 255, 0.85);
}

.landing-hero__title {
  max-width: 900px;
  margin: 14px 0 16px;
  font-size: clamp(2.15rem, 5vw, 4.8rem);
  line-height: 1.04;
  font-weight: 800;
  letter-spacing: 0;
}

.landing-hero__subtitle {
  max-width: 820px;
  margin: 0;
  color: rgba(255, 255, 255, 0.86);
  font-size: clamp(1rem, 2vw, 1.35rem);
  line-height: 1.55;
}

.landing-hero__bottom {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 430px);
  gap: 24px;
  align-items: end;
  margin-top: 48px;
}

.landing-hero__actions {
  max-width: 460px;
}

.landing-hero__secondary-action {
  color: white;
}

.landing-hero__trust {
  background: rgba(255, 255, 255, 0.13);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.landing-section {
  padding: clamp(44px, 7vw, 88px) clamp(16px, 4vw, 48px);
}

.landing-section--compact {
  padding-block: clamp(36px, 6vw, 72px);
}

.landing-section--soft {
  border-radius: 8px;
  background: linear-gradient(-135deg, #e8f3e7, #f7f7f1);
}

.landing-section--inside {
  padding-top: clamp(48px, 7vw, 80px);
}

.landing-section-heading {
  max-width: 900px;
}

.landing-heading-logo {
  width: 56px;
  height: 56px;
}

.landing-section-title {
  margin: 8px 0 16px;
  font-size: clamp(1.55rem, 2.4vw, 2.35rem);
  line-height: 1.18;
  font-weight: 800;
  letter-spacing: 0;
}

.landing-section-copy,
.landing-card-copy {
  color: #616161;
  line-height: 1.55;
}

.landing-card-title {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.3;
  font-weight: 700;
  letter-spacing: 0;
}

.landing-card-copy {
  margin: 8px 0 0;
}

.landing-app-item {
  height: 100%;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 18px;
  border: 1px solid #d9e2d7;
  border-radius: 8px;
  background: #fbfdf9;
}

.landing-app-item__icon {
  flex: 0 0 auto;
}

.landing-context-image {
  overflow: hidden;
  border: 1px solid #d9e2d7;
  border-radius: 8px;
  background: #f7faf6;
  box-shadow: 0 10px 24px rgba(28, 67, 38, 0.08);
}

.landing-context-image :deep(.q-img),
.landing-sync-devices__image {
  height: 100%;
}

.landing-clean-list :deep(.q-item) {
  min-height: 44px;
}

.landing-context-image {
  height: clamp(300px, 36vw, 430px);
}

.landing-device-card,
.landing-sync-devices {
  position: relative;
  min-height: 360px;
  border-radius: 8px;
  overflow: hidden;
  /*background: linear-gradient(135deg, #e8f3e7, #f7f7f1);*/
}

.landing-device-card {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px;
}

.landing-device-card__label {
  position: absolute;
  top: 22px;
  left: 24px;
  color: #35683b;
  font-weight: 700;
}

.landing-tablet,
.landing-sync-devices__large {
  overflow: hidden;
  width: min(92%, 520px);
  border: 12px solid;
  /* #243126  */
  border-radius: 8px;
  /*background: #243126;
  box-shadow: 0 20px 44px rgba(28, 67, 38, 0.2);*/
}

.landing-tablet :deep(.q-img),
.landing-sync-devices__large :deep(.q-img) {
  aspect-ratio: 4 / 3;
}

.landing-sync-devices {
  height: clamp(300px, 36vw, 430px);
  border: 1px solid #d9e2d7;
  box-shadow: 0 10px 24px rgba(28, 67, 38, 0.08);
}

.landing-sync-devices__badge {
  position: absolute;
  top: 28px;
  right: 28px;
}

@media (max-width: 1023px) {
  .landing-hero__bottom {
    grid-template-columns: 1fr;
  }

  .landing-hero__trust {
    max-width: 560px;
  }
}

@media (max-width: 599px) {
  .landing-page-shell {
    padding-inline: 0;
  }

  .landing-hero,
  .landing-hero__content {
    min-height: 76svh;
  }

  .landing-hero__content {
    padding: 28px 18px;
  }

  .landing-section {
    padding-inline: 14px;
  }

  .landing-device-card,
  .landing-context-image,
  .landing-sync-devices {
    min-height: 300px;
    height: 300px;
  }
}
</style>
