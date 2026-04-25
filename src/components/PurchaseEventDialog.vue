<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card class="app-dialog-card" style="width: 100%; max-width: 760px">
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="text-overline text-weight-bold text-primary">{{ t('events.purchaseDialogOverline') }}</div>
          <div class="text-h6 text-weight-bold">{{ t('events.purchaseDialogTitle') }}</div>
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
        <q-form id="purchase-event-dialog" class="column q-gutter-md" @submit.prevent="submitForm">
          
            <div >
              <q-input v-model="form.date" outlined type="date" :label="t('events.eventDate')" />
            </div>
            <div >
              <q-input v-model="form.amount" outlined inputmode="decimal" :label="t('events.price')" />
            </div>

          <AnimalMultiPickerField
            v-model="form.existingAnimalIds"
            :animals="animals"
            :label="t('events.purchaseExistingAnimals')"
            :dialog-title="t('events.purchaseExistingAnimals')"
            :empty-label="t('common.noAnimalsSelected')"
          />

          <div>
            <div class="row items-center justify-between q-mb-sm">
              <div>
                <div class="text-subtitle1 text-weight-bold">{{ t('events.purchaseNewAnimals') }}</div>
                <div class="text-caption text-grey-7">{{ t('events.purchaseNewAnimalsHint') }}</div>
              </div>
              <q-btn
                outline
                color="primary"
                icon="add"
                :label="t('events.purchaseAddNewAnimal')"
                @click="addNewAnimalRow"
              />
            </div>

            <q-banner v-if="newAnimalForms.length === 0" rounded class="bg-grey-1 text-grey-8">
              <template #avatar>
                <q-icon name="pets" color="primary" />
              </template>
              {{ t('events.purchaseNoNewAnimals') }}
            </q-banner>

            <div v-else class="column q-gutter-sm">
              <q-card
                v-for="(animal, index) in newAnimalForms"
                :key="animal.clientId"
                bordered
                flat
                class="q-pa-md"
              >
                <div class="row items-center justify-between q-mb-sm">
                  <div class="text-subtitle2 text-weight-bold">
                    {{ t('events.purchaseNewAnimalTitle', { number: index + 1 }) }}
                  </div>
                  <q-btn
                    flat
                    round
                    dense
                    color="negative"
                    icon="delete"
                    :aria-label="t('events.purchaseRemoveNewAnimal')"
                    :title="t('events.purchaseRemoveNewAnimal')"
                    @click="removeNewAnimalRow(animal.clientId)"
                  />
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
                    <q-select
                      v-model="animal.sex"
                      outlined
                      dense
                      emit-value
                      map-options
                      :label="t('animalForm.sex')"
                      :options="sexOptions"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input v-model="animal.birthDate" outlined dense type="date" :label="t('animalForm.birthDate')" />
                  </div>
                  <div class="col-12">
                    <q-toggle
                      v-model="animal.isBreeder"
                      color="info"
                      checked-icon="bookmark"
                      :label="t('animalForm.isBreeder')"
                    />
                  </div>
                  <div class="col-12">
                    <q-input v-model="animal.notes" outlined dense autogrow type="textarea" :label="t('animalForm.notes')" />
                  </div>
                </div>
              </q-card>
            </div>
          </div>

          <q-input v-model="form.notes" outlined autogrow type="textarea" :label="t('events.notes')" />

          <q-banner rounded class="bg-green-1 text-primary">
            <template #avatar>
              <q-icon name="shopping_cart" color="primary" />
            </template>
            {{ purchaseSummary }}
          </q-banner>

        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="app-dialog-card__actions">
        <q-btn flat color="grey-7" :label="t('common.cancel')" @click="closeDialog" />
        <q-btn
          unelevated
          color="primary"
          :label="t('events.purchaseSave')"
          type="submit"
          form="purchase-event-dialog"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import AnimalMultiPickerField from 'src/components/AnimalMultiPickerField.vue'
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
        notes: animal.notes.trim(),
      }
    })
    .filter((animal) => hasNewAnimalContent(animal)),
)
const purchaseSummary = computed(() =>
  t('events.purchaseSummary', {
    existing: form.existingAnimalIds.length,
    created: preparedNewAnimals.value.length,
  }),
)

function defaultForm() {
  return {
    existingAnimalIds: [],
    amount: '',
    date: todayDateString(),
    notes: '',
  }
}

function defaultNewAnimalForm() {
  return {
    clientId: `new-animal-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    tag: '',
    name: '',
    species: '',
    breed: '',
    isBreeder: false,
    sex: 'unknown',
    birthDate: '',
    notes: '',
  }
}

function hasNewAnimalContent(animal) {
  return [
    animal.tag,
    animal.name,
    animal.species,
    animal.breed,
    animal.birthDate,
    animal.notes,
  ].some((value) => String(value || '').trim())
    || animal.sex !== 'unknown'
    || animal.isBreeder === true
}

function resetForm() {
  Object.assign(form, {
    ...defaultForm(),
    existingAnimalIds: [...props.initialAnimalIds],
  })
  newAnimalForms.value = []
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

  const canCreateAllAnimals = preparedNewAnimals.value.every((_, index) =>
    canCreateAnimal(props.currentAnimalCount + index, { isPremium: props.isPremium }),
  )

  if (!canCreateAllAnimals) {
    notify(t('events.purchaseAnimalLimitReached'))
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
    amount: form.amount,
    date: form.date,
    notes: form.notes,
  })
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      resetForm()
    }
  },
)
</script>
