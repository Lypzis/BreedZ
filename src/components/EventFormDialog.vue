<template>
  <q-dialog :model-value="modelValue" @update:model-value="updateDialogState">
    <q-card style="width: 100%; max-width: 640px">
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

      <q-card-section class="q-pt-none">
        <q-form class="column q-gutter-md" @submit.prevent="submitForm">
          <q-select
            v-model="eventForm.type"
            outlined
            :label="t('events.eventType')"
            :options="eventTypeOptions"
            emit-value
            map-options
          />
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
          <q-input v-model="eventForm.date" outlined type="date" :label="t('events.eventDate')" />
          <q-input
            v-model="eventForm.amount"
            outlined
            inputmode="decimal"
            :label="eventAmountLabel"
          />
          <q-input v-model="eventForm.notes" outlined autogrow type="textarea" :label="t('events.notes')" />

          <div class="row justify-end q-gutter-sm">
            <q-btn flat color="grey-7" :label="t('common.cancel')" @click="closeDialog" />
            <q-btn unelevated color="primary" :label="submitLabel" type="submit" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import AnimalMultiPickerField from 'src/components/AnimalMultiPickerField.vue'
import AnimalPickerField from 'src/components/AnimalPickerField.vue'
import { getEventTypeOptions } from 'src/constants/events'
import { useI18nText } from 'src/i18n'
import {
  filterBreedingPartnerCandidates,
  validateBreedingPartnerSelection,
} from 'src/utils/breeding-partners'
import {
  buildEventAnimalIds,
  getEventAmountLabelKey,
  getEventSelectionMode,
} from 'src/utils/event-participants'
import { todayDateString } from 'src/utils/dates'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  animals: {
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
  overline: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['purchaseSelected', 'submit', 'update:modelValue'])

const $q = useQuasar()
const { t } = useI18nText()
const eventForm = reactive(defaultEventForm())
const isSyncingEventForm = ref(false)

const eventTypeOptions = computed(() => getEventTypeOptions())
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

function defaultEventForm() {
  return {
    animalId: '',
    animalIds: [],
    type: 'breeding',
    partnerAnimalId: '',
    amount: '',
    date: todayDateString(),
    notes: '',
  }
}

function getEventAnimalIdsForForm(event) {
  const animalIds = event?.animalIds ?? (event?.animalId ? [event.animalId] : [])

  if (!hasFixedAnimal.value) {
    return animalIds
  }

  return animalIds.filter((id) => id !== props.fixedAnimalId)
}

function syncForm() {
  const defaultAnimalId = props.defaultAnimalId || ''

  isSyncingEventForm.value = true

  if (props.event) {
    Object.assign(eventForm, {
      animalId: props.event.animalId ?? defaultAnimalId,
      animalIds: getEventAnimalIdsForForm(props.event),
      type: props.event.type ?? 'breeding',
      partnerAnimalId: props.event.partnerAnimalId ?? '',
      amount: props.event.amount != null ? String(props.event.amount) : '',
      date: props.event.date || todayDateString(),
      notes: props.event.notes ?? '',
    })
  } else {
    Object.assign(eventForm, {
      ...defaultEventForm(),
      animalId: hasFixedAnimal.value ? props.fixedAnimalId : defaultAnimalId,
      animalIds: [],
    })
  }

  nextTick(() => {
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

  emit('submit', {
    animalId: eventAnimalIds[0] ?? eventForm.animalId,
    animalIds: eventAnimalIds,
    scope: eventAnimalIds.length === 0 ? 'herd' : 'animals',
    type: eventForm.type,
    partnerAnimalId: eventForm.partnerAnimalId,
    amount: eventForm.amount,
    date: eventForm.date,
    notes: eventForm.notes,
  })
}

function buildSelectableEventAnimals(selectedIds = []) {
  const selectedAnimals = selectedIds
    .map((animalId) => props.animals.find((animal) => animal.id === animalId))
    .filter(Boolean)

  return [
    ...selectedAnimals,
    ...activeAnimalsForEvents.value.filter((animal) =>
      animal.id !== props.fixedAnimalId && !selectedIds.includes(animal.id),
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
  () => [props.event, props.defaultAnimalId, props.fixedAnimalId, props.animals],
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

    if (value !== 'breeding') {
      eventForm.partnerAnimalId = ''
    }

    if (getEventSelectionMode(value) === 'multi' || getEventSelectionMode(value) === 'optionalMulti') {
      eventForm.animalIds = hasFixedAnimal.value
        ? currentAnimalIds.filter((id) => id !== props.fixedAnimalId)
        : currentAnimalIds
      eventForm.animalId = eventForm.animalIds[0] ?? (hasFixedAnimal.value ? props.fixedAnimalId : '')
      return
    }

    eventForm.animalId = currentAnimalIds[0] ?? (hasFixedAnimal.value ? props.fixedAnimalId : '')
    eventForm.animalIds = []
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
