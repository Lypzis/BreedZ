<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-6">
        <section class="q-mb-lg">
          <q-card flat>
            <q-card-section class="column items-start">
              <div class="text-overline text-weight-bold text-primary">BreedZ</div>
              <h1 class="text-h2 text-weight-bold q-mt-sm q-mb-md">Track your herd. Even offline.</h1>
              <div class="text-subtitle1 text-grey-7">
                Track breeding, births, and herd history with less paperwork and less guesswork for daily farm recordkeeping.
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
                <q-btn outline color="primary" label="See how it works" to="/app/tutorial" />
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
                    <q-img :src="logoFull" fit="contain" no-spinner class="full-width" />
                    <q-banner rounded class=" text-primary q-mt-md">
                      <template #avatar>
                        <q-icon name="task_alt" color="primary" />
                      </template>
                      Designed for real farm use: simple, offline, no clutter.
                    </q-banner>
                  </div>
                  <div class="col-12 col-xl-7">
                    <q-card flat class="bg-grey-1">
                      <q-card-section>
                        <div class="text-overline text-weight-bold text-primary">Inside The App</div>
                        <div class="text-subtitle1 text-weight-medium q-mb-md">
                          What BreedZ already helps you do
                        </div>

                        <q-list>
                          <q-item>
                            <q-item-section avatar>
                              <q-avatar color="secondary" text-color="dark" icon="pets" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-medium">Track each animal</q-item-label>
                              <q-item-label caption>Save tag, name, sex, status, and birth date in one place.</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-chip dense color="secondary" text-color="dark">Animals</q-chip>
                            </q-item-section>
                          </q-item>

                          <q-item>
                            <q-item-section avatar>
                              <q-avatar color="primary" text-color="white" icon="family_restroom" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-medium">Keep lineage linked</q-item-label>
                              <q-item-label caption>Connect dam, sire, and offspring without paper notes.</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-chip dense color="accent" text-color="white">Lineage</q-chip>
                            </q-item-section>
                          </q-item>

                          <q-item>
                            <q-item-section avatar>
                              <q-avatar color="accent" text-color="white" icon="event" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-medium">Record herd events</q-item-label>
                              <q-item-label caption>Log breeding, calving, vaccination, health, and custom records.</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-chip dense color="primary" text-color="white">Events</q-chip>
                            </q-item-section>
                          </q-item>

                          <q-item>
                            <q-item-section avatar>
                              <q-avatar color="secondary" text-color="dark" icon="dashboard" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-medium">See what needs attention</q-item-label>
                              <q-item-label caption>Use the dashboard for today, upcoming work, and animals missing history.</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-chip dense color="secondary" text-color="dark">Today</q-chip>
                            </q-item-section>
                          </q-item>

                          <q-item>
                            <q-item-section avatar>
                              <q-avatar color="primary" text-color="white" icon="save" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-medium">Back up your data</q-item-label>
                              <q-item-label caption>Export and import JSON backups locally on your device.</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-chip dense color="primary" text-color="white">Backup</q-chip>
                            </q-item-section>
                          </q-item>
                        </q-list>

                        <q-btn
                          unelevated
                          color="primary"
                          label="Open dashboard"
                          icon="dashboard"
                          to="/app"
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
              <div class="text-overline text-weight-bold text-accent">The Problem</div>
              <div class="text-h4 text-weight-bold q-mt-sm q-mb-md">
                Breeding records get lost fast
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
              <div class="text-overline text-weight-bold text-primary">What You Get</div>
              <div class="text-h4 text-weight-bold q-mt-sm q-mb-md">
                Keep every animal and breeding record organized
              </div>
              <div class="text-body1 text-grey-7 q-mb-md">
                Built for cattle breeding records, livestock history, and simple herd record keeping on the farm.
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
              <div class="text-overline text-weight-bold text-primary">How It Works</div>
              <div class="text-h4 text-weight-bold q-mt-sm q-mb-md">
                Simple to use in the field
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
              <div class="text-overline text-weight-bold text-primary">Offline First</div>
              <div class="text-h4 text-weight-bold q-mt-sm q-mb-md">
                Built for farms without reliable internet
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
              <div class="text-overline text-weight-bold text-primary">Get Started</div>
              <div class="text-h4 text-weight-bold q-mt-sm q-mb-md">
                Start managing your herd today
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
                  <q-btn outline color="primary" label="See how it works" to="/app/tutorial" class="q-mb-sm" />
                </div>
              </div>
              <div class="text-caption text-grey-7">No signup required</div>
            </q-card-section>
          </q-card>
        </section>

        <section>
          <q-card flat>
            <q-card-section>
              <div class="text-overline text-weight-bold text-accent">FAQ</div>
              <div class="text-h4 text-weight-bold q-mt-sm q-mb-md">Frequently asked questions</div>

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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useMeta } from 'quasar'
import logoFull from 'src/assets/logo-hero.webp'
import { buildPageMeta } from 'src/utils/seo-meta'

