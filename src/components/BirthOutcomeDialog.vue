<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card class="app-dialog-card" style="width: 100%; max-width: 760px">
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="text-overline text-weight-bold text-primary">{{ t('events.birthDialogOverline') }}</div>
          <div class="text-h6 text-weight-bold">{{ t('events.birthDialogTitle') }}</div>
        </div>
        <q-btn flat round dense icon="close" :aria-label="t('common.closeDialog')" :title="t('common.closeDialog')"
          @click="closeDialog" />
      </q-card-section>

      <q-card-section class="app-dialog-card__body q-pt-none">
        <q-form id="birth-outcome-dialog" class="column q-gutter-md" @submit.prevent="submitForm">
          <q-input v-model="form.date" outlined type="date" :label="t('events.eventDate')" />

          <div class="col-12 ">
            <AnimalPickerField v-model="form.damId" :animals="parentAnimalOptions" :label="t('animalForm.dam')"
              :dialog-title="t('animalForm.pickDam')" :empty-label="t('animalForm.noDamLinked')"
              required-sex="female" />
          </div>
          <div class="col-12 ">
            <AnimalPickerField v-model="form.sireId" :animals="parentAnimalOptions" :label="t('animalForm.sire')"
              :dialog-title="t('animalForm.pickSire')" :empty-label="t('animalForm.noSireLinked')"
              required-sex="male" />
          </div>

          <AnimalMultiPickerField v-model="form.existingAnimalIds" :animals="existingAnimalOptions"
            :label="t('events.birthExistingAnimals')" :dialog-title="t('events.birthExistingAnimals')"
            :empty-label="t('common.noAnimalsSelected')" />

          <div>
            <div class="row items-center justify-between q-mb-sm">
              <div>
                <div class="text-subtitle1 text-weight-bold">{{ t('events.birthNewAnimals') }}</div>
                <div class="text-caption text-grey-7">{{ t('events.birthNewAnimalsHint') }}</div>
              </div>
              <q-btn outline color="primary" icon="add" :label="t('events.birthAddNewAnimal')"
                @click="addNewAnimalRow" />
            </div>

            <q-banner v-if="newAnimalForms.length === 0" rounded class="bg-grey-1 text-grey-8">
              <template #avatar>
                <q-icon name="pets" color="primary" />
              </template>
              {{ t('events.birthNoNewAnimals') }}
            </q-banner>

            <div v-else class="column q-gutter-sm">
              <q-card v-for="(animal, index) in newAnimalForms" :key="animal.clientId" bordered flat class="q-pa-md">
                <div class="row items-center justify-between q-mb-sm">
                  <div class="text-subtitle2 text-weight-bold">
                    {{ t('events.birthNewAnimalTitle', { number: index + 1 }) }}
                  </div>
                  <q-btn flat round dense color="negative" icon="delete" :aria-label="t('events.birthRemoveNewAnimal')"
                    :title="t('events.birthRemoveNewAnimal')" @click="removeNewAnimalRow(animal.clientId)" />
                </div>

                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-6">
                    <q-input v-model="animal.tag" outlined dense :label="t('animalForm.tag')" />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input v-model="animal.name" outlined dense :label="t('animalForm.name')" />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input v-model="animal.species" outlined dense :label="t('animalForm.species')" />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input v-model="animal.breed" outlined dense :label="t('animalForm.breed')" />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-select v-model="animal.sex" outlined dense emit-value map-options :label="t('animalForm.sex')"
                      :options="sexOptions" />
                  </div>
                  <div class="col-12">
                    <q-input v-model="animal.notes" outlined dense autogrow type="textarea"
                      :label="t('animalForm.notes')" />
                  </div>
                </div>
              </q-card>
            </div>
          </div>

          <q-input v-model="form.notes" outlined autogrow type="textarea" :label="t('events.notes')" />

          <q-banner rounded class="bg-green-1 text-primary">
            <template #avatar>
              <q-icon name="child_friendly" color="primary" />
            </template>
            {{ birthSummary }}
          </q-banner>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="app-dialog-card__actions">
        <q-btn flat color="grey-7" :label="t('common.cancel')" @click="closeDialog" />
        <q-btn unelevated color="primary" :label="t('events.birthSave')" type="submit" form="birth-outcome-dialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import AnimalMultiPickerField from 'src/components/AnimalMultiPickerField.vue'
import AnimalPickerField from 'src/components/AnimalPickerField.vue'
import { useI18nText } from 'src/i18n'
import { todayDateString } from 'src/utils/dates'
import { canCreateAnimal } from 'src/utils/premium-limits'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  animals: {
    type: Array,
    default: () => [],
  },
  currentAnimalCount: {
    type: Number,
    default: 0,
  },
  initialAnimalIds: {
    type: Array,
    default: () => [],
  },
  damAnimal: {
    type: Object,
    default: null,
  },
  sireAnimal: {
    type: Object,
    default: null,
  },
  showInitialNewborn: {
    type: Boolean,
    default: false,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'update:modelValue'])

