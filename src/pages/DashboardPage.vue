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
                  v-if="showFirstRunActions"
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
                  v-if="showFirstRunActions"
                  outline
                  color="primary"
                  icon="assignment"
                  :label="t('common.addEvent')"
                  @click="openQuickEventDialog"
                />
                <q-btn
                  v-if="showFirstRunActions"
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
            <q-card-section v-if="showFirstRunActions" class="q-pt-none">
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

              <template v-else>
                <PagedListControls
                  :current-page="todayCurrentPage"
                  :list-mode="todayListMode"
                  :list-mode-options="listModeOptions"
                  :page-count="todayPageCount"
                  :page-size="todayPageSize"
                  :page-size-options="pageSizeOptions"
                  :per-page-label="t('common.perPage')"
                  :showing-text="t('dashboard.showingToday', { shown: displayedTodayEventsCount, total: todayEvents.length })"
                  :show-pagination="false"
                  @update:current-page="todayCurrentPage = $event"
                  @update:list-mode="todayListMode = $event"
                  @update:page-size="todayPageSize = $event"
                />

                <q-list separator>
                  <EventListItem
                    v-for="event in displayedTodayEvents"
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

                <PagedListControls
                  :current-page="todayCurrentPage"
                  :list-mode="todayListMode"
                  :list-mode-options="listModeOptions"
                  :page-count="todayPageCount"
                  :page-size="todayPageSize"
                  :page-size-options="pageSizeOptions"
                  :per-page-label="t('common.perPage')"
                  :showing-text="t('dashboard.showingToday', { shown: displayedTodayEventsCount, total: todayEvents.length })"
                  :show-header="false"
                  @update:current-page="todayCurrentPage = $event"
                  @update:list-mode="todayListMode = $event"
                  @update:page-size="todayPageSize = $event"
                />
              </template>
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

              <template v-else>
                <PagedListControls
                  :current-page="upcomingCurrentPage"
                  :list-mode="upcomingListMode"
                  :list-mode-options="listModeOptions"
                  :page-count="upcomingPageCount"
                  :page-size="upcomingPageSize"
                  :page-size-options="pageSizeOptions"
                  :per-page-label="t('common.perPage')"
                  :showing-text="t('dashboard.showingUpcoming', { shown: displayedUpcomingEventsCount, total: upcomingEvents.length })"
                  :show-pagination="false"
                  @update:current-page="upcomingCurrentPage = $event"
                  @update:list-mode="upcomingListMode = $event"
                  @update:page-size="upcomingPageSize = $event"
                />

                <q-list separator>
                  <EventListItem
                    v-for="event in displayedUpcomingEvents"
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

                <PagedListControls
                  :current-page="upcomingCurrentPage"
                  :list-mode="upcomingListMode"
                  :list-mode-options="listModeOptions"
                  :page-count="upcomingPageCount"
                  :page-size="upcomingPageSize"
                  :page-size-options="pageSizeOptions"
                  :per-page-label="t('common.perPage')"
                  :showing-text="t('dashboard.showingUpcoming', { shown: displayedUpcomingEventsCount, total: upcomingEvents.length })"
                  :show-header="false"
                  @update:current-page="upcomingCurrentPage = $event"
                  @update:list-mode="upcomingListMode = $event"
                  @update:page-size="upcomingPageSize = $event"
                />
              </template>
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

              <template v-else>
                <PagedListControls
                  :current-page="needsSetupCurrentPage"
                  :list-mode="needsSetupListMode"
                  :list-mode-options="listModeOptions"
                  :page-count="needsSetupPageCount"
                  :page-size="needsSetupPageSize"
                  :page-size-options="pageSizeOptions"
                  :per-page-label="t('common.perPage')"
                  :showing-text="t('dashboard.showingNeedsSetup', { shown: displayedNeedsSetupAnimalsCount, total: animalsWithoutEvents.length })"
                  :show-pagination="false"
                  @update:current-page="needsSetupCurrentPage = $event"
                  @update:list-mode="needsSetupListMode = $event"
                  @update:page-size="needsSetupPageSize = $event"
                />

                <q-list separator>
                  <AnimalListItem
                    v-for="animal in displayedNeedsSetupAnimals"
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

                <PagedListControls
                  :current-page="needsSetupCurrentPage"
                  :list-mode="needsSetupListMode"
                  :list-mode-options="listModeOptions"
                  :page-count="needsSetupPageCount"
                  :page-size="needsSetupPageSize"
                  :page-size-options="pageSizeOptions"
                  :per-page-label="t('common.perPage')"
                  :showing-text="t('dashboard.showingNeedsSetup', { shown: displayedNeedsSetupAnimalsCount, total: animalsWithoutEvents.length })"
                  :show-header="false"
                  @update:current-page="needsSetupCurrentPage = $event"
                  @update:list-mode="needsSetupListMode = $event"
                  @update:page-size="needsSetupPageSize = $event"
                />
              </template>
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
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import AppPageShell from 'src/components/AppPageShell.vue'
import AnimalListItem from 'src/components/AnimalListItem.vue'
import EventListItem from 'src/components/EventListItem.vue'
import EventFormDialog from 'src/components/EventFormDialog.vue'
import PagedListControls from 'src/components/PagedListControls.vue'
import PurchaseEventDialog from 'src/components/PurchaseEventDialog.vue'
import { useI18nText } from 'src/i18n'
import { useAnimalsStore } from 'src/stores/animals-store'
import { useAuthStore } from 'src/stores/auth-store'
import { useEventsStore } from 'src/stores/events-store'
import { formatDisplayDate, todayDateString } from 'src/utils/dates'
import { getEventAnimalIds } from 'src/utils/event-records'

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
const todayListMode = ref('paged')
const todayCurrentPage = ref(1)
const todayPageSize = ref(5)
const upcomingListMode = ref('paged')
const upcomingCurrentPage = ref(1)
const upcomingPageSize = ref(5)
const needsSetupListMode = ref('paged')
const needsSetupCurrentPage = ref(1)
const needsSetupPageSize = ref(5)
const pageSizeOptions = [
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '25', value: 25 },
]
const listModeOptions = computed(() => [
  { label: t('common.pages'), value: 'paged' },
  { label: t('common.viewAll'), value: 'all' },
])

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

