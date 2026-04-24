<template>
  <AppPageShell>
        <q-card flat>
          <q-card-section class="row items-start justify-between q-col-gutter-md">
            <div class="col-12 col-md">
              <div class="text-overline text-weight-bold text-primary">{{ t('events.overline') }}</div>
              <div class="text-h4 text-weight-bold q-mt-sm q-mb-sm">{{ t('events.title') }}</div>
              <div class="text-body1 text-grey-7">
                {{ t('events.description') }}
              </div>
            </div>

            <div class="col-12 col-md-auto">
              <q-btn
                unelevated
                color="primary"
                icon="add"
                :label="t('events.addEvent')"
                @click="openEventDialog"
              />
            </div>
          </q-card-section>

          <q-card-section class="row q-col-gutter-sm">
            <div class="col-12 col-md">
              <q-input
                v-model="searchTerm"
                outlined
                dense
                clearable
                :label="t('events.searchLabel')"
                :placeholder="t('events.searchPlaceholder')"
              >
                <template #prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-4">
              <q-select
                v-model="selectedEventType"
                outlined
                dense
                clearable
                :label="t('events.typeFilter')"
                :options="eventTypeOptions"
                emit-value
                map-options
              >
                <template #prepend>
                  <q-icon
                    v-if="selectedEventTypeOption"
                    :name="selectedEventTypeOption.icon"
                    :color="selectedEventTypeOption.color"
                  />
                </template>
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-icon :name="scope.opt.icon" :color="scope.opt.color" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model="startDate" outlined dense type="date" :label="t('events.fromDate')" />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model="endDate" outlined dense type="date" :label="t('events.toDate')" />
            </div>
          </q-card-section>

          <PagedListControls
            :current-page="currentPage"
            :list-mode="listMode"
            :list-mode-options="listModeOptions"
            :page-count="pageCount"
            :page-size="pageSize"
            :page-size-options="pageSizeOptions"
            :per-page-label="t('common.perPage')"
            :showing-text="t('events.showingCount', { shown: displayedEventsCount, total: filteredEvents.length })"
            :show-pagination="false"
            @update:current-page="currentPage = $event"
            @update:list-mode="listMode = $event"
            @update:page-size="pageSize = $event"
          />

          <q-card-section v-if="loadErrorMessage" class="q-pt-none">
            <q-banner rounded class="bg-red-1 text-negative">
              {{ loadErrorMessage }}
            </q-banner>
          </q-card-section>

          <q-card-section v-if="isBusy" class="q-pt-none">
            <div class="row justify-center q-py-xl">
              <q-spinner color="primary" size="40px" />
            </div>
          </q-card-section>

          <q-card-section v-else-if="filteredEvents.length === 0" class="q-pt-none">
            <q-banner rounded class="bg-grey-1 text-grey-8">
              <template #avatar>
                <q-icon name="event_busy" color="primary" />
              </template>
              {{ emptyStateMessage }}
            </q-banner>
          </q-card-section>

          <q-list v-else-if="listMode === 'paged'" separator >
            <EventListItem
              v-for="event in paginatedEvents"
              :key="event.id"
              :event="event"
              :animal-resolver="animalById"
              :detail-target="eventDetailTarget(event)"
              item-class="q-py-md"
              @open="openEventDetail"
            >
              <template #actions="{ event: itemEvent }">
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="edit"
                  :aria-label="t('events.editEvent')"
                  :title="t('events.editEvent')"
                  @click.stop="openEditDialog(itemEvent)"
                />
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  :aria-label="t('events.deleteEvent')"
                  :title="t('events.deleteEvent')"
                  @click.stop="confirmDeleteEvent(itemEvent)"
                />
              </template>
            </EventListItem>
          </q-list>

          <q-virtual-scroll
            v-else
            :items="filteredEvents"
            :virtual-scroll-item-size="88"
            style="max-height: 70vh"
          >
            <template #default="{ item: event, index }">
              <div :key="event.id">
                <EventListItem
                  :event="event"
                  :animal-resolver="animalById"
                  :detail-target="eventDetailTarget(event)"
                  @open="openEventDetail"
                >
                  <template #actions="{ event: itemEvent }">
                    <q-btn
                      flat
                      round
                      dense
                      color="primary"
                      icon="edit"
                      :aria-label="t('events.editEvent')"
                      :title="t('events.editEvent')"
                      @click.stop="openEditDialog(itemEvent)"
                    />
                    <q-btn
                      flat
                      round
                      dense
                      color="negative"
                      icon="delete"
                      :aria-label="t('events.deleteEvent')"
                      :title="t('events.deleteEvent')"
                      @click.stop="confirmDeleteEvent(itemEvent)"
                    />
                  </template>
                </EventListItem>
                <q-separator v-if="index < filteredEvents.length - 1" />
              </div>
            </template>
          </q-virtual-scroll>

          <PagedListControls
            :current-page="currentPage"
            :list-mode="listMode"
            :list-mode-options="listModeOptions"
            :page-count="pageCount"
            :page-size="pageSize"
            :page-size-options="pageSizeOptions"
            :per-page-label="t('common.perPage')"
            :showing-text="t('events.showingCount', { shown: displayedEventsCount, total: filteredEvents.length })"
            :show-header="false"
            @update:current-page="currentPage = $event"
            @update:list-mode="listMode = $event"
            @update:page-size="pageSize = $event"
          />

        </q-card>

    <EventFormDialog
      v-model="isEventDialogOpen"
      :animals="animals"
      :event="selectedEvent"
      :mode="eventFormMode"
      :title="eventDialogTitle"
      @purchase-selected="openPurchaseDialog"
      @submit="submitEvent"
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
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import AppPageShell from 'src/components/AppPageShell.vue'
import EventListItem from 'src/components/EventListItem.vue'
import EventFormDialog from 'src/components/EventFormDialog.vue'
import PagedListControls from 'src/components/PagedListControls.vue'
import PurchaseEventDialog from 'src/components/PurchaseEventDialog.vue'
import { getEventTypeMeta, getEventTypeOptions } from 'src/constants/events'
import { useI18nText } from 'src/i18n'
import { useAnimalsStore } from 'src/stores/animals-store'
import { useAuthStore } from 'src/stores/auth-store'
import { useEventsStore } from 'src/stores/events-store'
import { filterEventsList } from 'src/utils/list-filters'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const { t } = useI18nText()
const animalsStore = useAnimalsStore()
const authStore = useAuthStore()
const eventsStore = useEventsStore()

