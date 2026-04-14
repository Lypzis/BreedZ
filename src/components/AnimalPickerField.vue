<template>
  <div>
    <q-input :model-value="selectedAnimalLabel" outlined readonly :label="resolvedLabel">
      <template #append>
        <q-btn
          v-if="allowClear && modelValue"
          flat
          round
          dense
          icon="close"
          color="grey-7"
          :aria-label="t('animalPicker.clear')"
          :title="t('animalPicker.clear')"
          @click="emit('update:modelValue', '')"
        />
        <q-btn
          flat
          round
          dense
          icon="search"
          color="primary"
          :aria-label="t('animalPicker.search')"
          :title="t('animalPicker.search')"
          @click="isPickerOpen = true"
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
            @click="isPickerOpen = false"
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
            @click="selectAnimal(animal)"
          >
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white" icon="pets" />
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
    type: String,
    default: '',
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

const selectedAnimal = computed(() =>
  props.animals.find((animal) => animal.id === props.modelValue) ?? null,
)
const selectedAnimalLabel = computed(() =>
  selectedAnimal.value ? animalDisplayName(selectedAnimal.value) : resolvedEmptyLabel.value,
)
const resolvedLabel = computed(() => props.label || t('events.pickAnimal'))
const resolvedDialogTitle = computed(() => props.dialogTitle || t('events.pickAnimal'))
const resolvedEmptyLabel = computed(() => props.emptyLabel || t('common.noAnimalSelected'))
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

function animalDisplayName(animal) {
  return formatAnimalDisplayName(animal)
}

function animalSpeciesBreed(animal) {
  return formatAnimalSpeciesBreed(animal)
}

function sexLabel(sex) {
  return formatAnimalSex(sex)
}

function selectAnimal(animal) {
  emit('update:modelValue', animal.id)
  isPickerOpen.value = false
  searchTerm.value = ''
}
</script>