const todayEvents = computed(() =>
  today.value ? events.value.filter((event) => event.date === today.value) : [],
)
const todayPageCount = computed(() =>
  Math.max(1, Math.ceil(todayEvents.value.length / todayPageSize.value)),
)
const paginatedTodayEvents = computed(() => {
  const start = (todayCurrentPage.value - 1) * todayPageSize.value
  return todayEvents.value.slice(start, start + todayPageSize.value)
})
const displayedTodayEvents = computed(() =>
  todayListMode.value === 'paged' ? paginatedTodayEvents.value : todayEvents.value,
)
const displayedTodayEventsCount = computed(() => displayedTodayEvents.value.length)
const upcomingEvents = computed(() =>
  today.value ? events.value.filter((event) => event.date > today.value) : [],
)
const upcomingPageCount = computed(() =>
  Math.max(1, Math.ceil(upcomingEvents.value.length / upcomingPageSize.value)),
)
const paginatedUpcomingEvents = computed(() => {
  const start = (upcomingCurrentPage.value - 1) * upcomingPageSize.value
  return upcomingEvents.value.slice(start, start + upcomingPageSize.value)
})
const displayedUpcomingEvents = computed(() =>
  upcomingListMode.value === 'paged' ? paginatedUpcomingEvents.value : upcomingEvents.value,
)
const displayedUpcomingEventsCount = computed(() => displayedUpcomingEvents.value.length)
const animalsWithoutEvents = computed(() => {
  const animalIdsWithEvents = new Set(
    events.value.flatMap((event) => getEventAnimalIds(event)),
  )

  return activeAnimals.value.filter((animal) => !animalIdsWithEvents.has(animal.id))
})
const needsSetupPageCount = computed(() =>
  Math.max(1, Math.ceil(animalsWithoutEvents.value.length / needsSetupPageSize.value)),
)
const paginatedNeedsSetupAnimals = computed(() => {
  const start = (needsSetupCurrentPage.value - 1) * needsSetupPageSize.value
  return animalsWithoutEvents.value.slice(start, start + needsSetupPageSize.value)
})
const displayedNeedsSetupAnimals = computed(() =>
  needsSetupListMode.value === 'paged'
    ? paginatedNeedsSetupAnimals.value
    : animalsWithoutEvents.value,
)
const displayedNeedsSetupAnimalsCount = computed(() => displayedNeedsSetupAnimals.value.length)

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

watch([todayEvents, todayListMode, todayPageSize], () => {
  todayCurrentPage.value = 1
})

watch(todayPageCount, () => {
  if (todayCurrentPage.value > todayPageCount.value) {
    todayCurrentPage.value = todayPageCount.value
  }
})

watch([upcomingEvents, upcomingListMode, upcomingPageSize], () => {
  upcomingCurrentPage.value = 1
})

watch(upcomingPageCount, () => {
  if (upcomingCurrentPage.value > upcomingPageCount.value) {
    upcomingCurrentPage.value = upcomingPageCount.value
  }
})

watch([animalsWithoutEvents, needsSetupListMode, needsSetupPageSize], () => {
  needsSetupCurrentPage.value = 1
})

watch(needsSetupPageCount, () => {
  if (needsSetupCurrentPage.value > needsSetupPageCount.value) {
    needsSetupCurrentPage.value = needsSetupPageCount.value
  }
})

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
