<template>
  <q-dialog :model-value="modelValue" @update:model-value="updateDialogState">
    <q-card class="app-dialog-card" style="width: 100%; max-width: 640px">
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="text-overline text-weight-bold text-primary">{{ resolvedOverline }}</div>
          <div class="text-h6 text-weight-bold">{{ resolvedTitle }}</div>
        </div>
        <q-btn
          flat
          round
          dense
          icon="close"
          :aria-label="t('common.closeDialog')"
          :title="t('common.closeDialog')"
          @click="closeDialog"
        />
      </q-card-section>

      <q-card-section class="app-dialog-card__body q-pt-none">
        <q-form id="event-form-dialog" class="column q-gutter-md" @submit.prevent="submitForm">
          <q-select
            v-model="eventForm.type"
            outlined
            :label="t('events.eventType')"
            :options="groupedEventTypeOptions"
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
              <q-separator v-if="scope.opt.separator" spaced />
              <q-item-label
                v-else-if="scope.opt.groupHeader"
                header
                class="text-overline text-weight-bold text-primary"
              >
                {{ scope.opt.label }}
              </q-item-label>
              <q-item v-else v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon :name="scope.opt.icon" :color="scope.opt.color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <AnimalPickerField
            v-if="!hasFixedAnimal && (eventSelectionMode === 'single' || eventSelectionMode === 'breeding')"
            v-model="eventForm.animalId"
            :animals="singleEventPickerAnimals"
            :label="t('events.pickAnimal')"
            :dialog-title="t('events.pickAnimal')"
            :empty-label="t('common.noAnimalSelected')"
          />
          <AnimalMultiPickerField
            v-if="eventSelectionMode === 'multi' || eventSelectionMode === 'optionalMulti'"
            v-model="eventForm.animalIds"
            :animals="multiEventPickerAnimals"
            :label="multiAnimalPickerLabel"
            :dialog-title="multiAnimalPickerLabel"
            :empty-label="t('common.noAnimalsSelected')"
          />
          <AnimalPickerField
            v-if="eventForm.type === 'breeding'"
            v-model="eventForm.partnerAnimalId"
            :animals="breedingPartnerAnimals"
            :label="t('events.pickPartner')"
            :dialog-title="t('events.pickPartner')"
            :empty-label="t('common.noAnimalSelected')"
          />
          <q-select
            v-if="eventForm.type === 'pregnancy_check'"
            v-model="eventForm.pregnancyCheckResult"
            outlined
            :label="t('events.pregnancyCheckResult')"
            :options="pregnancyCheckResultOptions"
            emit-value
            map-options
          />
          <q-select
            v-if="eventForm.type === 'pregnancy_check'"
            v-model="eventForm.pregnancyCheckMethod"
            outlined
            clearable
            :label="t('events.pregnancyCheckMethod')"
            :options="pregnancyCheckMethodOptions"
            emit-value
            map-options
          />
          <q-select
            v-if="eventForm.type === 'pregnancy_check'"
            v-model="eventForm.linkedBreedingEventId"
            outlined
            clearable
            :label="t('events.linkedBreedingEvent')"
            :options="linkedBreedingEventOptions"
            emit-value
            map-options
          />
          <q-toggle
            v-if="showExpectedBirthPlanner"
            v-model="eventForm.expectedBirthEnabled"
            color="primary"
            :label="t('events.addExpectedBirth')"
          />
          <q-input
            v-if="showExpectedBirthPlanner && eventForm.expectedBirthEnabled"
            :model-value="eventForm.expectedBirthDate"
            outlined
            type="date"
            :label="t('events.expectedBirthDate')"
            :min="todayDateString()"
            :hint="expectedBirthDateHint"
            :persistent-hint="Boolean(expectedBirthDateHint)"
            @update:model-value="updateExpectedBirthDate"
          />
          <q-input
            v-model="eventForm.date"
            outlined
            type="date"
            :label="t('events.eventDate')"
            :min="eventDateMin || undefined"
          />
          <q-input
            :model-value="eventForm.amount"
            outlined
            inputmode="decimal"
            :label="eventAmountLabel"
            @update:model-value="updateAmountValue"
          />
          <q-input v-model="eventForm.notes" outlined autogrow type="textarea" :label="t('events.notes')" />

        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="app-dialog-card__actions">
        <q-btn flat color="grey-7" :label="t('common.cancel')" @click="closeDialog" />
        <q-btn unelevated color="primary" :label="submitLabel" type="submit" form="event-form-dialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import AnimalMultiPickerField from 'src/components/AnimalMultiPickerField.vue'
