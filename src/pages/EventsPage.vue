<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
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
                :disable="animals.length === 0"
                @click="openEventDialog"
              />
            </div>
          </q-card-section>

          <q-card-section class="row q-col-gutter-sm q-pt-none">
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
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model="startDate" outlined dense type="date" :label="t('events.fromDate')" />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model="endDate" outlined dense type="date" :label="t('events.toDate')" />
            </div>
          </q-card-section>

          <q-card-section class="row items-center justify-between q-col-gutter-sm q-pt-none">
            <div class="col-12 col-md-auto">
              <q-btn-toggle
                v-model="listMode"
                unelevated
                no-caps
                color="green-1"
                text-color="primary"
                toggle-color="primary"
                toggle-text-color="white"
                :options="listModeOptions"
              />
            </div>

            <div class="col-12 col-md-auto">
              <div class="row items-center q-col-gutter-sm">
                <div v-if="listMode === 'paged'" class="col-auto">
                  <q-select
                    v-model="pageSize"
                    dense
                    outlined
                    emit-value
                    map-options
                    :label="t('common.perPage')"
                    :options="pageSizeOptions"
                  />
                </div>
                <div class="col-auto text-caption text-grey-7">
                  {{ t('events.showingCount', { shown: displayedEventsCount, total: filteredEvents.length }) }}
                </div>
              </div>
            </div>
          </q-card-section>

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

          <q-list v-else-if="listMode === 'paged'" separator>
            <q-item v-for="event in paginatedEvents" :key="event.id">
              <q-item-section avatar>
                <q-avatar
                  :color="getEventTypeMeta(event.type).color"
                  text-color="white"
                  :icon="getEventTypeMeta(event.type).icon"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium">
                  {{ t('common.eventForAnimal', { eventType: getEventTypeMeta(event.type).label, animal: animalDisplayName(animalById(event.animalId)) }) }}
                </q-item-label>
                <q-item-label caption>
                  {{ formatDisplayDate(event.date) }}
                  <span v-if="animalById(event.animalId)?.species">
                    • {{ animalById(event.animalId)?.species }}
                  </span>
                </q-item-label>
                <q-item-label v-if="event.notes" caption class="text-grey-7">
                  {{ event.notes }}
                </q-item-label>
              </q-item-section>

              <q-item-section side top>
                <div class="column items-end q-gutter-xs">
                  <div class="row q-gutter-xs">
                    <q-btn
                      flat
                      round
                      dense
                      color="primary"
                      icon="visibility"
                      :aria-label="t('events.viewAnimal')"
                      :title="t('events.viewAnimal')"
                      :to="{ path: `/app/animals/${event.animalId}`, query: { from: 'events' } }"
                    />
                    <q-btn
                      flat
                      round
                      dense
                      color="primary"
                      icon="edit"
                      :aria-label="t('events.editEvent')"
                      :title="t('events.editEvent')"
                      @click="openEditDialog(event)"
                    />
                    <q-btn
                      flat
                      round
                      dense
                      color="negative"
                      icon="delete"
                      :aria-label="t('events.deleteEvent')"
                      :title="t('events.deleteEvent')"
                      @click="confirmDeleteEvent(event)"
                    />
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <q-virtual-scroll
            v-else
            :items="filteredEvents"
            :virtual-scroll-item-size="88"
            style="max-height: 70vh"
          >
            <template #default="{ item: event, index }">
              <div :key="event.id">
                <q-item>
                  <q-item-section avatar>
                    <q-avatar
                      :color="getEventTypeMeta(event.type).color"
                      text-color="white"
                      :icon="getEventTypeMeta(event.type).icon"
                    />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-medium">
                      {{ t('common.eventForAnimal', { eventType: getEventTypeMeta(event.type).label, animal: animalDisplayName(animalById(event.animalId)) }) }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ formatDisplayDate(event.date) }}
                      <span v-if="animalById(event.animalId)?.species">
                        • {{ animalById(event.animalId)?.species }}
                      </span>
                    </q-item-label>
                    <q-item-label v-if="event.notes" caption class="text-grey-7">
                      {{ event.notes }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side top>
                    <div class="column items-end q-gutter-xs">
                      <div class="row q-gutter-xs">
                        <q-btn
                          flat
                          round
                          dense
                          color="primary"
                          icon="visibility"
                          :aria-label="t('events.viewAnimal')"
                          :title="t('events.viewAnimal')"
                          :to="{ path: `/app/animals/${event.animalId}`, query: { from: 'events' } }"
                        />
                        <q-btn
                          flat
                          round
                          dense
                          color="primary"
                          icon="edit"
                          :aria-label="t('events.editEvent')"
                          :title="t('events.editEvent')"
                          @click="openEditDialog(event)"
                        />
                        <q-btn
                          flat
                          round
                          dense
                          color="negative"
                          icon="delete"
                          :aria-label="t('events.deleteEvent')"
                          :title="t('events.deleteEvent')"
                          @click="confirmDeleteEvent(event)"
                        />
                      </div>
                    </div>
                  </q-item-section>
                </q-item>
                <q-separator v-if="index < filteredEvents.length - 1" />
              </div>
            </template>
          </q-virtual-scroll>

          <q-card-section v-if="listMode === 'paged' && pageCount > 1" class="row justify-center q-pt-md">
            <q-pagination
              v-model="currentPage"
              color="primary"
              :max="pageCount"
              :max-pages="6"
              boundary-links
              direction-links
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="isEventDialogOpen">
        <q-card style="width: 100%; max-width: 640px">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-overline text-weight-bold text-primary">{{ t('events.dialogOverline') }}</div>
              <div class="text-h6 text-weight-bold">{{ eventDialogTitle }}</div>
            </div>
            <q-btn
              flat
              round
              dense
              icon="close"
              :aria-label="t('common.closeDialog')"
              :title="t('common.closeDialog')"
              @click="closeEventDialog"
            />
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-form class="column q-gutter-md" @submit.prevent="submitEvent">
            <AnimalPickerField
              v-model="eventForm.animalId"
              :animals="animals"
              :label="t('events.pickAnimal')"
              :dialog-title="t('events.pickAnimal')"
              :empty-label="t('common.noAnimalSelected')"
            />
            <q-select
              v-model="eventForm.type"
              outlined
              :label="t('events.eventType')"
              :options="eventTypeOptions"
              emit-value
              map-options
            />
            <q-input v-model="eventForm.date" outlined type="date" :label="t('events.eventDate')" />
            <q-input v-model="eventForm.notes" outlined autogrow type="textarea" :label="t('events.notes')" />

            <div class="row justify-end q-gutter-sm">
              <q-btn flat color="grey-7" :label="t('common.cancel')" @click="closeEventDialog" />
              <q-btn unelevated color="primary" :label="eventSubmitLabel" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import AnimalPickerField from 'src/components/AnimalPickerField.vue'
import { getEventTypeMeta, getEventTypeOptions } from 'src/constants/events'
import { useI18nText } from 'src/i18n'
import { useAnimalsStore } from 'src/stores/animals-store'
import { useEventsStore } from 'src/stores/events-store'
import { formatAnimalDisplayName } from 'src/utils/animal-display'
import { formatDisplayDate, todayDateString } from 'src/utils/dates'
import { filterEventsList } from 'src/utils/list-filters'

const $q = useQuasar()
const { t } = useI18nText()
const animalsStore = useAnimalsStore()
const eventsStore = useEventsStore()

const { animals, errorMessage: animalsErrorMessage, isLoading: animalsLoading } = storeToRefs(animalsStore)
const { errorMessage: eventsErrorMessage, events, isLoading: eventsLoading } = storeToRefs(eventsStore)

const isEventDialogOpen = ref(false)
const eventFormMode = ref('create')
const selectedEventId = ref('')
const listMode = ref('paged')
const currentPage = ref(1)
const pageSize = ref(10)
const searchTerm = ref('')
const selectedEventType = ref('')
const startDate = ref('')
const endDate = ref('')
const eventForm = reactive(defaultEventForm())
const eventTypeOptions = computed(() => getEventTypeOptions())
const pageSizeOptions = [
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
]
const listModeOptions = computed(() => [
  { label: t('common.pages'), value: 'paged' },
  { label: t('common.viewAll'), value: 'all' },
])

const isBusy = computed(() => animalsLoading.value || eventsLoading.value)
const loadErrorMessage = computed(() => animalsErrorMessage.value || eventsErrorMessage.value)
const eventDialogTitle = computed(() =>
  eventFormMode.value === 'edit' ? t('events.editEvent') : t('events.addEvent'),
)
const eventSubmitLabel = computed(() =>
  eventFormMode.value === 'edit' ? t('common.saveChanges') : t('common.saveEvent'),
)

const filteredEvents = computed(() => {
  return filterEventsList(events.value, animalById, {
    searchTerm: searchTerm.value,
    eventType: selectedEventType.value,
    startDate: startDate.value,
    endDate: endDate.value,
  })
})
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

function defaultEventForm() {
  return {
    animalId: '',
    type: 'breeding',
    date: todayDateString(),
    notes: '',
  }
}

function resetEventForm() {
  Object.assign(eventForm, {
    ...defaultEventForm(),
    animalId: animals.value[0]?.id ?? '',
  })
}

function openEventDialog() {
  if (animals.value.length === 0) {
    $q.notify({
      color: 'negative',
      message: t('events.addAnimalBeforeCreating'),
      position: 'top',
    })
    return
  }

  eventFormMode.value = 'create'
  selectedEventId.value = ''
  resetEventForm()
  isEventDialogOpen.value = true
}

function openEditDialog(event) {
  eventFormMode.value = 'edit'
  selectedEventId.value = event.id
  Object.assign(eventForm, {
    animalId: event.animalId,
    type: event.type,
    date: event.date,
    notes: event.notes ?? '',
  })
  isEventDialogOpen.value = true
}

function closeEventDialog() {
  isEventDialogOpen.value = false
  eventFormMode.value = 'create'
  selectedEventId.value = ''
  resetEventForm()
}

async function submitEvent() {
  if (!eventForm.animalId) {
    $q.notify({
      color: 'negative',
      message: t('events.selectAnimalBeforeSaving'),
      position: 'top',
    })
    return
  }

  try {
    const isEditing = eventFormMode.value === 'edit'

    if (eventFormMode.value === 'edit') {
      await eventsStore.editEvent(selectedEventId.value, eventForm)
    } else {
      await eventsStore.addEvent(eventForm)
    }

    await animalsStore.loadAnimals()
    closeEventDialog()

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

function animalDisplayName(animal) {
  return formatAnimalDisplayName(animal)
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

  resetEventForm()
})
</script>