const $q = useQuasar()
const { t } = useI18nText()
const form = reactive(defaultForm())
const newAnimalForms = ref([])

const sexOptions = computed(() => [
  { label: t('common.sex.female'), value: 'female' },
  { label: t('common.sex.male'), value: 'male' },
  { label: t('common.sex.unknown'), value: 'unknown' },
])
const existingAnimalOptions = computed(() =>
  props.animals.filter((animal) =>
    animal.status === 'active'
    && animal.id !== form.damId
    && animal.id !== form.sireId,
  ),
)
const parentAnimalOptions = computed(() => props.animals)
const selectedDamAnimal = computed(() =>
  props.animals.find((animal) => animal.id === form.damId) ?? null,
)
const preparedNewAnimals = computed(() =>
  newAnimalForms.value
    .map((newAnimal) => {
      const animal = { ...newAnimal }
      delete animal.clientId

      return {
        ...animal,
        tag: animal.tag.trim(),
        name: animal.name.trim(),
        species: animal.species.trim(),
        breed: animal.breed.trim(),
        birthDate: form.date,
        damId: form.damId,
        sireId: form.sireId,
        notes: animal.notes.trim(),
      }
    })
    .filter((animal) => hasNewAnimalContent(animal)),
)
const birthSummary = computed(() =>
  t('events.birthSummary', {
    existing: form.existingAnimalIds.length,
    created: preparedNewAnimals.value.length,
  }),
)

function defaultForm() {
  return {
    existingAnimalIds: [],
    date: todayDateString(),
    damId: '',
    sireId: '',
    notes: '',
  }
}

function defaultNewAnimalForm() {
  return {
    clientId: `new-birth-animal-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    tag: '',
    name: '',
    species: selectedDamAnimal.value?.species ?? '',
    breed: selectedDamAnimal.value?.breed ?? '',
    sex: 'unknown',
    notes: '',
  }
}

function hasNewAnimalContent(animal) {
  return [
    animal.tag,
    animal.name,
    animal.species,
    animal.breed,
    animal.notes,
  ].some((value) => String(value || '').trim())
    || animal.sex !== 'unknown'
}

function resetForm() {
  Object.assign(form, {
    ...defaultForm(),
    existingAnimalIds: [...props.initialAnimalIds],
    damId: props.damAnimal?.id ?? '',
    sireId: props.sireAnimal?.id ?? '',
  })
  newAnimalForms.value = props.showInitialNewborn ? [defaultNewAnimalForm()] : []
}

function closeDialog() {
  emit('update:modelValue', false)
}

function addNewAnimalRow() {
  newAnimalForms.value = [...newAnimalForms.value, defaultNewAnimalForm()]
}

function removeNewAnimalRow(clientId) {
  newAnimalForms.value = newAnimalForms.value.filter((animal) => animal.clientId !== clientId)
}

function notify(message) {
  $q.notify({
    color: 'negative',
    message,
    position: 'top',
  })
}

function validateForm() {
  if (form.existingAnimalIds.length === 0 && preparedNewAnimals.value.length === 0) {
    notify(t('events.selectAnimalsBeforeSaving'))
    return false
  }

  if (preparedNewAnimals.value.some((animal) => !animal.tag && !animal.name)) {
    notify(t('animalForm.requireTagOrName'))
    return false
  }

  if (form.damId && form.damId === form.sireId) {
    notify(t('animalForm.sameParentError'))
    return false
  }

  const canCreateAllAnimals = preparedNewAnimals.value.every((_, index) =>
    canCreateAnimal(props.currentAnimalCount + index, { isPremium: props.isPremium }),
  )

  if (!canCreateAllAnimals) {
    notify(t('events.birthAnimalLimitReached'))
    return false
  }

  return true
}

function submitForm() {
  if (!validateForm()) {
    return
  }

  emit('submit', {
    existingAnimalIds: [...form.existingAnimalIds],
    newAnimals: preparedNewAnimals.value,
    damId: form.damId,
    sireId: form.sireId,
    date: form.date,
    notes: form.notes,
  })
}

watch(
  () => [form.damId, form.sireId],
  () => {
    form.existingAnimalIds = form.existingAnimalIds.filter((animalId) =>
      animalId !== form.damId && animalId !== form.sireId,
    )

    if (!selectedDamAnimal.value) {
      return
    }

    newAnimalForms.value = newAnimalForms.value.map((animal) => ({
      ...animal,
      species: animal.species || selectedDamAnimal.value.species || '',
      breed: animal.breed || selectedDamAnimal.value.breed || '',
    }))
  },
)

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      resetForm()
    }
  },
)
</script>