const { animals, errorMessage: animalsErrorMessage, isLoading: animalsLoading } = storeToRefs(animalsStore)
const { isPremium } = storeToRefs(authStore)
const { errorMessage: eventsErrorMessage, events, isLoading: eventsLoading } = storeToRefs(eventsStore)

const isEventDialogOpen = ref(false)
const isPurchaseDialogOpen = ref(false)
const initialPurchaseAnimalIds = ref([])
const eventFormMode = ref('create')
const selectedEventId = ref('')
const listMode = ref('paged')
const currentPage = ref(1)
const pageSize = ref(10)
const searchTerm = ref('')
const selectedEventType = ref('')
const startDate = ref('')
const endDate = ref('')
const pageSizeOptions = [
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
]
const listModeOptions = computed(() => [
  { label: t('common.pages'), value: 'paged' },
  { label: t('common.viewAll'), value: 'all' },
])
const eventTypeOptions = computed(() => getEventTypeOptions())
const selectedEventTypeOption = computed(() =>
  eventTypeOptions.value.find((option) => option.value === selectedEventType.value) ?? null,
)

const isBusy = computed(() => animalsLoading.value || eventsLoading.value)
const loadErrorMessage = computed(() => animalsErrorMessage.value || eventsErrorMessage.value)
const eventDialogTitle = computed(() =>
  eventFormMode.value === 'edit' ? t('events.editEvent') : t('events.addEvent'),
)