import AnimalPickerField from 'src/components/AnimalPickerField.vue'
import { getEventTypeOptions, getGroupedEventTypeOptions } from 'src/constants/events'
import { useI18nText } from 'src/i18n'
import { formatAnimalDisplayName } from 'src/utils/animal-display'
import {
  filterBreedingPartnerCandidates,
  validateBreedingPartnerSelection,
} from 'src/utils/breeding-partners'
import {
  buildEventAnimalIds,
  getEventAmountLabelKey,
  getEventSelectionMode,
} from 'src/utils/event-participants'
import {
  buildExpectedBirthDate,
  shouldApplyExpectedBirthSuggestion,
} from 'src/utils/gestation'
import { formatDisplayDate, todayDateString } from 'src/utils/dates'
import { normalizeEventRecord, sanitizeNonNegativeAmountInput } from 'src/utils/event-records'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  animals: {
    type: Array,
    default: () => [],
  },
  events: {
    type: Array,
    default: () => [],
  },
  event: {
    type: Object,
    default: null,
  },
  mode: {
    type: String,
    default: 'create',
  },
  fixedAnimalId: {
    type: String,
    default: '',
  },
  defaultAnimalId: {
    type: String,
    default: '',
  },
  initialType: {
    type: String,
    default: '',
  },
  initialDetails: {
    type: Object,
    default: () => ({}),
  },
  overline: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['birthSelected', 'purchaseSelected', 'submit', 'update:modelValue'])

const $q = useQuasar()
const { t } = useI18nText()
const eventForm = reactive(defaultEventForm())
const isSyncingEventForm = ref(false)
const isExpectedBirthDateManuallyEdited = ref(false)
const lastSuggestedExpectedBirthDate = ref('')

