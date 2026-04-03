<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <div class="q-mb-md">
          <div class="row items-center justify-between q-col-gutter-sm">
            <div class="col-auto">
              <q-btn
                flat
                color="primary"
                icon="arrow_back"
                :label="backLinkLabel"
                :to="backLinkTarget"
              />
            </div>
          </div>
        </div>

        <q-card flat>
          <q-card-section v-if="isBusy" class="q-py-xl">
            <div class="row justify-center">
              <q-spinner color="primary" size="40px" />
            </div>
          </q-card-section>

          <q-card-section v-else-if="!animal">
            <q-banner rounded class="bg-grey-1 text-grey-8">
              <template #avatar>
                <q-icon name="pets" color="primary" />
              </template>
              This animal was not found on this device.
            </q-banner>
          </q-card-section>

          <template v-else>
            <q-card-section class="row items-start justify-between q-col-gutter-md">
              <div class="col-12 col-md">
                <div class="text-overline text-weight-bold text-primary">Animal Timeline</div>
                <div class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
                  {{ animalDisplayName(animal) }}
                </div>
                <div class="text-body1 text-grey-7">
                  Full local history for this animal, including breeding, health, and birth records.
                </div>
              </div>

              <div class="col-12 col-md-auto">
                <div class="row q-gutter-sm">
                  <q-btn outline color="primary" icon="edit" label="Edit animal" @click="openEditDialog" />
                  <q-btn unelevated color="primary" icon="add" label="Add event" @click="openEventDialog" />
                </div>
              </div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="row q-col-gutter-sm">
                <div class="col-auto">
                  <q-chip square color="green-1" text-color="primary" icon="pets">
                    {{ animal.species || 'Species not set' }}
                  </q-chip>
                </div>
                <div class="col-auto">
                  <q-chip square color="green-1" text-color="primary" icon="wc">
                    {{ sexLabel(animal.sex) }}
                  </q-chip>
                </div>
                <div class="col-auto">
                  <q-chip square :color="statusColor(animal.status)" text-color="white" icon="task_alt">
                    {{ animal.status }}
                  </q-chip>
                </div>
                <div class="col-auto">
                  <q-chip square color="green-1" text-color="primary" icon="timeline">
                    {{ animalEvents.length }} events
                  </q-chip>
                </div>
                <div class="col-auto">
                  <q-chip square color="green-1" text-color="primary" icon="group">
                    {{ offspringAnimals.length }} offspring
                  </q-chip>
                </div>
                <div class="col-auto" v-if="animal.birthDate">
                  <q-chip square color="green-1" text-color="primary" icon="cake">
                    Born {{ formatDate(animal.birthDate) }}
                  </q-chip>
                </div>
              </div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="text-overline text-weight-bold text-primary">Lineage</div>
              <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">Parent records</div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-banner rounded class="bg-grey-1 text-grey-8">
                    <template #avatar>
                      <q-icon name="female" color="primary" />
                    </template>
                    <div class="text-subtitle2 text-weight-bold">Dam / mother</div>
                    <div v-if="damAnimal" class="q-mt-xs">
                      {{ animalDisplayName(damAnimal) }}
                    </div>
                    <div v-else class="q-mt-xs">Not linked yet</div>
                    <q-btn
                      v-if="damAnimal"
                      flat
                      dense
                      color="primary"
                      label="Open parent"
                      :to="`/app/animals/${damAnimal.id}`"
                      class="q-mt-sm q-px-none"
                    />
                  </q-banner>
                </div>

                <div class="col-12 col-md-6">
                  <q-banner rounded class="bg-grey-1 text-grey-8">
                    <template #avatar>
                      <q-icon name="male" color="primary" />
                    </template>
                    <div class="text-subtitle2 text-weight-bold">Sire / father</div>
                    <div v-if="sireAnimal" class="q-mt-xs">
                      {{ animalDisplayName(sireAnimal) }}
                    </div>
                    <div v-else class="q-mt-xs">Not linked yet</div>
                    <q-btn
                      v-if="sireAnimal"
                      flat
                      dense
                      color="primary"
                      label="Open parent"
                      :to="`/app/animals/${sireAnimal.id}`"
                      class="q-mt-sm q-px-none"
                    />
                  </q-banner>
                </div>
              </div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="text-overline text-weight-bold text-primary">Offspring</div>
              <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">Linked children</div>

              <q-banner v-if="offspringAnimals.length === 0" rounded class="bg-grey-1 text-grey-8">
                <template #avatar>
                  <q-icon name="group" color="primary" />
                </template>
                No offspring linked to this animal yet.
              </q-banner>

              <q-list v-else separator>
                <q-item v-for="child in offspringAnimals" :key="child.id">
                  <q-item-section avatar>
                    <q-avatar color="secondary" text-color="white" icon="child_friendly" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ animalDisplayName(child) }}</q-item-label>
                    <q-item-label caption>
                      {{ child.species || 'Species not set' }} • {{ sexLabel(child.sex) }}
                      <span v-if="child.birthDate"> • Born {{ formatDate(child.birthDate) }}</span>
                    </q-item-label>
                    <q-item-label caption>{{ offspringRelationLabel(child) }}</q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-btn flat dense color="primary" label="Open" :to="`/app/animals/${child.id}`" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>

            <q-card-section v-if="animal.notes" class="q-pt-none">
              <q-banner rounded class="bg-grey-1 text-grey-8">
                <template #avatar>
                  <q-icon name="notes" color="primary" />
                </template>
                {{ animal.notes }}
              </q-banner>
            </q-card-section>

            <q-card-section v-if="loadErrorMessage" class="q-pt-none">
              <q-banner rounded class="bg-red-1 text-negative">
                {{ loadErrorMessage }}
              </q-banner>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="text-overline text-weight-bold text-accent">Timeline</div>
              <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">Latest events</div>
            </q-card-section>

            <q-card-section v-if="animalEvents.length === 0" class="q-pt-none">
              <q-banner rounded class="bg-grey-1 text-grey-8">
                <template #avatar>
                  <q-icon name="event_busy" color="accent" />
                </template>
                No events recorded yet. Add the first event to start the history for this animal.
              </q-banner>
            </q-card-section>

            <q-list v-else separator>
              <q-item v-for="event in animalEvents" :key="event.id">
                <q-item-section avatar>
                  <q-avatar
                    :color="getEventTypeMeta(event.type).color"
                    text-color="white"
                    :icon="getEventTypeMeta(event.type).icon"
                  />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ getEventTypeMeta(event.type).label }}</q-item-label>
                  <q-item-label caption>{{ formatDate(event.date) }}</q-item-label>
                  <q-item-label v-if="event.notes" caption class="text-grey-7">
                    {{ event.notes }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="row q-gutter-xs">
                    <q-btn
                      flat
                      round
                      dense
                      color="primary"
                      icon="edit"
                      aria-label="Edit event"
                      title="Edit event"
                      @click="openEditEventDialog(event)"
                    />
                    <q-btn
                      flat
                      round
                      dense
                      color="negative"
                      icon="delete"
                      aria-label="Delete event"
                      title="Delete event"
                      @click="confirmDeleteEvent(event)"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </template>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="isEventDialogOpen">
      <q-card style="width: 100%; max-width: 640px">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-overline text-weight-bold text-primary">Timeline</div>
            <div class="text-h6 text-weight-bold">{{ eventDialogTitle }}</div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            aria-label="Close dialog"
            title="Close dialog"
            @click="closeEventDialog"
          />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form class="column q-gutter-md" @submit.prevent="submitEvent">
            <q-select
              v-model="eventForm.type"
              outlined
              label="Event type"
              :options="EVENT_TYPE_OPTIONS"
              emit-value
              map-options
            />
            <q-input v-model="eventForm.date" outlined type="date" label="Event date" />
            <q-input v-model="eventForm.notes" outlined autogrow type="textarea" label="Notes" />

            <div class="row justify-end q-gutter-sm">
              <q-btn flat color="grey-7" label="Cancel" @click="closeEventDialog" />
              <q-btn unelevated color="primary" :label="eventSubmitLabel" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <AnimalFormDialog
      v-model="isAnimalDialogOpen"
      :animal="animal"
      :animals="animals"
      mode="edit"
      @submit="submitAnimalEdit"
    />
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import AnimalFormDialog from 'src/components/AnimalFormDialog.vue'
import { EVENT_TYPE_OPTIONS, getEventTypeMeta } from 'src/constants/events'
import { useAnimalsStore } from 'src/stores/animals-store'
import { useEventsStore } from 'src/stores/events-store'
import { formatAnimalDisplayName } from 'src/utils/animal-display'
import { formatDisplayDate, todayDateString } from 'src/utils/dates'
import { formatAnimalSex } from 'src/utils/parent-candidates'

const $q = useQuasar()
const route = useRoute()
const animalsStore = useAnimalsStore()
const eventsStore = useEventsStore()

const { animals, errorMessage: animalsErrorMessage, isLoading: animalsLoading } = storeToRefs(animalsStore)
const { errorMessage: eventsErrorMessage, isLoading: eventsLoading } = storeToRefs(eventsStore)

const isAnimalDialogOpen = ref(false)
const isEventDialogOpen = ref(false)
const eventFormMode = ref('create')
const selectedEventId = ref('')
const eventForm = reactive(defaultEventForm())

const animalId = computed(() => String(route.params.id ?? ''))
const animal = computed(() => animalsStore.getAnimalById(animalId.value))
const animalEvents = computed(() => eventsStore.eventsForAnimal(animalId.value))
const damAnimal = computed(() => animalsStore.getAnimalById(animal.value?.damId ?? ''))
const sireAnimal = computed(() => animalsStore.getAnimalById(animal.value?.sireId ?? ''))
const offspringAnimals = computed(() => animalsStore.getOffspringForAnimal(animalId.value))
const isBusy = computed(() => animalsLoading.value || eventsLoading.value)
const loadErrorMessage = computed(() => animalsErrorMessage.value || eventsErrorMessage.value)
const eventDialogTitle = computed(() =>
  eventFormMode.value === 'edit' ? 'Edit event' : 'Add event',
)
const eventSubmitLabel = computed(() =>
  eventFormMode.value === 'edit' ? 'Save changes' : 'Save event',
)
const backLinkTarget = computed(() => {
  const from = String(route.query.from ?? '')

  if (from === 'dashboard') {
    return '/app'
  }

  if (from === 'events') {
    return '/app/events'
  }

  return '/app/animals'
})
const backLinkLabel = computed(() => {
  const from = String(route.query.from ?? '')

  if (from === 'dashboard') {
    return 'Back to dashboard'
  }

  if (from === 'events') {
    return 'Back to events'
  }

  return 'Back to animals'
})

function defaultEventForm() {
  return {
    type: 'breeding',
    date: todayDateString(),
    notes: '',
  }
}

function resetEventForm() {
  Object.assign(eventForm, defaultEventForm())
}

function openEventDialog() {
  eventFormMode.value = 'create'
  selectedEventId.value = ''
  resetEventForm()
  isEventDialogOpen.value = true
}

function openEditEventDialog(event) {
  eventFormMode.value = 'edit'
  selectedEventId.value = event.id
  Object.assign(eventForm, {
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

function openEditDialog() {
  isAnimalDialogOpen.value = true
}

async function submitAnimalEdit(payload) {
  try {
    await animalsStore.editAnimal(payload.id, payload)
    isAnimalDialogOpen.value = false

    $q.notify({
      color: 'positive',
      message: 'Animal updated.',
      position: 'top',
    })
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: error instanceof Error ? error.message : 'Failed to update animal.',
      position: 'top',
    })
  }
}

async function submitEvent() {
  if (!animal.value) {
    return
  }

  try {
    const isEditing = eventFormMode.value === 'edit'

    if (isEditing) {
      await eventsStore.editEvent(selectedEventId.value, {
        animalId: animal.value.id,
        type: eventForm.type,
        date: eventForm.date,
        notes: eventForm.notes,
      })
    } else {
      await eventsStore.addEvent({
        animalId: animal.value.id,
        type: eventForm.type,
        date: eventForm.date,
        notes: eventForm.notes,
      })
    }

    await animalsStore.loadAnimals()
    closeEventDialog()
    $q.notify({
      color: 'positive',
      message: isEditing ? 'Event updated.' : 'Event added.',
      position: 'top',
    })
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: error instanceof Error ? error.message : 'Failed to save event.',
      position: 'top',
    })
  }
}

