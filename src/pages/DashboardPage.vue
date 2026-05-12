<template>
  <AppPageShell>
    <q-card flat>
      <q-card-section class="row items-start q-col-gutter-md">
        <div class="col-12">
          <div class="text-overline text-weight-bold text-primary">{{ t('dashboard.overline') }}</div>
          <div class="text-h4 text-weight-bold q-mt-sm q-mb-sm">{{ t('dashboard.title') }}</div>
          <div class="text-body1 text-grey-7">
            {{ t('dashboard.description') }}
          </div>
        </div>

        <div class="col-12">
          <div class="row q-gutter-sm">
            <q-btn v-if="showFirstRunActions" unelevated color="primary" icon="pets"
              :label="t('dashboard.addFirstAnimal')" to="/animals" />
            <q-btn v-else unelevated color="primary" icon="add" :label="t('common.addEvent')"
              @click="openQuickEventDialog" />
            <q-btn v-if="showFirstRunActions" outline color="primary" icon="assignment" :label="t('common.addEvent')"
              @click="openQuickEventDialog" />
            <q-btn v-if="showFirstRunActions" outline color="primary" icon="school" :label="t('home.openTutorial')"
              to="/tutorial" />
            <q-btn v-if="canShowSignInButton" outline color="primary" icon="login" :label="t('account.signIn')"
              to="/account" />
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
        <q-card-section v-if="showFirstRunActions" class="q-pt-none">
          <q-banner rounded class="bg-grey-1 text-grey-8">
            <template #avatar>
              <q-icon name="info" color="primary" />
            </template>
            <div>{{ t('dashboard.firstRunHint') }}</div>
          </q-banner>
        </q-card-section>

        <q-card-section>
          <q-banner rounded class="bg-green-1 text-primary">
            <template #avatar>
              <q-icon name="pets" color="primary" />
            </template>
            <div class="row items-center q-col-gutter-sm">
              <div class="col">
                <div class="text-subtitle2 text-weight-bold">
                  {{ t('dashboard.activeAnimalsTitle', { count: activeAnimals.length }) }}
                </div>
                <div class="text-caption text-grey-8">{{ t('dashboard.activeAnimalsCaption') }}</div>
              </div>
              <div class="col-auto">
                <q-btn flat dense color="primary" icon="arrow_forward" to="/animals" />
              </div>
            </div>
          </q-banner>
        </q-card-section>

        <q-card-section>
          <q-list>
            <DashboardSectionPanel :title="t('dashboard.todayEventsTitle', { count: todayEvents.length })"
              :caption="todayEventsCaption" :count="todayEvents.length" icon="today" avatar-color="primary"
              :default-opened="false">
              <DashboardEventPanelContent :events="todayEvents" :animal-resolver="animalById"
                :detail-target="eventDetailTarget" :empty-text="t('dashboard.todayEmpty')" empty-icon="event_available"
                showing-text-key="dashboard.showingToday" :notes-fallback="t('common.noExtraNotesAdded')"
                :show-date="false" @open="openEventDetail" />
            </DashboardSectionPanel>

            <DashboardSectionPanel :title="t('dashboard.upcomingEventsTitle', { count: upcomingEvents.length })"
              :caption="t('dashboard.upcomingEventsCaption')" :count="upcomingEvents.length" icon="schedule"
              avatar-color="primary" :default-opened="false">
              <DashboardEventPanelContent :events="upcomingEvents" :animal-resolver="animalById"
                :detail-target="eventDetailTarget" :empty-text="t('dashboard.upcomingEmpty')" empty-icon="event"
                showing-text-key="dashboard.showingUpcoming" :show-notes="false" @open="openEventDetail" />
            </DashboardSectionPanel>

            <DashboardSectionPanel
              :title="t('dashboard.needsConfirmationEventsTitle', { count: needsConfirmationEvents.length })"
              :caption="t('dashboard.needsConfirmationEventsCaption')" :count="needsConfirmationEvents.length"
              icon="pending_actions" avatar-color="warning" chip-color="orange-1" chip-text-color="warning"
              :default-opened="false">
              <DashboardEventPanelContent :events="needsConfirmationEvents" :animal-resolver="animalById"
                :detail-target="eventDetailTarget" :empty-text="t('dashboard.needsConfirmationEmpty')"
                empty-icon="task_alt" showing-text-key="dashboard.showingNeedsConfirmation" :show-notes="false"
                @open="openEventDetail" />
            </DashboardSectionPanel>

            <DashboardSectionPanel :title="t('dashboard.pregnancyChecksDueTitle', { count: pregnancyChecksDue.length })"
              :caption="t('dashboard.pregnancyChecksDueCaption')" :count="pregnancyChecksDue.length" icon="fact_check"
              avatar-color="primary" :default-opened="false">
              <DashboardEventPanelContent :events="pregnancyChecksDue" :animal-resolver="animalById"
                :detail-target="eventDetailTarget" :empty-text="t('dashboard.pregnancyChecksDueEmpty')"
                empty-icon="task_alt" showing-text-key="dashboard.showingPregnancyChecksDue" :show-notes="false"
                @open="openEventDetail" />
            </DashboardSectionPanel>

            <DashboardSectionPanel
              :title="t('dashboard.overdueExpectedBirthsTitle', { count: overdueExpectedBirths.length })"
              :caption="t('dashboard.overdueExpectedBirthsCaption')" :count="overdueExpectedBirths.length"
              icon="event_busy" avatar-color="warning" chip-color="orange-1" chip-text-color="warning"
              :default-opened="false">
              <DashboardEventPanelContent :events="overdueExpectedBirths" :animal-resolver="animalById"
                :detail-target="eventDetailTarget" :empty-text="t('dashboard.overdueExpectedBirthsEmpty')"
                empty-icon="task_alt" showing-text-key="dashboard.showingOverdueExpectedBirths" :show-notes="false"
                @open="openEventDetail" />
            </DashboardSectionPanel>

            <DashboardSectionPanel
              :title="t('dashboard.expectedBirthsDueSoonTitle', { count: expectedBirthsDueSoon.length })"
              :caption="t('dashboard.expectedBirthsDueSoonCaption')" :count="expectedBirthsDueSoon.length"
              icon="event_repeat" avatar-color="secondary"
              :default-opened="false">
              <DashboardEventPanelContent :events="expectedBirthsDueSoon" :animal-resolver="animalById"
                :detail-target="eventDetailTarget" :empty-text="t('dashboard.expectedBirthsDueSoonEmpty')"
                empty-icon="event_available" showing-text-key="dashboard.showingExpectedBirthsDueSoon"
                :show-notes="false" @open="openEventDetail" />
            </DashboardSectionPanel>

            <DashboardSectionPanel
              :title="t('dashboard.unresolvedBreedingsTitle', { count: unresolvedBreedings.length })"
              :caption="t('dashboard.unresolvedBreedingsCaption')" :count="unresolvedBreedings.length" icon="favorite"
              avatar-color="primary" :default-opened="false">
              <DashboardEventPanelContent :events="unresolvedBreedings" :animal-resolver="animalById"
                :detail-target="eventDetailTarget" :empty-text="t('dashboard.unresolvedBreedingsEmpty')"
                empty-icon="task_alt" showing-text-key="dashboard.showingUnresolvedBreedings" :show-notes="false"
                @open="openEventDetail" />
            </DashboardSectionPanel>

            <DashboardSectionPanel
              :title="t('dashboard.needsSetupTitleWithCount', { count: animalsWithoutEvents.length })"
              :caption="t('dashboard.needsSetupCaption')" :count="animalsWithoutEvents.length" icon="assignment"
              avatar-color="primary" :default-opened="false">
              <DashboardAnimalPanelContent :animals="animalsWithoutEvents"
                :caption-suffix="t('dashboard.needsSetupCaption')" :detail-target="animalDetailTarget"
                :empty-text="t('dashboard.needsSetupEmpty')" showing-text-key="dashboard.showingNeedsSetup"
                @open="openAnimalDetail" />
            </DashboardSectionPanel>
          </q-list>
        </q-card-section>
      </template>
    </q-card>

    <EventFormDialog v-model="isQuickEventDialogOpen" :animals="activeAnimals" :events="events"
      :overline="t('dashboard.overline')" :title="t('dashboard.quickAddTitle')" @purchase-selected="openPurchaseDialog"
      @submit="submitQuickEvent" />
    <PurchaseEventDialog v-model="isPurchaseDialogOpen" :animals="animals" :current-animal-count="animals.length"
      :initial-animal-ids="initialPurchaseAnimalIds" :is-premium="isPremium" @submit="submitPurchaseEvent" />
  </AppPageShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import AppPageShell from 'src/components/AppPageShell.vue'