useMeta(
  buildPageMeta({
    title: 'Offline Herd Management App',
    description:
      'BreedZ is an offline herd management app for cattle breeding records, animal history, lineage tracking, and farm recordkeeping in the field.',
    path: '/',
  }),
)

const deferredInstallPrompt = ref(null)
const installHintVisible = ref(false)
const installStatusMessage = ref('')
const isIos = ref(false)
const isFirefox = ref(false)
const isInstalled = ref(false)

const installButtonLabel = computed(() => (isInstalled.value ? 'Installed' : 'Install app'))
const installInstructions = computed(() =>
  isIos.value
    ? 'On iPhone or iPad, use Share and then Add to Home Screen.'
    : isFirefox.value
      ? 'Firefox may not show a native install prompt. Use the browser menu or create a shortcut manually.'
      : 'Use Install app here or the install icon in the browser bar when it appears.'
)

function checkStandaloneMode() {
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true

  isInstalled.value = isStandalone
}

function onBeforeInstallPrompt(event) {
  event.preventDefault()
  deferredInstallPrompt.value = event
}

function onAppInstalled() {
  isInstalled.value = true
  deferredInstallPrompt.value = null
  installHintVisible.value = false
  installStatusMessage.value = 'BreedZ is installed and ready to use from your home screen.'
}

async function handleInstallClick() {
  installStatusMessage.value = ''

  if (isInstalled.value) {
    installStatusMessage.value = 'BreedZ is already installed and ready to use.'
    installHintVisible.value = true
    return
  }

  if (deferredInstallPrompt.value !== null) {
    const promptEvent = deferredInstallPrompt.value
    promptEvent.prompt()

    const choice = await promptEvent.userChoice

    if (choice.outcome === 'accepted') {
      installStatusMessage.value = 'Finish adding BreedZ from your browser install prompt.'
    }

    deferredInstallPrompt.value = null
    return
  }

  installHintVisible.value = true
}

onMounted(() => {
  const userAgent = window.navigator.userAgent.toLowerCase()

  isIos.value = /iphone|ipad|ipod/.test(userAgent) && !window.matchMedia('(display-mode: standalone)').matches
  isFirefox.value = userAgent.includes('firefox')
  checkStandaloneMode()

  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  window.addEventListener('appinstalled', onAppInstalled)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  window.removeEventListener('appinstalled', onAppInstalled)
})

const breedingProblems = [
  'Miss breeding windows and lose follow-up time',
  'No clear history when you need to check one animal fast',
  'Births and lineage get harder to verify later',
  'Notes end up scattered across paper, chat, and memory',
]

const recordFeatures = [
  { icon: 'pets', label: 'Track each animal' },
  { icon: 'event', label: 'Record breeding events' },
  { icon: 'child_friendly', label: 'Track births and lineage' },
  { icon: 'article', label: 'Full history per animal' },
]

const fieldSteps = [
  { step: '1', label: 'Add your animals' },
  { step: '2', label: 'Record breeding, births, and notes' },
  { step: '3', label: 'Check history anytime' },
]

const offlineBenefits = [
  { icon: 'wifi_off', label: 'Works fully offline' },
  { icon: 'save', label: 'Data saved on your device' },
  // { icon: 'sync', label: 'Sync when connection returns' }, future paid feature
]

const faqs = [
  {
    question: 'What is the BreedZ app?',
    answer: 'BreedZ is a herd management app for cattle breeding records, livestock history, and offline field work.',
  },
  { question: 'Does it work offline?', answer: 'Yes, BreedZ works without an internet connection.' },
  { question: 'Is my data safe?', answer: 'Yes, stored locally.' },
  {
    question: 'How do I install it?',
    answer: 'Use the install button or the browser install icon. On iPhone or iPad, use Share > Add to Home Screen.',
  },
  {
    question: 'What does installing mean?',
    answer: 'It saves BreedZ to your home screen or app launcher so it opens like an app.',
  },
  { question: 'Can I sync later?', answer: 'Coming soon.' },
]
</script>