function confirmDeleteEvent(event) {
  $q.dialog({
    title: 'Delete event',
    message: `Remove ${getEventTypeMeta(event.type).label.toLowerCase()} from this timeline?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await eventsStore.removeEvent(event.id)
      await animalsStore.loadAnimals()
      $q.notify({ color: 'positive', message: 'Event removed.', position: 'top' })
    } catch (error) {
      $q.notify({
        color: 'negative',
        message: error instanceof Error ? error.message : 'Failed to delete event.',
        position: 'top',
      })
    }
  })
}

function animalDisplayName(currentAnimal) {
  return formatAnimalDisplayName(currentAnimal)
}

function sexLabel(sex) {
  return formatAnimalSex(sex)
}

function offspringRelationLabel(child) {
  if (child.damId === animalId.value && child.sireId === animalId.value) {
    return 'Linked as dam and sire'
  }

  if (child.damId === animalId.value) {
    return 'Linked as dam / mother'
  }

  if (child.sireId === animalId.value) {
    return 'Linked as sire / father'
  }

  return 'Linked offspring'
}

function formatDate(value) {
  if (!value) {
    return 'Date not set'
  }

  return formatDisplayDate(value)
}

function statusColor(status) {
  if (status === 'sold') {
    return 'accent'
  }

  if (status === 'dead') {
    return 'negative'
  }

  return 'primary'
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
})
</script>
