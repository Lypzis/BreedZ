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
                  unelevated
                  color="primary"
                  icon="add"
                  :label="t('common.addEvent')"
                  @click="openQuickEventDialog"
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
                    <div class="text-caption text-grey-8">{{ t('dashboard.todayEventsCaption', { date: todayLabel }) }}</div>
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
                <q-item v-for="event in todayEventsPreview" :key="event.id" class="q-py-md">
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
                      {{ event.notes || 'No extra notes added.' }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      round
                      dense
                      color="primary"
                      icon="visibility"
                      :aria-label="t('common.view')"
                      :title="t('common.view')"
                      :to="{ path: `/animals/${event.animalId}`, query: { from: 'dashboard' } }"
                    />
                  </q-item-section>
                </q-item>
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
                <q-item v-for="event in upcomingEventsPreview" :key="event.id" class="q-py-md">
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
                    <q-item-label caption>{{ formatDisplayDate(event.date) }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      round
                      dense
                      color="primary"
                      icon="visibility"
                      :aria-label="t('common.view')"
                      :title="t('common.view')"
                      :to="{ path: `/animals/${event.animalId}`, query: { from: 'dashboard' } }"
                    />
                  </q-item-section>
                </q-item>
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
                <q-item v-for="animal in animalsWithoutEventsPreview" :key="animal.id" class="q-py-md">
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white" icon="pets" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ animalDisplayName(animal) }}</q-item-label>
                    <q-item-label caption>
                      {{ animalSpeciesBreed(animal) }} • {{ t('dashboard.needsSetupCaption') }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      round
                      dense
                      color="primary"
                      icon="visibility"
                      :aria-label="t('common.view')"
                      :title="t('common.view')"
                      :to="{ path: `/animals/${animal.id}`, query: { from: 'dashboard' } }"
                    />
                  </q-item-section>
                </q-item>
              </q-list>

              <div v-if="animalsWithoutEvents.length > dashboardSectionLimit" class="text-caption text-grey-7 q-mt-sm">
                {{ t('dashboard.showingNeedsSetup', { shown: animalsWithoutEventsPreview.length, total: animalsWithoutEvents.length }) }}
              </div>
            </q-card-section>

          </template>
        </q-card>
    <q-dialog v-model="isQuickEventDialogOpen">
      <q-card style="width: 100%; max-width: 640px">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-overline text-weight-bold text-primary">{{ t('dashboard.overline') }}</div>
            <div class="text-h6 text-weight-bold">{{ t('dashboard.quickAddTitle') }}</div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            :aria-label="t('common.closeDialog')"
            :title="t('common.closeDialog')"
            v-close-popup
          />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form class="column q-gutter-md" @submit.prevent="submitQuickEvent">
            <q-select
              v-model="quickEventForm.type"
              outlined
              :label="t('events.eventType')"
              :options="eventTypeOptions"
              emit-value
              map-options
            />
            
            <AnimalPickerField
              v-model="quickEventForm.animalId"
              :animals="activeAnimals"
              :label="t('events.pickAnimal')"
              :dialog-title="t('events.pickAnimal')"
              :empty-label="t('common.noAnimalSelected')"
            />
            
            <AnimalPickerField
              v-if="quickEventForm.type === 'breeding'"
              v-model="quickEventForm.partnerAnimalId"
              :animals="quickBreedingPartnerAnimals"
              :label="t('events.pickPartner')"
              :dialog-title="t('events.pickPartner')"
              :empty-label="t('common.noAnimalSelected')"
            />
            <q-input v-model="quickEventForm.date" outlined type="date" :label="t('events.eventDate')" />
            <q-input v-model="quickEventForm.notes" outlined autogrow type="textarea" :label="t('events.notes')" />

            <div class="row justify-end q-gutter-sm">
              <q-btn flat color="grey-7" :label="t('common.cancel')" v-close-popup />
              <q-btn unelevated color="primary" :label="t('common.saveEvent')" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="isMissingAnimalsDialogOpen">
      <q-card style="width: 100%; max-width: 420px">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6 text-weight-bold">{{ t('common.addEvent') }}</div>
          <q-btn
            flat
            round
            dense
            icon="close"
            :aria-label="t('common.closeDialog')"
            :title="t('common.closeDialog')"
            v-close-popup
          />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-body1 text-grey-8">
            {{ t('dashboard.noAnimalBeforeEvent') }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat color="grey-7" :label="t('common.cancel')" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            :label="t('common.addAnimal')"
            to="/animals"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </AppPageShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import AppPageShell from 'src/components/AppPageShell.vue'
import AnimalPickerField from 'src/components/AnimalPickerField.vue'
import { getEventTypeMeta, getEventTypeOptions } from 'src/constants/events'
import { useI18nText } from 'src/i18n'
import { useAnimalsStore } from 'src/stores/animals-store'
import { useAuthStore } from 'src/stores/auth-store'
import { useEventsStore } from 'src/stores/events-store'
import { formatAnimalDisplayName, formatAnimalSpeciesBreed } from 'src/utils/animal-display'
import {
  filterBreedingPartnerCandidates,
  validateBreedingPartnerSelection,
} from 'src/utils/breeding-partners'
import { formatDisplayDate, todayDateString } from 'src/utils/dates'

const $q = useQuasar()
const { t } = useI18nText()
const authStore = useAuthStore()
const animalsStore = useAnimalsStore()
const eventsStore = useEventsStore()

const {
  activeAnimals,
  errorMessage: animalsErrorMessage,
  isLoading: animalsLoading,
} = storeToRefs(animalsStore)
const {
  errorMessage: eventsErrorMessage,
  events,
  isLoading: eventsLoading,
} = storeToRefs(eventsStore)
const { isLoaded: isAuthLoaded, isSignedIn } = storeToRefs(authStore)

const isQuickEventDialogOpen = ref(false)
const isMissingAnimalsDialogOpen = ref(false)
const hasHydrated = ref(false)
const quickEventForm = reactive(defaultQuickEventForm())
const dashboardSectionLimit = 5
const eventTypeOptions = computed(() => getEventTypeOptions())
const quickBreedingPartnerAnimals = computed(() =>
  filterBreedingPartnerCandidates({
    animals: animalsStore.animals,
    animalId: quickEventForm.animalId,
    currentPartnerId: quickEventForm.partnerAnimalId,
  }),
)

const today = computed(() => todayDateString())
const todayLabel = computed(() => formatDisplayDate(today.value))
const isBusy = computed(() => animalsLoading.value || eventsLoading.value)
const loadErrorMessage = computed(() => animalsErrorMessage.value || eventsErrorMessage.value)
const canShowSignInButton = computed(() =>
  hasHydrated.value && isAuthLoaded.value && !isSignedIn.value,
)

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
    partnerAnimalId: '',
    date: todayDateString(),
    notes: '',
  }
}

function resetQuickEventForm() {
  Object.assign(quickEventForm, {
    ...defaultQuickEventForm(),
    animalId: activeAnimals.value[0]?.id ?? '',
  })
}

function openQuickEventDialog() {
  if (activeAnimals.value.length === 0) {
    isMissingAnimalsDialogOpen.value = true
    return
  }

  resetQuickEventForm()
  isQuickEventDialogOpen.value = true
}

async function submitQuickEvent() {
  if (!quickEventForm.animalId) {
    $q.notify({
      color: 'negative',
      message: t('dashboard.selectAnimalBeforeSaving'),
      position: 'top',
    })
    return
  }

  if (quickEventForm.type === 'breeding') {
    const breedingValidationKey = validateBreedingPartnerSelection({
      animals: animalsStore.animals,
      animalId: quickEventForm.animalId,
      partnerAnimalId: quickEventForm.partnerAnimalId,
    })

    if (breedingValidationKey) {
      $q.notify({
        color: 'negative',
        message: t(breedingValidationKey),
        position: 'top',
      })
      return
    }
  }

  try {
    await eventsStore.addEvent(quickEventForm)
    await animalsStore.loadAnimals()
    isQuickEventDialogOpen.value = false
    resetQuickEventForm()
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

function animalDisplayName(animal) {
  return formatAnimalDisplayName(animal)
}

function animalSpeciesBreed(animal) {
  return formatAnimalSpeciesBreed(animal)
}

watch(
  () => quickEventForm.type,
  (value) => {
    if (value !== 'breeding') {
      quickEventForm.partnerAnimalId = ''
    }
  },
)

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

  resetQuickEventForm()
})
</script>
