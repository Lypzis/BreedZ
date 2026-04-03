<template>
  <div>
    <q-input :model-value="selectedAnimalLabel" outlined readonly :label="label">
      <template #append>
        <q-btn
          v-if="allowClear && modelValue"
          flat
          round
          dense
          icon="close"
          color="grey-7"
          aria-label="Clear selected animal"
          title="Clear selected animal"
          @click="emit('update:modelValue', '')"
        />
        <q-btn
          flat
          round
          dense
          icon="search"
          color="primary"
          aria-label="Search animal"
          title="Search animal"
          @click="isPickerOpen = true"
        />
      </template>
    </q-input>

    <q-dialog v-model="isPickerOpen">
      <q-card style="width: 100%; max-width: 640px">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-overline text-weight-bold text-primary">Animals</div>
            <div class="text-h6 text-weight-bold">{{ dialogTitle }}</div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            aria-label="Close animal picker"
            title="Close animal picker"
            @click="isPickerOpen = false"
          />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="searchTerm"
            outlined
            dense
            clearable
            label="Search animal"
            placeholder="Tag, name, or species"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-banner rounded class="bg-grey-1 text-grey-8 q-mt-md">
            <template #avatar>
              <q-icon name="pets" color="primary" />
            </template>
            Showing {{ filteredAnimals.length }} animal{{ filteredAnimals.length === 1 ? '' : 's' }}.
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
                {{ animal.species || 'Species not set' }} • {{ sexLabel(animal.sex) }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-card-section v-else class="q-pt-none">
          <q-banner rounded class="bg-grey-1 text-grey-8">
            <template #avatar>
              <q-icon name="search_off" color="primary" />
            </template>
            No matching animals found.
          </q-banner>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { formatAnimalDisplayName } from 'src/utils/animal-display'
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
    default: 'Animal',
  },
  dialogTitle: {
    type: String,
    default: 'Pick animal',
  },
  emptyLabel: {
    type: String,
    default: 'No animal selected',
  },
  allowClear: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const isPickerOpen = ref(false)
const searchTerm = ref('')

const selectedAnimal = computed(() =>
  props.animals.find((animal) => animal.id === props.modelValue) ?? null,
)
const selectedAnimalLabel = computed(() =>
  selectedAnimal.value ? animalDisplayName(selectedAnimal.value) : props.emptyLabel,
)
const filteredAnimals = computed(() =>
  filterAnimalCandidates({
    animals: props.animals,
    query: searchTerm.value,
  }),
)

function animalDisplayName(animal) {
  return formatAnimalDisplayName(animal)
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
