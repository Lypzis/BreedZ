<template>
  <AppPageShell>
        <q-card flat>
          <q-card-section class="row items-start justify-between q-col-gutter-md">
            <div class="col-12 col-md">
              <div class="text-overline text-weight-bold text-primary">{{ t('dashboard.overline') }}</div>
              <div class="text-h4 text-weight-bold q-mt-sm q-mb-sm">{{ t('dashboard.title') }}</div>
              <div class="text-body1 text-grey-7">
                {{ t('dashboard.description') }}
              </div>
            </div>

            <div class="col-12 col-md-auto">
              <div class="row q-gutter-sm justify-end">
                <q-btn
                  v-if="!hasAnimals"
                  unelevated
                  color="primary"
                  icon="pets"
                  :label="t('dashboard.addFirstAnimal')"
                  to="/animals"
                />
                <q-btn
                  v-else
                  unelevated
                  color="primary"
                  icon="add"
                  :label="t('common.addEvent')"
                  @click="openQuickEventDialog"
                />
                <q-btn
                  v-if="!hasAnimals"
                  outline
                  color="primary"
                  icon="assignment"
                  :label="t('common.addEvent')"
                  @click="openQuickEventDialog"
                />
                <q-btn
                  v-if="!hasAnimals"
                  outline
                  color="primary"
                  icon="school"
                  :label="t('home.openTutorial')"
                  to="/tutorial"
                />
                <q-btn
                  v-if="canShowSignInButton"
                  outline
                  color="primary"
                  icon="login"
                  :label="t('account.signIn')"
                  to="/account"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-section v-if="loadErrorMessage" class="q-pt-none">
            <q-banner rounded class="bg-red-1 text-negative">
              {{ loadErrorMessage }}
            </q-banner>
          </q-card-section>

          <q-card-section v-if="isBusy" class="q-py-xl">
            <div class="row justify-center">
              <q-spinner color="primary" size="40px" />
            </div>
          </q-card-section>

          <template v-else>
            <q-card-section v-if="!hasAnimals" class="q-pt-none">
              <q-banner rounded class="bg-grey-1 text-grey-8">
                <template #avatar>
                  <q-icon name="info" color="primary" />
                </template>
                <div>{{ t('dashboard.firstRunHint') }}</div>
              </q-banner>
            </q-card-section>

            <q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-4">
                  <q-banner rounded class="bg-green-1 text-primary">
                    <template #avatar>
                      <q-icon name="pets" color="primary" />
                    </template>
                    <div class="text-subtitle2 text-weight-bold">{{ t('dashboard.activeAnimalsTitle', { count: activeAnimals.length }) }}</div>
                    <div class="text-caption text-grey-8">{{ t('dashboard.activeAnimalsCaption') }}</div>
                  </q-banner>
                </div>

                <div class="col-12 col-sm-4">
                  <q-banner rounded class="bg-green-1 text-primary">
                    <template #avatar>
                      <q-icon name="today" color="primary" />
                    </template>
                    <div class="text-subtitle2 text-weight-bold">{{ t('dashboard.todayEventsTitle', { count: todayEvents.length }) }}</div>
                    <div class="text-caption text-grey-8">{{ todayEventsCaption }}</div>
                  </q-banner>
                </div>

                <div class="col-12 col-sm-4">
                  <q-banner rounded class="bg-green-1 text-primary">
                    <template #avatar>
                      <q-icon name="schedule" color="primary" />
                    </template>
                    <div class="text-subtitle2 text-weight-bold">{{ t('dashboard.upcomingEventsTitle', { count: upcomingEvents.length }) }}</div>
                    <div class="text-caption text-grey-8">{{ t('dashboard.upcomingEventsCaption') }}</div>
                  </q-banner>
                </div>
              </div>
            </q-card-section>

            <q-card-section >
              <div class="row items-center justify-between q-col-gutter-sm">
                <div class="col">
                  <div class="text-overline text-weight-bold text-accent">{{ t('dashboard.todayOverline') }}</div>
                  <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">{{ t('dashboard.todaySectionTitle') }}</div>
                </div>
                <div v-if="todayEvents.length > dashboardSectionLimit" class="col-auto">
                  <q-btn flat dense color="primary" :label="t('dashboard.viewAllEvents')" to="/events" />
                </div>
              </div>

                <q-banner v-if="todayEvents.length === 0" rounded class="bg-grey-1 text-grey-8">
                  <template #avatar>
                    <q-icon name="event_available" color="primary" />
                  </template>
                  {{ t('dashboard.todayEmpty') }}
                </q-banner>

              <q-list v-else separator>
                <EventListItem
                  v-for="event in todayEventsPreview"
                  :key="event.id"
                  :event="event"
                  :animal-resolver="animalById"
                  :detail-target="eventDetailTarget(event)"
                  :notes-fallback="t('common.noExtraNotesAdded')"
                  :show-animal-meta="false"
                  :show-date="false"
                  item-class="q-py-md"
                  :side-top="false"
                  @open="openEventDetail"
                />
              </q-list>

              <div v-if="todayEvents.length > dashboardSectionLimit" class="text-caption text-grey-7 q-mt-sm">
                {{ t('dashboard.showingToday', { shown: todayEventsPreview.length, total: todayEvents.length }) }}
              </div>
            </q-card-section>

            <q-card-section >
              <div class="row items-center justify-between q-col-gutter-sm">
                <div class="col">
                  <div class="text-overline text-weight-bold text-primary">{{ t('dashboard.upcomingOverline') }}</div>
                  <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">{{ t('dashboard.upcomingSectionTitle') }}</div>
                </div>
                <div v-if="upcomingEvents.length > dashboardSectionLimit" class="col-auto">
                  <q-btn flat dense color="primary" :label="t('dashboard.viewAllEvents')" to="/events" />
                </div>
              </div>

                <q-banner v-if="upcomingEvents.length === 0" rounded class="bg-grey-1 text-grey-8">
                  <template #avatar>
                    <q-icon name="event" color="primary" />
                  </template>
                  {{ t('dashboard.upcomingEmpty') }}
                </q-banner>

              <q-list v-else separator>
                <EventListItem
                  v-for="event in upcomingEventsPreview"
                  :key="event.id"
                  :event="event"
                  :animal-resolver="animalById"
                  :detail-target="eventDetailTarget(event)"
                  :show-animal-meta="false"
                  :show-notes="false"
                  item-class="q-py-md"
                  :side-top="false"
                  @open="openEventDetail"
                />
              </q-list>

              <div v-if="upcomingEvents.length > dashboardSectionLimit" class="text-caption text-grey-7 q-mt-sm">
                {{ t('dashboard.showingUpcoming', { shown: upcomingEventsPreview.length, total: upcomingEvents.length }) }}
              </div>
            </q-card-section>

            <q-card-section >
              <div class="row items-center justify-between q-col-gutter-sm">
                <div class="col">
                  <div class="text-overline text-weight-bold text-primary">{{ t('dashboard.needsSetupOverline') }}</div>
                  <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">{{ t('dashboard.needsSetupTitle') }}</div>
                </div>
                <div v-if="animalsWithoutEvents.length > dashboardSectionLimit" class="col-auto">
                  <q-btn flat dense color="primary" :label="t('dashboard.viewAllAnimals')" to="/animals" />
                </div>
              </div>

                <q-banner v-if="animalsWithoutEvents.length === 0" rounded class="bg-grey-1 text-grey-8">
                  <template #avatar>
                    <q-icon name="task_alt" color="primary" />
                  </template>
                  {{ t('dashboard.needsSetupEmpty') }}
                </q-banner>

              <q-list v-else separator>
                <AnimalListItem
                  v-for="animal in animalsWithoutEventsPreview"
                  :key="animal.id"
                  :animal="animal"
                  :caption-suffix="t('dashboard.needsSetupCaption')"
                  :detail-target="animalDetailTarget(animal)"
                  :show-age="false"
                  :show-breeder="false"
                  :show-sex="false"
                  :show-status="false"
                  item-class="q-py-md"
                  :side-top="false"
                  @open="openAnimalDetail"
                />
              </q-list>

              <div v-if="animalsWithoutEvents.length > dashboardSectionLimit" class="text-caption text-grey-7 q-mt-sm">
                {{ t('dashboard.showingNeedsSetup', { shown: animalsWithoutEventsPreview.length, total: animalsWithoutEvents.length }) }}
              </div>
            </q-card-section>

          </template>
        </q-card>
    <EventFormDialog
      v-model="isQuickEventDialogOpen"
      :animals="activeAnimals"
      :overline="t('dashboard.overline')"
      :title="t('dashboard.quickAddTitle')"
      @purchase-selected="openPurchaseDialog"
      @submit="submitQuickEvent"
    />
    <PurchaseEventDialog
      v-model="isPurchaseDialogOpen"
      :animals="animals"
      :current-animal-count="animals.length"
      :initial-animal-ids="initialPurchaseAnimalIds"
      :is-premium="isPremium"
      @submit="submitPurchaseEvent"
    />
  </AppPageShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import AppPageShell from 'src/components/AppPageShell.vue'