const eventTypeOptions = computed(() => getEventTypeOptions())
const groupedEventTypeOptions = computed(() => getGroupedEventTypeOptions())
const selectedEventTypeOption = computed(() =>
  eventTypeOptions.value.find((option) => option.value === eventForm.type) ?? null,
)
const hasFixedAnimal = computed(() => Boolean(props.fixedAnimalId))
const activeAnimalsForEvents = computed(() =>
  props.animals.filter((animal) => animal.status === 'active'),
)
const resolvedOverline = computed(() => props.overline || t('events.dialogOverline'))
const resolvedTitle = computed(() => {
  if (props.title) {
    return props.title
  }

  return props.mode === 'edit' ? t('events.editEvent') : t('events.addEvent')
})
const submitLabel = computed(() =>
  props.mode === 'edit' ? t('common.saveChanges') : t('common.saveEvent'),
)
const eventSelectionMode = computed(() => getEventSelectionMode(eventForm.type))
const eventAmountLabel = computed(() => t(getEventAmountLabelKey(eventForm.type)))
const isHerdScopedEvent = computed(() => eventSelectionMode.value === 'optionalMulti')
const eventDateMin = computed(() => (eventForm.type === 'expected_birth' ? todayDateString() : ''))
const showExpectedBirthPlanner = computed(() =>
  eventForm.type === 'breeding',
)
const expectedBirthAnimal = computed(() => {
  if (!showExpectedBirthPlanner.value) {
    return null
  }

  const animalId = resolveExpectedBirthAnimalId(buildCurrentEventAnimalIds())

  return props.animals.find((animal) => animal.id === animalId) ?? null
})
const suggestedExpectedBirthDate = computed(() =>
  expectedBirthAnimal.value
    ? buildExpectedBirthDate(eventForm.date, expectedBirthAnimal.value.species)
    : '',
)
const expectedBirthDateHint = computed(() => {
  if (!suggestedExpectedBirthDate.value) {
    return ''
  }

  return `${t('events.expectedBirthSuggestedHint')} ${t('events.expectedBirthAdjustHint')}`
})
const pregnancyCheckResultOptions = computed(() => [
  { label: t('events.pregnancyCheckPregnant'), value: 'pregnant' },
  { label: t('events.pregnancyCheckOpen'), value: 'open' },
  { label: t('events.pregnancyCheckUnknown'), value: 'unknown' },
])
const pregnancyCheckMethodOptions = computed(() => [
  { label: t('events.pregnancyCheckMethodPalpation'), value: 'palpation' },
  { label: t('events.pregnancyCheckMethodUltrasound'), value: 'ultrasound' },
  { label: t('events.pregnancyCheckMethodBloodTest'), value: 'blood_test' },
  { label: t('events.pregnancyCheckMethodVisual'), value: 'visual' },
  { label: t('events.pregnancyCheckMethodOther'), value: 'other' },
])
const multiAnimalPickerLabel = computed(() => {
  if (isHerdScopedEvent.value) {
    return t('events.pickAnimalsOptional')
  }

  return hasFixedAnimal.value ? t('events.pickAdditionalAnimals') : t('events.pickAnimals')
})
const singleEventPickerAnimals = computed(() => buildSelectableEventAnimals([eventForm.animalId]))
const multiEventPickerAnimals = computed(() => buildSelectableEventAnimals(eventForm.animalIds))
const breedingPartnerAnimals = computed(() =>
  filterBreedingPartnerCandidates({
    animals: props.animals,
    animalId: props.fixedAnimalId || eventForm.animalId,
    currentPartnerId: eventForm.partnerAnimalId,
  }),
)
const linkedExpectedBirthEvent = computed(() => {
  if (!props.event?.linkedEventId) {
    return null
  }

  const linkedEvent = props.events.find((event) => event.id === props.event.linkedEventId) ?? null
  return linkedEvent?.type === 'expected_birth' ? linkedEvent : null
})
const linkedBreedingEventOptions = computed(() => {
  const targetAnimalId = props.fixedAnimalId || eventForm.animalId

  if (!targetAnimalId) {
    return []
  }

  return props.events
    .map((event) => normalizeEventRecord(event))
    .filter((event) =>
      event.type === 'breeding'
      && event.animalIds.includes(targetAnimalId)
      && (!props.event?.id || event.id !== props.event.id),
    )
    .sort((left, right) => String(right.date ?? '').localeCompare(String(left.date ?? '')))
    .map((event) => ({
      label: buildLinkedBreedingEventLabel(event, targetAnimalId),
      value: event.id,
    }))
})

function defaultEventForm() {
  return {
    animalId: '',
    animalIds: [],
    type: props.initialType || 'breeding',
    partnerAnimalId: '',
    expectedBirthEnabled: false,
    expectedBirthDate: '',
    pregnancyCheckResult: props.initialDetails?.result ?? '',
    pregnancyCheckMethod: props.initialDetails?.method ?? '',
    linkedBreedingEventId: props.initialDetails?.linkedBreedingEventId ?? '',
    amount: '',
    date: todayDateString(),
    notes: '',
  }
}

function getEventAnimalIdsForForm(event) {
  return normalizeEventRecord(event).animalIds
}

