<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <q-card flat>
          <q-card-section class="row items-start justify-between q-col-gutter-md">
            <div class="col-12 col-md">
              <div class="text-overline text-weight-bold text-primary">Dashboard</div>
              <div class="text-h4 text-weight-bold q-mt-sm q-mb-sm">Today in the herd</div>
              <div class="text-body1 text-grey-7">
                Quick actions and local activity from this device.
              </div>
            </div>

            <div class="col-12 col-md-auto">
              <q-btn
                unelevated
                color="primary"
                icon="add"
                label="Add event"
                :disable="animals.length === 0"
                @click="openQuickEventDialog"
              />
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
            <q-card-section class="q-pt-none">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-4">
                  <q-banner rounded class="bg-green-1 text-primary">
                    <template #avatar>
                      <q-icon name="pets" color="primary" />
                    </template>
                    <div class="text-subtitle2 text-weight-bold">{{ activeAnimals.length }} active animals</div>
                    <div class="text-caption text-grey-8">Ready for day-to-day tracking.</div>
                  </q-banner>
                </div>

                <div class="col-12 col-sm-4">
                  <q-banner rounded class="bg-green-1 text-primary">
                    <template #avatar>
                      <q-icon name="today" color="primary" />
                    </template>
                    <div class="text-subtitle2 text-weight-bold">{{ todayEvents.length }} events today</div>
                    <div class="text-caption text-grey-8">Logged or scheduled for {{ todayLabel }}.</div>
                  </q-banner>
                </div>

                <div class="col-12 col-sm-4">
                  <q-banner rounded class="bg-green-1 text-primary">
                    <template #avatar>
                      <q-icon name="schedule" color="primary" />
                    </template>
                    <div class="text-subtitle2 text-weight-bold">{{ upcomingEvents.length }} upcoming events</div>
                    <div class="text-caption text-grey-8">Future-dated reminders already in the timeline.</div>
                  </q-banner>
                </div>
              </div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="row items-center justify-between q-col-gutter-sm">
                <div class="col">
                  <div class="text-overline text-weight-bold text-accent">Today</div>
                  <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">Actionable records</div>
                </div>
                <div v-if="todayEvents.length > dashboardSectionLimit" class="col-auto">
                  <q-btn flat dense color="primary" label="View all events" to="/app/events" />
                </div>
              </div>

              <q-banner v-if="todayEvents.length === 0" rounded class="bg-grey-1 text-grey-8">
                <template #avatar>
                  <q-icon name="event_available" color="primary" />
                </template>
                No events scheduled or logged for today yet.
              </q-banner>

              <q-list v-else separator>
                <q-item v-for="event in todayEventsPreview" :key="event.id">
                  <q-item-section avatar>
                    <q-avatar
                      :color="getEventTypeMeta(event.type).color"
                      text-color="white"
                      :icon="getEventTypeMeta(event.type).icon"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">
                      {{ getEventTypeMeta(event.type).label }} for {{ animalDisplayName(animalById(event.animalId)) }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ event.notes || 'No extra notes added.' }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      dense
                      color="primary"
                      label="View"
                      :to="{ path: `/app/animals/${event.animalId}`, query: { from: 'dashboard' } }"
                    />
                  </q-item-section>
                </q-item>
              </q-list>

              <div v-if="todayEvents.length > dashboardSectionLimit" class="text-caption text-grey-7 q-mt-sm">
                Showing {{ todayEventsPreview.length }} of {{ todayEvents.length }} events for today.
              </div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="row items-center justify-between q-col-gutter-sm">
                <div class="col">
                  <div class="text-overline text-weight-bold text-primary">Upcoming</div>
                  <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">Next scheduled events</div>
                </div>
                <div v-if="upcomingEvents.length > dashboardSectionLimit" class="col-auto">
                  <q-btn flat dense color="primary" label="View all events" to="/app/events" />
                </div>
              </div>

              <q-banner v-if="upcomingEvents.length === 0" rounded class="bg-grey-1 text-grey-8">
                <template #avatar>
                  <q-icon name="event" color="primary" />
                </template>
                No future-dated events yet. You can add them now as reminders in the local timeline.
              </q-banner>

              <q-list v-else separator>
                <q-item v-for="event in upcomingEventsPreview" :key="event.id">
                  <q-item-section avatar>
                    <q-avatar
                      :color="getEventTypeMeta(event.type).color"
                      text-color="white"
                      :icon="getEventTypeMeta(event.type).icon"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">
                      {{ getEventTypeMeta(event.type).label }} for {{ animalDisplayName(animalById(event.animalId)) }}
                    </q-item-label>
                    <q-item-label caption>{{ formatDisplayDate(event.date) }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      dense
                      color="primary"
                      label="View"
                      :to="{ path: `/app/animals/${event.animalId}`, query: { from: 'dashboard' } }"
                    />
                  </q-item-section>
                </q-item>
              </q-list>

              <div v-if="upcomingEvents.length > dashboardSectionLimit" class="text-caption text-grey-7 q-mt-sm">
                Showing {{ upcomingEventsPreview.length }} of {{ upcomingEvents.length }} upcoming events.
              </div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="row items-center justify-between q-col-gutter-sm">
                <div class="col">
                  <div class="text-overline text-weight-bold text-primary">Needs Setup</div>
                  <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">Animals without history</div>
                </div>
                <div v-if="animalsWithoutEvents.length > dashboardSectionLimit" class="col-auto">
                  <q-btn flat dense color="primary" label="View all animals" to="/app/animals" />
                </div>
              </div>

              <q-banner v-if="animalsWithoutEvents.length === 0" rounded class="bg-grey-1 text-grey-8">
                <template #avatar>
                  <q-icon name="task_alt" color="primary" />
                </template>
                Every saved animal already has at least one event in its local timeline.
              </q-banner>

              <q-list v-else separator>
                <q-item v-for="animal in animalsWithoutEventsPreview" :key="animal.id">
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white" icon="pets" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ animalDisplayName(animal) }}</q-item-label>
                    <q-item-label caption>
                      {{ animal.species || 'Species not set' }} • No events logged yet
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      dense
                      color="primary"
                      label="Open"
                      :to="{ path: `/app/animals/${animal.id}`, query: { from: 'dashboard' } }"
                    />
                  </q-item-section>
                </q-item>
              </q-list>

              <div v-if="animalsWithoutEvents.length > dashboardSectionLimit" class="text-caption text-grey-7 q-mt-sm">
                Showing {{ animalsWithoutEventsPreview.length }} of {{ animalsWithoutEvents.length }} animals needing setup.
              </div>
            </q-card-section>

          </template>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="isQuickEventDialogOpen">
      <q-card style="width: 100%; max-width: 640px">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-overline text-weight-bold text-primary">Dashboard</div>
            <div class="text-h6 text-weight-bold">Quick add event</div>
          </div>
          <q-btn flat round dense icon="close" aria-label="Close dialog" title="Close dialog" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form class="column q-gutter-md" @submit.prevent="submitQuickEvent">
            <AnimalPickerField
              v-model="quickEventForm.animalId"
              :animals="animals"
              label="Animal"
              dialog-title="Pick animal"
              empty-label="No animal selected"
            />
            <q-select
              v-model="quickEventForm.type"
              outlined
              label="Event type"
              :options="EVENT_TYPE_OPTIONS"
              emit-value
              map-options
            />
            <q-input v-model="quickEventForm.date" outlined type="date" label="Event date" />
            <q-input v-model="quickEventForm.notes" outlined autogrow type="textarea" label="Notes" />

            <div class="row justify-end q-gutter-sm">
              <q-btn flat color="grey-7" label="Cancel" v-close-popup />
              <q-btn unelevated color="primary" label="Save event" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import AnimalPickerField from 'src/components/AnimalPickerField.vue'
import { EVENT_TYPE_OPTIONS, getEventTypeMeta } from 'src/constants/events'
import { useAnimalsStore } from 'src/stores/animals-store'
import { useEventsStore } from 'src/stores/events-store'
import { formatAnimalDisplayName } from 'src/utils/animal-display'
import { formatDisplayDate, todayDateString } from 'src/utils/dates'

const $q = useQuasar()
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

const isQuickEventDialogOpen = ref(false)
const quickEventForm = reactive(defaultQuickEventForm())
const dashboardSectionLimit = 5

const today = computed(() => todayDateString())
const todayLabel = computed(() => formatDisplayDate(today.value))
const isBusy = computed(() => animalsLoading.value || eventsLoading.value)
const loadErrorMessage = computed(() => animalsErrorMessage.value || eventsErrorMessage.value)

const todayEvents = computed(() => events.value.filter((event) => event.date === today.value))
const todayEventsPreview = computed(() => todayEvents.value.slice(0, dashboardSectionLimit))
const upcomingEvents = computed(() => events.value.filter((event) => event.date > today.value))
const upcomingEventsPreview = computed(() => upcomingEvents.value.slice(0, dashboardSectionLimit))
const animalsWithoutEvents = computed(() => {
  const animalIdsWithEvents = new Set(events.value.map((event) => event.animalId))

  return activeAnimals.value.filter((animal) => !animalIdsWithEvents.has(animal.id))
})
const animalsWithoutEventsPreview = computed(() =>
  animalsWithoutEvents.value.slice(0, dashboardSectionLimit),
)

function defaultQuickEventForm() {
  return {
    animalId: '',
    type: 'breeding',
    date: todayDateString(),
    notes: '',
  }
}

function resetQuickEventForm() {
  Object.assign(quickEventForm, {
    ...defaultQuickEventForm(),
    animalId: animals.value[0]?.id ?? '',
  })
}

function openQuickEventDialog() {
  if (animals.value.length === 0) {
    $q.notify({
      color: 'negative',
      message: 'Add an animal first before logging events.',
      position: 'top',
    })
    return
  }

  resetQuickEventForm()
  isQuickEventDialogOpen.value = true
}

async function submitQuickEvent() {
  if (!quickEventForm.animalId) {
    $q.notify({
      color: 'negative',
      message: 'Select an animal before saving.',
      position: 'top',
    })
    return
  }

  try {
    await eventsStore.addEvent(quickEventForm)
    await animalsStore.loadAnimals()
    isQuickEventDialogOpen.value = false
    resetQuickEventForm()
    $q.notify({ color: 'positive', message: 'Event added.', position: 'top' })
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: error instanceof Error ? error.message : 'Failed to save event.',
      position: 'top',
    })
  }
}

function animalById(id) {
  return animalsStore.getAnimalById(id)
}

function animalDisplayName(animal) {
  return formatAnimalDisplayName(animal)
}

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

  resetQuickEventForm()
})
</script>
