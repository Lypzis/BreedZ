<template>
  <AppPageShell>
    <div class="q-mb-md">
      <q-btn flat color="primary" icon="arrow_back" :label="backLinkLabel" @click="navigateBack" />
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
            <div v-if="eventStateChip" class="col-auto">
              <q-chip
                square
                :color="eventStateChip.color"
                :text-color="eventStateChip.textColor"
                :icon="eventStateChip.icon"
              >
                {{ eventStateChip.label }}
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
            <q-btn
              v-if="canRecordWeaning"
              unelevated
              color="primary"
              icon="child_care"
              :label="t('events.recordWeaning')"
              @click="openWeaningDialog"
            />
            <q-btn
              v-if="canRecordExpectedBirthOutcome"
              unelevated
              color="primary"
              icon="child_friendly"
              :label="t('events.recordBirthOutcome')"
              @click="openExpectedBirthOutcomeDialog('birth')"
            />
            <q-btn
              v-if="canRecordExpectedBirthOutcome"
              outline
              color="warning"
              icon="heart_broken"
              :label="t('events.recordFailedOutcome')"
              @click="openExpectedBirthOutcomeDialog('breeding_failed')"
            />
            <q-btn
              v-if="canRecordExpectedBirthOutcome"
              outline
              color="negative"
              icon="warning"
              :label="t('events.recordPregnancyLossOutcome')"
              @click="openExpectedBirthOutcomeDialog('abortion')"
            />
            <q-btn
              v-if="canRecordPregnancyCheck"
              unelevated
              color="primary"
              icon="fact_check"
              :label="t('events.recordPregnancyCheck')"
              @click="openPregnancyCheckDialog"
            />
            <q-btn
              v-if="canConfirmEvent"
              unelevated
              color="primary"
              icon="task_alt"
              :label="t('events.confirmEvent')"
              @click="confirmPendingEvent"
            />
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

        <q-card-section v-if="pregnancyCheckDetailRows.length > 0">
          <q-banner rounded class="bg-green-1 text-primary">
            <template #avatar>
              <q-icon name="fact_check" color="primary" />
            </template>
            <div class="column q-gutter-xs">
              <div v-for="row in pregnancyCheckDetailRows" :key="row.label" class="text-body2">
                <span class="text-weight-medium">{{ row.label }}:</span>
                {{ row.value }}
              </div>
            </div>
          </q-banner>
        </q-card-section>

        <q-card-section v-if="expectedBirthResolutionRows.length > 0">
          <q-banner rounded class="bg-green-1 text-primary">
            <template #avatar>
              <q-icon name="task_alt" color="primary" />
            </template>
            <div class="column q-gutter-xs">
              <div v-for="row in expectedBirthResolutionRows" :key="row.label" class="text-body2">
                <span class="text-weight-medium">{{ row.label }}:</span>
                {{ row.value }}
              </div>
            </div>
          </q-banner>
        </q-card-section>

        <q-card-section v-if="linkedLifecycleRows.length > 0">
          <div class="text-overline text-weight-bold text-primary">{{ t('events.linkedRecordsOverline') }}</div>
          <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">{{ t('events.linkedRecordsTitle') }}</div>

          <q-list bordered separator>
            <q-item
              v-for="row in linkedLifecycleRows"
              :key="row.event.id"
              clickable
              v-ripple
              @click="openLinkedLifecycleRecord(row.event)"
            >
              <q-item-section avatar>
                <q-avatar :color="row.meta.color" text-color="white" :icon="row.meta.icon" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium">{{ row.title }}</q-item-label>
                <q-item-label caption>{{ row.caption }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="visibility"
                  :aria-label="t('events.openLinkedRecord')"
                  :title="t('events.openLinkedRecord')"
                  @click.stop="openLinkedLifecycleRecord(row.event)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

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

    <EventFormDialog v-model="isEventDialogOpen" :animals="animals" :events="events" :event="event" mode="edit"
      :title="t('events.editEvent')" @submit="submitEvent" />
    <EventFormDialog
      v-model="isPregnancyCheckDialogOpen"
      :animals="animals"
      :events="events"
      initial-type="pregnancy_check"
      :initial-details="pregnancyCheckInitialDetails"
      :default-animal-id="pregnancyCheckAnimalId"
      :overline="t('events.detailOverline')"
      :title="t('events.recordPregnancyCheck')"
      @submit="submitPregnancyCheck"
    />
    <EventFormDialog
      v-model="isExpectedBirthOutcomeDialogOpen"
      :animals="animals"
      :events="events"
      :initial-type="expectedBirthOutcomeType"
      :initial-details="expectedBirthOutcomeInitialDetails"
      :default-animal-id="expectedBirthOutcomeAnimalId"
      :overline="t('events.detailOverline')"
      :title="expectedBirthOutcomeTitle"
      @submit="submitExpectedBirthOutcome"
    />
    <BirthOutcomeDialog
      v-model="isBirthOutcomeDialogOpen"
      :animals="animals"
      :current-animal-count="animals.length"
      :dam-animal="expectedBirthDamAnimal"
      :sire-animal="expectedBirthSireAnimal"
      show-initial-newborn
      :is-premium="isPremium"
      @submit="submitBirthOutcome"
    />
    <EventFormDialog
      v-model="isWeaningDialogOpen"
      :animals="animals"
      :events="events"
      initial-type="weaning"
      :initial-details="weaningInitialDetails"
      :default-animal-id="weaningAnimalId"
      :overline="t('events.detailOverline')"
      :title="t('events.recordWeaning')"
      @submit="submitWeaning"
    />
  </AppPageShell>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import AppPageShell from 'src/components/AppPageShell.vue'
import AnimalListItem from 'src/components/AnimalListItem.vue'
import BirthOutcomeDialog from 'src/components/BirthOutcomeDialog.vue'
import DetailHeader from 'src/components/DetailHeader.vue'
import EventFormDialog from 'src/components/EventFormDialog.vue'
import PagedListControls from 'src/components/PagedListControls.vue'
import { useHistoryAwareBack } from 'src/composables/useHistoryBack'
import { getEventTypeMeta } from 'src/constants/events'
import { useI18nText } from 'src/i18n'
import { useAnimalsStore } from 'src/stores/animals-store'
import { useAuthStore } from 'src/stores/auth-store'
import { useEventsStore } from 'src/stores/events-store'
import { formatAnimalDisplayName } from 'src/utils/animal-display'
import {
  formatEventAmount,
  getEventAnimals,
} from 'src/utils/event-display'
import { getEventAmountLabelKey } from 'src/utils/event-participants'
import { formatDisplayDate, todayDateString } from 'src/utils/dates'
import { isEventNeedingConfirmation, isExpectedBirthResolved, isFutureScheduledEvent } from 'src/utils/event-records'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { t } = useI18nText()
const animalsStore = useAnimalsStore()
const authStore = useAuthStore()
const eventsStore = useEventsStore()

const { animals, errorMessage: animalsErrorMessage, isLoading: animalsLoading } = storeToRefs(animalsStore)
const { isPremium } = storeToRefs(authStore)
const { errorMessage: eventsErrorMessage, events, isLoading: eventsLoading } = storeToRefs(eventsStore)

const isEventDialogOpen = ref(false)
const isPregnancyCheckDialogOpen = ref(false)
const isExpectedBirthOutcomeDialogOpen = ref(false)
const isBirthOutcomeDialogOpen = ref(false)
const isWeaningDialogOpen = ref(false)
const expectedBirthOutcomeType = ref('birth')
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
const canConfirmEvent = computed(() => event.value && isEventNeedingConfirmation(event.value, todayDateString()))
const pregnancyCheckAnimalId = computed(() => resolvePregnancyCheckAnimalId(event.value))
const expectedBirthOutcomeAnimalId = computed(() =>
  event.value?.type === 'expected_birth' ? (event.value.animalIds[0] ?? event.value.animalId ?? '') : '',
)
const weaningAnimalId = computed(() =>
  event.value?.type === 'birth' ? (event.value.animalIds[0] ?? event.value.animalId ?? '') : '',
)
const canRecordPregnancyCheck = computed(() =>
  event.value?.type === 'breeding' && Boolean(pregnancyCheckAnimalId.value),
)
const canRecordExpectedBirthOutcome = computed(() =>
  event.value?.type === 'expected_birth'
    && !isExpectedBirthResolved(event.value)
    && Boolean(expectedBirthOutcomeAnimalId.value),
)
const canRecordWeaning = computed(() =>
  event.value?.type === 'birth'
    && Boolean(weaningAnimalId.value)
    && !linkedWeaningEvent.value,
)
const pregnancyCheckInitialDetails = computed(() => ({
  linkedBreedingEventId: event.value?.type === 'breeding' ? event.value.id : '',
  linkedExpectedBirthEventId: event.value?.type === 'breeding' ? (event.value.linkedEventId ?? '') : '',
}))
const expectedBirthOutcomeInitialDetails = computed(() => ({
  linkedExpectedBirthEventId: event.value?.type === 'expected_birth' ? event.value.id : '',
  linkedBreedingEventId: event.value?.type === 'expected_birth' ? (event.value.linkedEventId ?? '') : '',
}))
const weaningInitialDetails = computed(() => ({
  linkedBirthEventId: event.value?.type === 'birth' ? event.value.id : '',
}))
const expectedBirthOutcomeTitle = computed(() => {
  const titleKeys = {
    birth: 'events.recordBirthOutcome',
    breeding_failed: 'events.recordFailedOutcome',
    abortion: 'events.recordPregnancyLossOutcome',
  }

  return t(titleKeys[expectedBirthOutcomeType.value] ?? 'events.addEvent')
})
const eventStateChip = computed(() => {
  if (!event.value) {
    return null
  }

  if (isExpectedBirthResolved(event.value)) {
    return {
      color: 'green-1',
      textColor: 'primary',
      icon: 'task_alt',
      label: t('events.resolvedState'),
    }
  }

  if (isEventNeedingConfirmation(event.value, todayDateString())) {
    return {
      color: 'orange-1',
      textColor: 'warning',
      icon: 'pending_actions',
      label: t('events.needsConfirmationState'),
    }
  }

  if (isFutureScheduledEvent(event.value, todayDateString())) {
    return {
      color: 'blue-1',
      textColor: 'primary',
      icon: 'schedule',
      label: t('events.scheduledState'),
    }
  }

  return null
})
const linkedPregnancyCheckBreedingEvent = computed(() => {
  const linkedBreedingEventId = event.value?.details?.linkedBreedingEventId ?? ''

  if (!linkedBreedingEventId) {
    return null
  }

  return events.value.find((item) => item.id === linkedBreedingEventId && item.type === 'breeding') ?? null
})
const linkedExpectedBirthEvent = computed(() => {
  if (event.value?.type !== 'breeding') {
    return null
  }

  const linkedEventId = event.value.linkedEventId ?? ''

  if (!linkedEventId) {
    return null
  }

  return events.value.find((item) => item.id === linkedEventId && item.type === 'expected_birth') ?? null
})
const linkedExpectedBirthBreedingEvent = computed(() => {
  if (event.value?.type !== 'expected_birth') {
    return null
  }

  const linkedEventId = event.value.linkedEventId ?? ''

  if (!linkedEventId) {
    return null
  }

  return events.value.find((item) => item.id === linkedEventId && item.type === 'breeding') ?? null
})
const expectedBirthDamAnimal = computed(() =>
  expectedBirthOutcomeAnimalId.value ? animalsStore.getAnimalById(expectedBirthOutcomeAnimalId.value) : null,
)
const expectedBirthSireAnimal = computed(() => {
  const breedingEvent = linkedExpectedBirthBreedingEvent.value

  if (!breedingEvent) {
    return null
  }

  const relatedAnimals = breedingEvent.animalIds
    .map((animalId) => animalsStore.getAnimalById(animalId))
    .filter(Boolean)
  const maleAnimal = relatedAnimals.find((animal) => animal.sex === 'male')

  return maleAnimal ?? relatedAnimals.find((animal) => animal.id !== expectedBirthDamAnimal.value?.id) ?? null
})
const linkedOutcomeEvent = computed(() => {
  if (event.value?.type !== 'expected_birth') {
    return null
  }

  const linkedOutcomeEventId = event.value.details?.linkedOutcomeEventId ?? ''

  if (!linkedOutcomeEventId) {
    return null
  }

  return events.value.find((item) => item.id === linkedOutcomeEventId) ?? null
})
const linkedOutcomeExpectedBirthEvent = computed(() => {
  const linkedExpectedBirthEventId = event.value?.details?.linkedExpectedBirthEventId ?? ''

  if (!linkedExpectedBirthEventId) {
    return null
  }

  return events.value.find((item) => item.id === linkedExpectedBirthEventId && item.type === 'expected_birth') ?? null
})
const linkedOutcomeBreedingEvent = computed(() => {
  if (!['birth', 'breeding_failed', 'abortion'].includes(event.value?.type)) {
    return null
  }

  const linkedBreedingEventId = event.value?.details?.linkedBreedingEventId ?? ''

  if (!linkedBreedingEventId) {
    return null
  }

  return events.value.find((item) => item.id === linkedBreedingEventId && item.type === 'breeding') ?? null
})
const linkedWeaningEvent = computed(() => {
  if (event.value?.type !== 'birth') {
    return null
  }

  return events.value.find((item) =>
    item.type === 'weaning'
    && item.details?.linkedBirthEventId === event.value.id,
  ) ?? null
})
const linkedWeaningBirthEvent = computed(() => {
  if (event.value?.type !== 'weaning') {
    return null
  }

  const linkedBirthEventId = event.value.details?.linkedBirthEventId ?? ''

  if (!linkedBirthEventId) {
    return null
  }

  return events.value.find((item) => item.id === linkedBirthEventId && item.type === 'birth') ?? null
})
const linkedLifecycleRows = computed(() => {
  const rows = []

  if (linkedExpectedBirthEvent.value) {
    rows.push(buildLinkedLifecycleRow({
      event: linkedExpectedBirthEvent.value,
      title: t('events.linkedExpectedBirth'),
    }))
  }

  if (linkedExpectedBirthBreedingEvent.value) {
    rows.push(buildLinkedLifecycleRow({
      event: linkedExpectedBirthBreedingEvent.value,
      title: t('events.linkedBreedingRecord'),
    }))
  }

  if (linkedOutcomeEvent.value) {
    rows.push(buildLinkedLifecycleRow({
      event: linkedOutcomeEvent.value,
      title: t('events.linkedOutcomeRecord'),
    }))
  }

  if (linkedOutcomeExpectedBirthEvent.value) {
    rows.push(buildLinkedLifecycleRow({
      event: linkedOutcomeExpectedBirthEvent.value,
      title: t('events.linkedExpectedBirth'),
    }))
  }

  if (linkedOutcomeBreedingEvent.value) {
    rows.push(buildLinkedLifecycleRow({
      event: linkedOutcomeBreedingEvent.value,
      title: t('events.linkedBreedingRecord'),
    }))
  }

  if (linkedWeaningEvent.value) {
    rows.push(buildLinkedLifecycleRow({
      event: linkedWeaningEvent.value,
      title: t('events.linkedWeaningRecord'),
    }))
  }

  if (linkedWeaningBirthEvent.value) {
    rows.push(buildLinkedLifecycleRow({
      event: linkedWeaningBirthEvent.value,
      title: t('events.linkedBirthRecord'),
    }))
  }

  return rows
})
const expectedBirthResolutionRows = computed(() => {
  if (!isExpectedBirthResolved(event.value)) {
    return []
  }

  const outcomeType = linkedOutcomeEvent.value?.type ?? event.value?.details?.outcomeType ?? ''
  const outcomeLabel = outcomeType ? getEventTypeMeta(outcomeType).label : ''
  const rows = [
    {
      label: t('events.expectedBirthResolutionStatus'),
      value: t('events.expectedBirthResolved'),
    },
  ]

  if (outcomeLabel) {
    rows.push({
      label: t('events.expectedBirthOutcome'),
      value: outcomeLabel,
    })
  }

  if (event.value?.details?.resolvedAt) {
    rows.push({
      label: t('events.expectedBirthResolvedAt'),
      value: formatDate(event.value.details.resolvedAt),
    })
  }

  return rows
})
const pregnancyCheckDetailRows = computed(() => {
  if (event.value?.type !== 'pregnancy_check') {
    return []
  }

  const rows = []
  const resultLabel = pregnancyCheckResultLabel(event.value.details?.result)
  const methodLabel = pregnancyCheckMethodLabel(event.value.details?.method)

  if (resultLabel) {
    rows.push({
      label: t('events.pregnancyCheckResult'),
      value: resultLabel,
    })
  }

  if (methodLabel) {
    rows.push({
      label: t('events.pregnancyCheckMethod'),
      value: methodLabel,
    })
  }

  if (linkedPregnancyCheckBreedingEvent.value) {
    rows.push({
      label: t('events.linkedBreedingEvent'),
      value: formatDate(linkedPregnancyCheckBreedingEvent.value.date),
    })
  }

  return rows
})
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

const fallbackBackLinkLabel = computed(() => {
  const from = String(route.query.from ?? '')

  if (from === 'dashboard') {
    return t('events.backToDashboard')
  }

  if (from === 'animal') {
    return t('events.backToAnimal')
  }

  return t('events.backToEvents')
})
const { backLabel: historyBackLabel, navigateBack } = useHistoryAwareBack({
  route,
  router,
  fallbackTarget: backLinkTarget,
  fallbackLabel: fallbackBackLinkLabel,
  genericLabel: computed(() => t('common.back')),
})
const backLinkLabel = historyBackLabel

function animalById(id) {
  return animalsStore.getAnimalById(id)
}

function animalDisplayName(animal) {
  return formatAnimalDisplayName(animal)
}

function buildLinkedLifecycleRow({ event: linkedEvent, title }) {
  const meta = getEventTypeMeta(linkedEvent.type)

  return {
    event: linkedEvent,
    meta,
    title,
    caption: t('events.linkedRecordDate', { date: formatDate(linkedEvent.date) }),
  }
}

function openAnimalDetail(animal) {
  void router.push({ path: `/animals/${animal.id}`, query: { from: 'events' } })
}

function openLinkedLifecycleRecord(linkedEvent) {
  void router.push(`/events/${linkedEvent.id}`)
}

function openEditDialog() {
  if (!event.value) {
    return
  }

  isEventDialogOpen.value = true
}

function openPregnancyCheckDialog() {
  if (!canRecordPregnancyCheck.value) {
    return
  }

  isPregnancyCheckDialogOpen.value = true
}

function openExpectedBirthOutcomeDialog(type) {
  if (!canRecordExpectedBirthOutcome.value) {
    return
  }

  if (type === 'birth') {
    isBirthOutcomeDialogOpen.value = true
    return
  }

  expectedBirthOutcomeType.value = type
  isExpectedBirthOutcomeDialogOpen.value = true
}

function openWeaningDialog() {
  if (!canRecordWeaning.value) {
    return
  }

  isWeaningDialogOpen.value = true
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

async function submitWeaning(payload) {
  if (!event.value) {
    return
  }

  try {
    await eventsStore.addEvent(payload)
    await animalsStore.loadAnimals()
    isWeaningDialogOpen.value = false
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

async function submitExpectedBirthOutcome(payload) {
  if (!event.value) {
    return
  }

  try {
    await eventsStore.addExpectedBirthOutcome(event.value.id, payload)
    await animalsStore.loadAnimals()
    isExpectedBirthOutcomeDialogOpen.value = false
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

async function submitBirthOutcome(payload) {
  if (!event.value) {
    return
  }

  try {
    await eventsStore.addBirthOutcomeWithAnimals(event.value.id, payload)
    await animalsStore.loadAnimals()
    isBirthOutcomeDialogOpen.value = false
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

async function submitPregnancyCheck(payload) {
  if (!event.value) {
    return
  }

  try {
    await eventsStore.addEvent(payload)
    await animalsStore.loadAnimals()
    isPregnancyCheckDialogOpen.value = false
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

async function confirmPendingEvent() {
  if (!event.value) {
    return
  }

  try {
    await eventsStore.confirmEventById(event.value.id)
    await animalsStore.loadAnimals()
    $q.notify({
      color: 'positive',
      message: t('events.eventConfirmed'),
      position: 'top',
    })
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: error instanceof Error ? error.message : t('events.eventConfirmFailed'),
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

function resolvePregnancyCheckAnimalId(breedingEvent) {
  if (breedingEvent?.type !== 'breeding') {
    return ''
  }

  const relatedAnimals = breedingEvent.animalIds
    .map((animalId) => animalsStore.getAnimalById(animalId))
    .filter(Boolean)
  const femaleAnimal = relatedAnimals.find((animal) => animal.sex === 'female')

  return femaleAnimal?.id ?? breedingEvent.animalIds[0] ?? ''
}

function pregnancyCheckResultLabel(value) {
  const resultLabelKeys = {
    pregnant: 'events.pregnancyCheckPregnant',
    open: 'events.pregnancyCheckOpen',
    unknown: 'events.pregnancyCheckUnknown',
  }
  const key = resultLabelKeys[value]

  return key ? t(key) : ''
}

function pregnancyCheckMethodLabel(value) {
  const methodLabelKeys = {
    palpation: 'events.pregnancyCheckMethodPalpation',
    ultrasound: 'events.pregnancyCheckMethodUltrasound',
    blood_test: 'events.pregnancyCheckMethodBloodTest',
    visual: 'events.pregnancyCheckMethodVisual',
    other: 'events.pregnancyCheckMethodOther',
  }
  const key = methodLabelKeys[value]

  return key ? t(key) : ''
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
      await navigateBack()
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