function syncForm() {
  const defaultAnimalId = props.defaultAnimalId || ''

  isSyncingEventForm.value = true

  if (props.event) {
    const normalizedEvent = normalizeEventRecord(props.event)

    Object.assign(eventForm, {
      animalId: normalizedEvent.animalIds[0] ?? defaultAnimalId,
      animalIds: getEventAnimalIdsForForm(normalizedEvent),
      type: normalizedEvent.type ?? 'breeding',
      partnerAnimalId: normalizedEvent.animalIds[1] ?? '',
      expectedBirthEnabled:
        normalizedEvent.type === 'breeding' && Boolean(linkedExpectedBirthEvent.value),
      expectedBirthDate:
        normalizedEvent.type === 'breeding' ? (linkedExpectedBirthEvent.value?.date ?? '') : '',
      pregnancyCheckResult: normalizedEvent.details?.result ?? '',
      pregnancyCheckMethod: normalizedEvent.details?.method ?? '',
      linkedBreedingEventId: normalizedEvent.details?.linkedBreedingEventId ?? '',
      amount: normalizedEvent.amount != null ? String(normalizedEvent.amount) : '',
      date: normalizedEvent.date || todayDateString(),
      notes: normalizedEvent.notes ?? '',
    })
  } else {
    Object.assign(eventForm, {
      ...defaultEventForm(),
      animalId: hasFixedAnimal.value ? props.fixedAnimalId : defaultAnimalId,
      animalIds: hasFixedAnimal.value ? [props.fixedAnimalId] : [],
    })
  }

  nextTick(() => {
    lastSuggestedExpectedBirthDate.value = suggestedExpectedBirthDate.value
    isExpectedBirthDateManuallyEdited.value = Boolean(eventForm.expectedBirthDate)
    isSyncingEventForm.value = false
  })
}

function closeDialog() {
  emit('update:modelValue', false)
}

function updateDialogState(value) {
  emit('update:modelValue', value)
}

