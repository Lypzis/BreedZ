<template>
  <AppPageShell>
    <div class="q-mb-md">
      <q-btn flat color="primary" icon="arrow_back" :label="backLinkLabel" :to="backLinkTarget" />
    </div>

    <q-card flat>
      <q-card-section v-if="isBusy" class="q-py-xl">
        <div class="row justify-center">
          <q-spinner color="primary" size="40px" />
        </div>
      </q-card-section>

      <q-card-section v-else-if="!event">
        <q-banner rounded class="bg-grey-1 text-grey-8">
          <template #avatar>
            <q-icon name="event_busy" color="primary" />
          </template>
          {{ t('events.notFound') }}
        </q-banner>
      </q-card-section>

      <template v-else>
        <DetailHeader :title="eventMeta.label" :avatar-color="eventMeta.color" :avatar-icon="eventMeta.icon">
          <template #chips>
            <div class="col-auto">
              <q-chip square color="green-1" text-color="primary" icon="event">
                {{ formatDate(event.date) }}
              </q-chip>
            </div>
            <div v-if="amountDisplay" class="col-auto">
              <q-chip square color="green-1" text-color="primary" icon="paid">
                {{ amountLabel }}: {{ amountDisplay }}
              </q-chip>
            </div>
            <div v-if="event.scope === 'herd' && affectedAnimals.length === 0" class="col-auto">
              <q-chip square color="green-1" text-color="primary" icon="groups">
                {{ t('events.wholeHerd') }}
              </q-chip>
            </div>
          </template>

          <template #actions>
            <q-btn unelevated color="primary" icon="edit" :label="t('events.editEvent')" @click="openEditDialog" />
            <q-btn outline color="negative" icon="delete" :label="t('events.deleteEvent')"
              @click="confirmDeleteEvent" />
          </template>
        </DetailHeader>

        <q-card-section v-if="loadErrorMessage" class="q-pt-none">
          <q-banner rounded class="bg-red-1 text-negative">
            {{ loadErrorMessage }}
          </q-banner>
        </q-card-section>

        <q-card-section class="q-pb-none">
          <div class="text-overline text-weight-bold text-accent">{{ t('animals.overline') }}</div>
          <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">{{ t('events.affectedAnimals') }}</div>
        </q-card-section>

        <q-card-section v-if="event.scope === 'herd' && affectedAnimals.length === 0" class="q-pt-none">
          <q-banner rounded class="bg-green-1 text-primary">
            <template #avatar>
              <q-icon name="groups" color="primary" />
            </template>
            {{ t('events.wholeHerd') }}
          </q-banner>
        </q-card-section>

        <PagedListControls v-else :current-page="affectedAnimalsPage" :list-mode="affectedAnimalsListMode"
          :list-mode-options="listModeOptions" :page-count="affectedAnimalsPageCount"
          :page-size="affectedAnimalsPageSize" :page-size-options="pageSizeOptions"
          :per-page-label="t('common.perPage')"
          :showing-text="t('events.showingCount', { shown: displayedAffectedAnimalsCount, total: affectedAnimals.length })"
          :show-pagination="false" @update:current-page="affectedAnimalsPage = $event"
          @update:list-mode="affectedAnimalsListMode = $event" @update:page-size="affectedAnimalsPageSize = $event" />

        <q-list v-if="!(event.scope === 'herd' && affectedAnimals.length === 0)" separator>
          <template v-for="{ id, animal } in displayedAffectedAnimals" :key="id">
            <AnimalListItem v-if="animal" :animal="animal"
              :detail-target="{ path: `/animals/${id}`, query: { from: 'events' } }" @open="openAnimalDetail" />
            <q-item v-else>
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" icon="pets" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium">
                  {{ animalDisplayName(animal) }}
                </q-item-label>
                <q-item-label caption>
                  {{ t('common.speciesNotSet') }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-list>

        <PagedListControls v-if="!(event.scope === 'herd' && affectedAnimals.length === 0)"
          :current-page="affectedAnimalsPage" :list-mode="affectedAnimalsListMode" :list-mode-options="listModeOptions"
          :page-count="affectedAnimalsPageCount" :page-size="affectedAnimalsPageSize"
          :page-size-options="pageSizeOptions" :per-page-label="t('common.perPage')" :show-header="false"
          :showing-text="t('events.showingCount', { shown: displayedAffectedAnimalsCount, total: affectedAnimals.length })"
          @update:current-page="affectedAnimalsPage = $event" @update:list-mode="affectedAnimalsListMode = $event"
          @update:page-size="affectedAnimalsPageSize = $event" />

        <q-card-section v-if="event.notes">
          <q-banner rounded class="bg-grey-1 text-grey-8">
            <template #avatar>
              <q-icon name="notes" color="primary" />
            </template>
            {{ event.notes }}
          </q-banner>
        </q-card-section>
      </template>
    </q-card>

    <EventFormDialog v-model="isEventDialogOpen" :animals="animals" :event="event" mode="edit"
      :title="t('events.editEvent')" @submit="submitEvent" />
  </AppPageShell>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import AppPageShell from 'src/components/AppPageShell.vue'
import AnimalListItem from 'src/components/AnimalListItem.vue'
import DetailHeader from 'src/components/DetailHeader.vue'
import EventFormDialog from 'src/components/EventFormDialog.vue'
import PagedListControls from 'src/components/PagedListControls.vue'
import { getEventTypeMeta } from 'src/constants/events'
import { useI18nText } from 'src/i18n'
import { useAnimalsStore } from 'src/stores/animals-store'
import { useEventsStore } from 'src/stores/events-store'
import { formatAnimalDisplayName } from 'src/utils/animal-display'
import {
  formatEventAmount,
  getEventAnimals,
} from 'src/utils/event-display'
import { getEventAmountLabelKey } from 'src/utils/event-participants'
import { formatDisplayDate } from 'src/utils/dates'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { t } = useI18nText()
const animalsStore = useAnimalsStore()
const eventsStore = useEventsStore()

const { animals, errorMessage: animalsErrorMessage, isLoading: animalsLoading } = storeToRefs(animalsStore)
const { errorMessage: eventsErrorMessage, events, isLoading: eventsLoading } = storeToRefs(eventsStore)

const isEventDialogOpen = ref(false)
const affectedAnimalsListMode = ref('paged')
const affectedAnimalsPage = ref(1)
const affectedAnimalsPageSize = ref(10)
const eventId = computed(() => String(route.params.id ?? ''))
const event = computed(() => events.value.find((item) => item.id === eventId.value))
const eventMeta = computed(() => getEventTypeMeta(event.value?.type))
const isBusy = computed(() => animalsLoading.value || eventsLoading.value)
const loadErrorMessage = computed(() => animalsErrorMessage.value || eventsErrorMessage.value)
const affectedAnimals = computed(() => getEventAnimals(event.value, animalById))
const amountDisplay = computed(() => formatEventAmount(event.value?.amount))
const amountLabel = computed(() => t(getEventAmountLabelKey(event.value?.type)))
const pageSizeOptions = [
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
]
const listModeOptions = computed(() => [
  { label: t('common.pages'), value: 'paged' },
  { label: t('common.viewAll'), value: 'all' },
])
const affectedAnimalsPageCount = computed(() =>
  Math.max(1, Math.ceil(affectedAnimals.value.length / affectedAnimalsPageSize.value)),
)
const displayedAffectedAnimals = computed(() => {
  if (affectedAnimalsListMode.value !== 'paged') {
    return affectedAnimals.value
  }

  const start = (affectedAnimalsPage.value - 1) * affectedAnimalsPageSize.value
  return affectedAnimals.value.slice(start, start + affectedAnimalsPageSize.value)
})
const displayedAffectedAnimalsCount = computed(() => displayedAffectedAnimals.value.length)

const backLinkTarget = computed(() => {
  const from = String(route.query.from ?? '')
  const animalId = String(route.query.animal ?? '')

  if (from === 'dashboard') {
    return '/'
  }

  if (from === 'animal' && animalId) {
    return { path: `/animals/${animalId}`, query: { from: 'events' } }
  }

  return '/events'
})

const backLinkLabel = computed(() => {
  const from = String(route.query.from ?? '')

  if (from === 'dashboard') {
    return t('events.backToDashboard')
  }

  if (from === 'animal') {
    return t('events.backToAnimal')
  }

  return t('events.backToEvents')
})

function animalById(id) {
  return animalsStore.getAnimalById(id)
}

function animalDisplayName(animal) {
  return formatAnimalDisplayName(animal)
}

function openAnimalDetail(animal) {
  void router.push({ path: `/animals/${animal.id}`, query: { from: 'events' } })
}

function openEditDialog() {
  if (!event.value) {
    return
  }

  isEventDialogOpen.value = true
}

async function submitEvent(payload) {
  if (!event.value) {
    return
  }

  try {
    await eventsStore.editEvent(event.value.id, payload)
    await animalsStore.loadAnimals()
    isEventDialogOpen.value = false
    $q.notify({
      color: 'positive',
      message: t('events.eventUpdated'),
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

function formatDate(value) {
  if (!value) {
    return t('common.dateNotSet')
  }

  return formatDisplayDate(value)
}

function confirmDeleteEvent() {
  if (!event.value) {
    return
  }

  $q.dialog({
    title: t('events.deleteTitle'),
    message: t('events.deleteMessage', { eventType: eventMeta.value.label.toLowerCase() }),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await eventsStore.removeEvent(event.value.id)
      await animalsStore.loadAnimals()
      $q.notify({
        color: 'positive',
        message: t('events.eventRemoved'),
        position: 'top',
      })
      await router.push(backLinkTarget.value)
    } catch (error) {
      $q.notify({
        color: 'negative',
        message: error instanceof Error ? error.message : t('events.eventDeleteFailed'),
        position: 'top',
      })
    }
  })
}

watch([affectedAnimals, affectedAnimalsListMode, affectedAnimalsPageSize], () => {
  affectedAnimalsPage.value = 1
})

watch(affectedAnimalsPageCount, () => {
  if (affectedAnimalsPage.value > affectedAnimalsPageCount.value) {
    affectedAnimalsPage.value = affectedAnimalsPageCount.value
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
})
</script>