import AnimalListItem from 'src/components/AnimalListItem.vue'
import EventListItem from 'src/components/EventListItem.vue'
import EventFormDialog from 'src/components/EventFormDialog.vue'
import PurchaseEventDialog from 'src/components/PurchaseEventDialog.vue'
import { useI18nText } from 'src/i18n'
import { useAnimalsStore } from 'src/stores/animals-store'
import { useAuthStore } from 'src/stores/auth-store'
import { useEventsStore } from 'src/stores/events-store'
import { formatDisplayDate, todayDateString } from 'src/utils/dates'

const router = useRouter()
const $q = useQuasar()
const { t } = useI18nText()
const authStore = useAuthStore()
const animalsStore = useAnimalsStore()
const eventsStore = useEventsStore()

const {
  activeAnimals,
  animals,
  errorMessage: animalsErrorMessage,
  isLoading: animalsLoading,
} = storeToRefs(animalsStore)
const {
  errorMessage: eventsErrorMessage,
  events,
  isLoading: eventsLoading,
} = storeToRefs(eventsStore)
const { isLoaded: isAuthLoaded, isPremium, isSignedIn } = storeToRefs(authStore)

const isQuickEventDialogOpen = ref(false)
const isPurchaseDialogOpen = ref(false)
const initialPurchaseAnimalIds = ref([])
const hasHydrated = ref(false)
const dashboardSectionLimit = 5