function submitForm() {
  const primaryAnimalId = props.fixedAnimalId || eventForm.animalId
  const eventAnimalIds = buildEventAnimalIds({
    type: eventForm.type,
    animalId: eventForm.animalId,
    animalIds: eventForm.animalIds,
    partnerAnimalId: eventForm.partnerAnimalId,
    fixedAnimalId: props.fixedAnimalId,
  })

  if (
    (eventSelectionMode.value === 'single' || eventSelectionMode.value === 'breeding') &&
    !primaryAnimalId
  ) {
    $q.notify({
      color: 'negative',
      message: t('events.selectAnimalBeforeSaving'),
      position: 'top',
    })
    return
  }

  if (eventSelectionMode.value === 'multi' && eventAnimalIds.length === 0) {
    $q.notify({
      color: 'negative',
      message: t('events.selectAnimalsBeforeSaving'),
      position: 'top',
    })
    return
  }

  if (eventForm.type === 'breeding') {
    const breedingValidationKey = validateBreedingPartnerSelection({
      animals: props.animals,
      animalId: primaryAnimalId,
      partnerAnimalId: eventForm.partnerAnimalId,
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

  if (eventForm.type === 'expected_birth') {
    const targetAnimal = props.animals.find((animal) => animal.id === primaryAnimalId)

    if (!eventForm.date || eventForm.date < todayDateString()) {
      $q.notify({
        color: 'negative',
        message: t('events.expectedBirthFutureDateOnly'),
        position: 'top',
      })
      return
    }

    if (targetAnimal?.sex === 'male') {
      $q.notify({
        color: 'negative',
        message: t('events.expectedBirthFemaleOnly'),
        position: 'top',
      })
      return
    }
  }

  if (eventForm.type === 'pregnancy_check' && !eventForm.pregnancyCheckResult) {
    $q.notify({
      color: 'negative',
      message: t('events.pregnancyCheckResultRequired'),
      position: 'top',
    })
    return
  }

  let expectedBirthPlan = null

  if (showExpectedBirthPlanner.value && eventForm.expectedBirthEnabled) {
    if (!eventForm.expectedBirthDate) {
      $q.notify({
        color: 'negative',
        message: t('events.expectedBirthDateRequired'),
        position: 'top',
      })
      return
    }

    if (eventForm.expectedBirthDate < todayDateString()) {
      $q.notify({
        color: 'negative',
        message: t('events.expectedBirthFutureDateOnly'),
        position: 'top',
      })
      return
    }

    const expectedBirthAnimalId = resolveExpectedBirthAnimalId(eventAnimalIds)

    if (!expectedBirthAnimalId) {
      $q.notify({
        color: 'negative',
        message: t('events.expectedBirthNeedsFemale'),
        position: 'top',
      })
      return
    }

    expectedBirthPlan = {
      enabled: true,
      animalId: expectedBirthAnimalId,
      date: eventForm.expectedBirthDate,
      linkedEventId: linkedExpectedBirthEvent.value?.id ?? '',
    }
  } else if (showExpectedBirthPlanner.value) {
    expectedBirthPlan = {
      enabled: false,
      linkedEventId: linkedExpectedBirthEvent.value?.id ?? '',
    }
  }

  emit('submit', {
    animalId: eventAnimalIds[0] ?? eventForm.animalId,
    animalIds: eventAnimalIds,
    scope: eventAnimalIds.length === 0 ? 'herd' : 'animals',
    type: eventForm.type,
    partnerAnimalId: eventForm.partnerAnimalId,
    details: buildEventDetails(),
    amount: eventForm.amount,
    date: eventForm.date,
    notes: eventForm.notes,
    expectedBirthPlan,
  })
}

function resolveExpectedBirthAnimalId(eventAnimalIds = []) {
  const relatedAnimals = eventAnimalIds
    .map((animalId) => props.animals.find((animal) => animal.id === animalId))
    .filter(Boolean)

  const femaleAnimals = relatedAnimals.filter((animal) => animal.sex === 'female')

  if (femaleAnimals.length === 0) {
    return ''
  }

  return femaleAnimals[0].id ?? ''
}

function buildCurrentEventAnimalIds(type = eventForm.type) {
  return buildEventAnimalIds({
    type,
    animalId: eventForm.animalId,
    animalIds: eventForm.animalIds,
    partnerAnimalId: eventForm.partnerAnimalId,
    fixedAnimalId: props.fixedAnimalId,
  })
}

function updateExpectedBirthDate(value) {
  eventForm.expectedBirthDate = value

  if (!isSyncingEventForm.value) {
    isExpectedBirthDateManuallyEdited.value = true
  }
}

function applyExpectedBirthSuggestion({ force = false } = {}) {
  if (
    isSyncingEventForm.value
    || !showExpectedBirthPlanner.value
    || !eventForm.expectedBirthEnabled
  ) {
    return
  }

  const previousSuggestedDate = lastSuggestedExpectedBirthDate.value
  const nextSuggestedDate = suggestedExpectedBirthDate.value
  lastSuggestedExpectedBirthDate.value = nextSuggestedDate

  if (!nextSuggestedDate) {
    return
  }

  const canApplySuggestion = shouldApplyExpectedBirthSuggestion({
    currentDate: eventForm.expectedBirthDate,
    force,
    isManuallyEdited: isExpectedBirthDateManuallyEdited.value,
    previousSuggestedDate,
  })

  if (!canApplySuggestion) {
    return
  }

  eventForm.expectedBirthDate = nextSuggestedDate
  isExpectedBirthDateManuallyEdited.value = false
}

function updateAmountValue(value) {
  eventForm.amount = sanitizeNonNegativeAmountInput(value)
}

function buildEventDetails() {
  const baseDetails = {
    ...(props.event?.details ?? {}),
    ...(props.initialDetails ?? {}),
  }

  if (eventForm.type !== 'pregnancy_check') {
    return baseDetails
  }

  return {
    ...baseDetails,
    result: eventForm.pregnancyCheckResult,
    method: eventForm.pregnancyCheckMethod ?? '',
    linkedBreedingEventId: eventForm.linkedBreedingEventId ?? '',
    linkedExpectedBirthEventId: baseDetails.linkedExpectedBirthEventId ?? '',
  }
}

function buildLinkedBreedingEventLabel(event, targetAnimalId) {
  const partnerAnimalId = event.animalIds.find((animalId) => animalId !== targetAnimalId) ?? ''
  const partnerAnimal = props.animals.find((animal) => animal.id === partnerAnimalId) ?? null
  const dateLabel = event.date ? formatDisplayDate(event.date) : t('common.dateNotSet')

  if (!partnerAnimal) {
    return dateLabel
  }

  return `${dateLabel} - ${formatAnimalDisplayName(partnerAnimal)}`
}

function buildSelectableEventAnimals(selectedIds = []) {
  const selectedAnimals = selectedIds
    .map((animalId) => props.animals.find((animal) => animal.id === animalId))
    .filter(Boolean)

  const availableAnimals = activeAnimalsForEvents.value.filter((animal) => {
    if (eventForm.type !== 'expected_birth') {
      return true
    }

    return animal.sex !== 'male'
  })

  return [
    ...selectedAnimals,
    ...availableAnimals.filter((animal) =>
      !selectedIds.includes(animal.id),
    ),
  ]
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      syncForm()
    }
  },
)

watch(
  () => [
    props.event,
    props.events,
    props.defaultAnimalId,
    props.fixedAnimalId,
    props.animals,
    props.initialType,
    props.initialDetails,
  ],
  () => {
    if (props.modelValue) {
      syncForm()
    }
  },
)

watch(
  () => eventForm.type,
  (value, previousValue) => {
    if (isSyncingEventForm.value) {
      return
    }

    const currentAnimalIds = buildEventAnimalIds({
      type: previousValue,
      animalId: eventForm.animalId,
      animalIds: eventForm.animalIds,
      partnerAnimalId: eventForm.partnerAnimalId,
      fixedAnimalId: props.fixedAnimalId,
    })

    if (value === 'purchase' && props.mode === 'create') {
      emit('purchaseSelected', { animalIds: currentAnimalIds })
      closeDialog()
      return
    }

    if (value === 'birth' && props.mode === 'create') {
      emit('birthSelected', { animalIds: currentAnimalIds })
      closeDialog()
      return
    }

    if (value !== 'breeding') {
      eventForm.partnerAnimalId = ''
      eventForm.expectedBirthEnabled = false
      eventForm.expectedBirthDate = ''
      isExpectedBirthDateManuallyEdited.value = false
      lastSuggestedExpectedBirthDate.value = ''
    }

    if (value !== 'pregnancy_check') {
      eventForm.pregnancyCheckResult = ''
      eventForm.pregnancyCheckMethod = ''
      eventForm.linkedBreedingEventId = ''
    }

    if (getEventSelectionMode(value) === 'multi' || getEventSelectionMode(value) === 'optionalMulti') {
      eventForm.animalIds = currentAnimalIds
      eventForm.animalId = eventForm.animalIds[0] ?? (hasFixedAnimal.value ? props.fixedAnimalId : '')
      return
    }

    eventForm.animalId = currentAnimalIds[0] ?? (hasFixedAnimal.value ? props.fixedAnimalId : '')
    eventForm.animalIds = []
  },
)

watch(
  () => eventForm.expectedBirthEnabled,
  (value) => {
    if (isSyncingEventForm.value) {
      return
    }

    if (!value) {
      isExpectedBirthDateManuallyEdited.value = false
      lastSuggestedExpectedBirthDate.value = ''
      return
    }

    if (!eventForm.expectedBirthDate) {
      isExpectedBirthDateManuallyEdited.value = false
    }

    applyExpectedBirthSuggestion({ force: !eventForm.expectedBirthDate })
  },
)

watch(
  suggestedExpectedBirthDate,
  () => {
    applyExpectedBirthSuggestion()
  },
)

watch(
  () => eventForm.animalIds,
  (value) => {
    if (!hasFixedAnimal.value && value.length > 0) {
      eventForm.animalId = value[0]
    }
  },
  { deep: true },
)
</script>
