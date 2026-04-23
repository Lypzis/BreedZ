<template>
  <div>
    <q-input
      :model-value="selectedAnimalsLabel"
      outlined
      readonly
      :label="resolvedLabel"
      class="animal-picker-trigger"
      @click="openPicker"
    >
      <template #append>
        <q-btn
          v-if="allowClear && modelValue.length > 0"
          flat
          round
          dense
          icon="close"
          color="grey-7"
          :aria-label="t('animalPicker.clear')"
          :title="t('animalPicker.clear')"
          @click.stop="clearSelection"
        />
        <q-btn
          flat
          round
          dense
          icon="search"
          color="primary"
          :aria-label="t('animalPicker.search')"
          :title="t('animalPicker.search')"
          @click.stop="openPicker"
        />
      </template>
    </q-input>

    <q-dialog v-model="isPickerOpen">
      <q-card style="width: 100%; max-width: 640px">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-overline text-weight-bold text-primary">{{ t('animalPicker.overline') }}</div>
            <div class="text-h6 text-weight-bold">{{ resolvedDialogTitle }}</div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            :aria-label="t('animalPicker.close')"
            :title="t('animalPicker.close')"
            @click="closePicker"
          />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="searchTerm"
            outlined
            dense
            clearable
            :label="t('animalPicker.searchLabel')"
            :placeholder="t('animalPicker.searchPlaceholder')"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-banner rounded class="bg-grey-1 text-grey-8 q-mt-md">
            <template #avatar>
              <q-icon name="pets" color="primary" />
            </template>
            {{ pickerCountLabel }}
          </q-banner>
        </q-card-section>

        <q-list v-if="filteredAnimals.length > 0" separator>
          <q-item
            v-for="animal in filteredAnimals"
            :key="animal.id"
            clickable
            @click="toggleAnimal(animal.id)"
          >
            <q-item-section avatar>
              <q-checkbox
                :model-value="draftSelectedIds.includes(animal.id)"
                color="primary"
                @update:model-value="toggleAnimal(animal.id)"
                @click.stop
              />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ animalDisplayName(animal) }}</q-item-label>
              <q-item-label caption>
                {{ animalSpeciesBreed(animal) }} • {{ sexLabel(animal.sex) }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-card-section v-else class="q-pt-none">
          <q-banner rounded class="bg-grey-1 text-grey-8">
            <template #avatar>
              <q-icon name="search_off" color="primary" />
            </template>
            {{ t('animalPicker.empty') }}
          </q-banner>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat color="grey-7" :label="t('common.cancel')" @click="closePicker" />
          <q-btn unelevated color="primary" :label="t('common.save')" @click="saveSelection" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18nText } from 'src/i18n'
import { formatAnimalDisplayName, formatAnimalSpeciesBreed } from 'src/utils/animal-display'
import { filterAnimalCandidates, formatAnimalSex } from 'src/utils/parent-candidates'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  animals: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: '',
  },
  dialogTitle: {
    type: String,
    default: '',
  },
  emptyLabel: {
    type: String,
    default: '',
  },
  allowClear: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18nText()

const isPickerOpen = ref(false)
const searchTerm = ref('')
const draftSelectedIds = ref([])

const normalizedModelValue = computed(() => {
  const seen = new Set()
  const ids = []

  for (const value of props.modelValue) {
    const id = String(value || '').trim()

    if (!id || seen.has(id)) {
      continue
    }

    seen.add(id)
    ids.push(id)
  }

  return ids
})

const selectedAnimals = computed(() =>
  normalizedModelValue.value
    .map((animalId) => props.animals.find((animal) => animal.id === animalId) ?? null)
    .filter(Boolean),
)
const resolvedLabel = computed(() => props.label || t('events.pickAnimals'))
const resolvedDialogTitle = computed(() => props.dialogTitle || t('events.pickAnimals'))
const resolvedEmptyLabel = computed(() => props.emptyLabel || t('common.noAnimalsSelected'))
const filteredAnimals = computed(() =>
  filterAnimalCandidates({
    animals: props.animals,
    query: searchTerm.value,
  }),
)
const pickerCountLabel = computed(() =>
  filteredAnimals.value.length === 1
    ? t('animalPicker.showingOne')
    : t('animalPicker.showingMany', { count: filteredAnimals.value.length }),
)
const selectedAnimalsLabel = computed(() => {
  if (selectedAnimals.value.length === 0) {
    return resolvedEmptyLabel.value
  }

  if (selectedAnimals.value.length <= 2) {
    return selectedAnimals.value.map((animal) => animalDisplayName(animal)).join(', ')
  }

  const preview = selectedAnimals.value
    .slice(0, 2)
    .map((animal) => animalDisplayName(animal))
    .join(', ')

  return `${preview} +${selectedAnimals.value.length - 2}`
})

function animalDisplayName(animal) {
  return formatAnimalDisplayName(animal)
}

function animalSpeciesBreed(animal) {
  return formatAnimalSpeciesBreed(animal)
}

function sexLabel(sex) {
  return formatAnimalSex(sex)
}

function openPicker() {
  draftSelectedIds.value = [...normalizedModelValue.value]
  searchTerm.value = ''
  isPickerOpen.value = true
}

function closePicker() {
  isPickerOpen.value = false
  searchTerm.value = ''
}

function clearSelection() {
  emit('update:modelValue', [])
}

function toggleAnimal(animalId) {
  if (draftSelectedIds.value.includes(animalId)) {
    draftSelectedIds.value = draftSelectedIds.value.filter((id) => id !== animalId)
    return
  }

  draftSelectedIds.value = [...draftSelectedIds.value, animalId]
}

function saveSelection() {
  emit('update:modelValue', [...draftSelectedIds.value])
  closePicker()
}
</script>

<style scoped>
.animal-picker-trigger {
  cursor: pointer;
}

.animal-picker-trigger :deep(.q-field__control),
.animal-picker-trigger :deep(.q-field__native),
.animal-picker-trigger :deep(.q-field__label) {
  cursor: pointer;
}
</style>