const hasAnimals = computed(() => animals.value.length > 0)
const today = computed(() => (hasHydrated.value ? todayDateString() : ''))
const todayLabel = computed(() => (today.value ? formatDisplayDate(today.value) : ''))
const todayEventsCaption = computed(() =>
  hasHydrated.value
    ? t('dashboard.todayEventsCaption', { date: todayLabel.value })
    : t('dashboard.todayEventsCaptionGeneric'),
)
const isBusy = computed(() => animalsLoading.value || eventsLoading.value)
const loadErrorMessage = computed(() => animalsErrorMessage.value || eventsErrorMessage.value)
const canShowSignInButton = computed(() =>
  hasHydrated.value && isAuthLoaded.value && !isSignedIn.value,
)

const todayEvents = computed(() =>
  today.value ? events.value.filter((event) => event.date === today.value) : [],
)
const todayEventsPreview = computed(() => todayEvents.value.slice(0, dashboardSectionLimit))
const upcomingEvents = computed(() =>
  today.value ? events.value.filter((event) => event.date > today.value) : [],
)
const upcomingEventsPreview = computed(() => upcomingEvents.value.slice(0, dashboardSectionLimit))
const animalsWithoutEvents = computed(() => {
  const animalIdsWithEvents = new Set(
    events.value.flatMap((event) => event.animalIds ?? [event.animalId]),
  )

  return activeAnimals.value.filter((animal) => !animalIdsWithEvents.has(animal.id))
})
const animalsWithoutEventsPreview = computed(() =>
  animalsWithoutEvents.value.slice(0, dashboardSectionLimit),
)

function openQuickEventDialog() {
  isQuickEventDialogOpen.value = true
}

async function submitQuickEvent(payload) {
  try {
    await eventsStore.addEvent(payload)
    await animalsStore.loadAnimals()
    isQuickEventDialogOpen.value = false
    $q.notify({ color: 'positive', message: t('dashboard.eventAdded'), position: 'top' })
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: error instanceof Error ? error.message : t('dashboard.eventSaveFailed'),
      position: 'top',
    })
  }
}

function openPurchaseDialog(payload = {}) {
  initialPurchaseAnimalIds.value = payload.animalIds ?? []
  isPurchaseDialogOpen.value = true
}

async function submitPurchaseEvent(payload) {
  try {
    await eventsStore.addPurchaseEvent(payload)
    await animalsStore.loadAnimals()
    isPurchaseDialogOpen.value = false
    initialPurchaseAnimalIds.value = []
    $q.notify({ color: 'positive', message: t('dashboard.eventAdded'), position: 'top' })
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: error instanceof Error ? error.message : t('dashboard.eventSaveFailed'),
      position: 'top',
    })
  }
}

function animalById(id) {
  return animalsStore.getAnimalById(id)
}

function eventDetailTarget(event) {
  return { path: `/events/${event.id}`, query: { from: 'dashboard' } }
}

function openEventDetail(event) {
  void router.push(eventDetailTarget(event))
}

function animalDetailTarget(animal) {
  return { path: `/animals/${animal.id}`, query: { from: 'dashboard' } }
}

function openAnimalDetail(animal) {
  void router.push(animalDetailTarget(animal))
}

onMounted(async () => {
  hasHydrated.value = true

  try {
    if (!animalsStore.isLoaded) {
      await animalsStore.loadAnimals()
    }

    if (!eventsStore.isLoaded) {
      await eventsStore.loadEvents()
    }
  } catch {
    // store error messages are already exposed to the UI
  }
})
</script>