const filteredEvents = computed(() => {
  return filterEventsList(events.value, animalById, {
    searchTerm: searchTerm.value,
    eventType: selectedEventType.value,
    startDate: startDate.value,
    endDate: endDate.value,
  })
})
const selectedEvent = computed(() =>
  events.value.find((event) => event.id === selectedEventId.value) ?? null,
)
const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredEvents.value.length / pageSize.value)),
)
const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredEvents.value.slice(start, start + pageSize.value)
})
const displayedEventsCount = computed(() =>
  listMode.value === 'paged' ? paginatedEvents.value.length : filteredEvents.value.length,
)

const emptyStateMessage = computed(() => {
  if (events.value.length === 0) {
    return t('events.emptyInitial')
  }

  return t('events.emptyFiltered')
})

function openEventDialog() {
  eventFormMode.value = 'create'
  selectedEventId.value = ''
  isEventDialogOpen.value = true
}

function openEditDialog(event) {
  eventFormMode.value = 'edit'
  selectedEventId.value = event.id
  isEventDialogOpen.value = true
}

async function submitEvent(payload) {
  try {
    const isEditing = eventFormMode.value === 'edit'

    if (isEditing) {
      await eventsStore.editEvent(selectedEventId.value, payload)
    } else {
      await eventsStore.addEvent(payload)
    }

    await animalsStore.loadAnimals()
    isEventDialogOpen.value = false
    selectedEventId.value = ''
    eventFormMode.value = 'create'

    $q.notify({
      color: 'positive',
      message: isEditing ? t('events.eventUpdated') : t('events.eventAdded'),
      position: 'top',
    })
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: error instanceof Error ? error.message : t('events.eventSaveFailed'),
      position: 'top',
    })
  }
}

function openPurchaseDialog(payload = {}) {
  initialPurchaseAnimalIds.value = payload.animalIds ?? []
  eventFormMode.value = 'create'
  selectedEventId.value = ''
  isPurchaseDialogOpen.value = true
}

async function submitPurchaseEvent(payload) {
  try {
    await eventsStore.addPurchaseEvent(payload)
    await animalsStore.loadAnimals()
    isPurchaseDialogOpen.value = false
    initialPurchaseAnimalIds.value = []

    $q.notify({
      color: 'positive',
      message: t('events.eventAdded'),
      position: 'top',
    })
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: error instanceof Error ? error.message : t('events.eventSaveFailed'),
      position: 'top',
    })
  }
}

function confirmDeleteEvent(event) {
  $q.dialog({
    title: t('events.deleteTitle'),
    message: t('events.deleteMessage', { eventType: getEventTypeMeta(event.type).label.toLowerCase() }),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await eventsStore.removeEvent(event.id)
      await animalsStore.loadAnimals()
      $q.notify({
        color: 'positive',
        message: t('events.eventRemoved'),
        position: 'top',
      })
    } catch (error) {
      $q.notify({
        color: 'negative',
        message: error instanceof Error ? error.message : t('events.eventDeleteFailed'),
        position: 'top',
      })
    }
  })
}

function animalById(id) {
  return animalsStore.getAnimalById(id)
}

function eventDetailTarget(event) {
  return { path: `/events/${event.id}`, query: { from: 'events' } }
}

function openEventDetail(event) {
  void router.push(eventDetailTarget(event))
}

function openRequestedEditDialog() {
  const editEventId = String(route.query.edit ?? '')

  if (!editEventId) {
    return
  }

  const event = events.value.find((item) => item.id === editEventId)

  if (event) {
    openEditDialog(event)
  }

  const { edit, ...query } = route.query
  void edit
  void router.replace({ path: '/events', query })
}

watch([searchTerm, selectedEventType, startDate, endDate, listMode, pageSize], () => {
  currentPage.value = 1
})

watch(filteredEvents, () => {
  if (currentPage.value > pageCount.value) {
    currentPage.value = pageCount.value
  }
})

onMounted(async () => {
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

  openRequestedEditDialog()
})
</script>
