<template>
  <div>
    <q-input
      :model-value="selectedAnimalLabel"
      outlined
      readonly
      :label="resolvedLabel"
      class="animal-picker-trigger"
      @click="openPicker"
    >
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
      <q-card class="app-dialog-card" style="width: 100%; max-width: 640px">
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

        <q-card-section class="app-dialog-card__body q-pt-none">
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
          <PagedListControls
            v-if="filteredAnimals.length > 0"
            :current-page="currentPage"
            :list-mode="listMode"
            :list-mode-options="listModeOptions"
            :page-count="pageCount"
            :page-size="pageSize"
            :page-size-options="pageSizeOptions"
            :per-page-label="t('common.perPage')"
            :showing-text="pickerCountLabel"
            :show-pagination="false"
            @update:current-page="currentPage = $event"
            @update:list-mode="listMode = $event"
            @update:page-size="pageSize = $event"
          />

          <q-list v-if="filteredAnimals.length > 0" separator>
            <q-item
              v-for="animal in displayedAnimals"
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

          <PagedListControls
            v-if="filteredAnimals.length > 0"
            :current-page="currentPage"
            :list-mode="listMode"
            :list-mode-options="listModeOptions"
            :page-count="pageCount"
            :page-size="pageSize"
            :page-size-options="pageSizeOptions"
            :per-page-label="t('common.perPage')"
            :showing-text="pickerCountLabel"
            :show-header="false"
            @update:current-page="currentPage = $event"
            @update:list-mode="listMode = $event"
            @update:page-size="pageSize = $event"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import PagedListControls from 'src/components/PagedListControls.vue'
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
const currentPage = ref(1)
const listMode = ref('paged')
const pageSize = ref(5)
const pageSizeOptions = [
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '25', value: 25 },
]

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
const listModeOptions = computed(() => [
  { label: t('common.pages'), value: 'paged' },
  { label: t('common.viewAll'), value: 'all' },
])
const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredAnimals.value.length / pageSize.value)),
)
const paginatedAnimals = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredAnimals.value.slice(start, start + pageSize.value)
})
const displayedAnimals = computed(() =>
  listMode.value === 'paged' ? paginatedAnimals.value : filteredAnimals.value,
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

function openPicker() {
  currentPage.value = 1
  isPickerOpen.value = true
}

function clearSelection() {
  emit('update:modelValue', '')
}

function selectAnimal(animal) {
  emit('update:modelValue', animal.id)
  isPickerOpen.value = false
  searchTerm.value = ''
  currentPage.value = 1
}

watch(filteredAnimals, () => {
  if (currentPage.value > pageCount.value) {
    currentPage.value = pageCount.value
  }
})

watch(searchTerm, () => {
  currentPage.value = 1
})
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