import DashboardAnimalPanelContent from 'src/components/DashboardAnimalPanelContent.vue'
import DashboardEventPanelContent from 'src/components/DashboardEventPanelContent.vue'
import DashboardSectionPanel from 'src/components/DashboardSectionPanel.vue'
import EventFormDialog from 'src/components/EventFormDialog.vue'
import PurchaseEventDialog from 'src/components/PurchaseEventDialog.vue'
import { useI18nText } from 'src/i18n'
import { useAnimalsStore } from 'src/stores/animals-store'
import { useAuthStore } from 'src/stores/auth-store'
import { useEventsStore } from 'src/stores/events-store'
import { buildDashboardLifecycleSections } from 'src/utils/dashboard-lifecycle'
import { formatDisplayDate, todayDateString } from 'src/utils/dates'
import { getEventAnimalIds, isEventNeedingConfirmation, isFutureScheduledEvent } from 'src/utils/event-records'

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

const hasAnimals = computed(() => animals.value.length > 0)
const showFirstRunActions = computed(() => animalsStore.isLoaded && !hasAnimals.value)
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

function sortEventsByDateAsc(items) {
  return [...items].sort((left, right) => (left.date ?? '').localeCompare(right.date ?? ''))
}

const todayEvents = computed(() =>
  today.value
    ? sortEventsByDateAsc(
      events.value.filter(
        (event) => event.date === today.value && !isEventNeedingConfirmation(event, today.value),
      ),
    )
    : [],
)
const upcomingEvents = computed(() =>
  today.value
    ? sortEventsByDateAsc(events.value.filter((event) => isFutureScheduledEvent(event, today.value)))
    : [],
)
const needsConfirmationEvents = computed(() =>
  today.value
    ? sortEventsByDateAsc(events.value.filter((event) => isEventNeedingConfirmation(event, today.value)))
    : [],
)
const lifecycleSections = computed(() =>
  today.value ? buildDashboardLifecycleSections(events.value, today.value) : null,
)
const pregnancyChecksDue = computed(() => lifecycleSections.value?.pregnancyChecksDue ?? [])
const expectedBirthsDueSoon = computed(() => lifecycleSections.value?.expectedBirthsDueSoon ?? [])
const overdueExpectedBirths = computed(() => lifecycleSections.value?.overdueExpectedBirths ?? [])
const unresolvedBreedings = computed(() => lifecycleSections.value?.unresolvedBreedings ?? [])
const animalsWithoutEvents = computed(() => {
  const animalIdsWithEvents = new Set(
    events.value.flatMap((event) => getEventAnimalIds(event)),
  )

  return activeAnimals.value.filter((animal) => !animalIdsWithEvents.has(animal.id))
})
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
