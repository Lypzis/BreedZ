<template>
  <q-dialog v-model="isOpen">
    <q-card style="width: 100%; max-width: 640px">
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="text-overline text-weight-bold text-primary">Animals</div>
          <div class="text-h6 text-weight-bold">
            {{ mode === 'create' ? 'Add animal' : 'Edit animal' }}
          </div>
        </div>
        <q-btn flat round dense icon="close" aria-label="Close dialog" title="Close dialog" @click="closeDialog" />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form class="column q-gutter-md" @submit.prevent="submitForm">
          <q-input v-model="form.tag" outlined label="Tag" />
          <q-input v-model="form.name" outlined label="Name" placeholder="Name (optional)" />
          <q-input v-model="form.species" outlined label="Species" placeholder="Cow, pig, goat..." />
          <q-select v-model="form.sex" outlined label="Sex" :options="sexOptions" emit-value map-options />
          <q-input v-model="form.birthDate" outlined type="date" label="Birth date" />
          <q-select v-model="form.status" outlined label="Status" :options="statusOptions" emit-value map-options />

          <q-input :model-value="selectedDamLabel" outlined readonly label="Dam / mother">
            <template #append>
              <q-btn
                v-if="form.damId"
                flat
                round
                dense
                icon="close"
                color="grey-7"
                aria-label="Clear dam selection"
                title="Clear dam selection"
                @click="clearParentSelection('dam')"
              />
              <q-btn
                flat
                round
                dense
                icon="search"
                color="primary"
                aria-label="Search dam"
                title="Search dam"
                @click="openParentPicker('dam')"
              />
            </template>
          </q-input>

          <q-input :model-value="selectedSireLabel" outlined readonly label="Sire / father">
            <template #append>
              <q-btn
                v-if="form.sireId"
                flat
                round
                dense
                icon="close"
                color="grey-7"
                aria-label="Clear sire selection"
                title="Clear sire selection"
                @click="clearParentSelection('sire')"
              />
              <q-btn
                flat
                round
                dense
                icon="search"
                color="primary"
                aria-label="Search sire"
                title="Search sire"
                @click="openParentPicker('sire')"
              />
            </template>
          </q-input>

          <q-input v-model="form.notes" outlined autogrow type="textarea" label="Notes" />

          <div class="row justify-end q-gutter-sm">
            <q-btn flat color="grey-7" label="Cancel" @click="closeDialog" />
            <q-btn
              unelevated
              color="primary"
              :label="mode === 'create' ? 'Save animal' : 'Update animal'"
              type="submit"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="isParentPickerOpen">
    <q-card style="width: 100%; max-width: 640px">
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="text-overline text-weight-bold text-primary">Lineage</div>
          <div class="text-h6 text-weight-bold">
            Pick {{ currentParentRoleLabel }}
          </div>
        </div>
        <q-btn
          flat
          round
          dense
          icon="close"
          aria-label="Close parent picker"
          title="Close parent picker"
          @click="isParentPickerOpen = false"
        />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          v-model="parentSearchTerm"
          outlined
          dense
          clearable
          label="Search parent"
          placeholder="Tag, name, or species"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-banner rounded class="bg-grey-1 text-grey-8 q-mt-md">
          <template #avatar>
            <q-icon name="filter_alt" color="primary" />
          </template>
          Showing active {{ currentParentRoleLabel.toLowerCase() }} candidates
          <span v-if="form.species"> for species {{ form.species }}</span>.
        </q-banner>
      </q-card-section>

      <q-list v-if="parentCandidates.length > 0" separator>
        <q-item
          v-for="candidate in parentCandidates"
          :key="candidate.id"
          clickable
          @click="selectParent(candidate)"
        >
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" icon="pets" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">{{ animalDisplayName(candidate) }}</q-item-label>
            <q-item-label caption>
              {{ candidate.species || 'Species not set' }} • {{ sexLabel(candidate.sex) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <q-card-section v-else class="q-pt-none">
        <q-banner rounded class="bg-grey-1 text-grey-8">
          <template #avatar>
            <q-icon name="search_off" color="primary" />
          </template>
          No matching parent candidates yet.
        </q-banner>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { formatAnimalDisplayName } from 'src/utils/animal-display'
import { filterParentCandidates, formatAnimalSex } from 'src/utils/parent-candidates'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  animal: {
    type: Object,
    default: null,
  },
  animals: {
    type: Array,
    default: () => [],
  },
  mode: {
    type: String,
    default: 'create',
  },
})

const emit = defineEmits(['submit', 'update:modelValue'])

const $q = useQuasar()

const isParentPickerOpen = ref(false)
const parentPickerType = ref('dam')
const parentSearchTerm = ref('')

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Sold', value: 'sold' },
  { label: 'Dead', value: 'dead' },
]
const sexOptions = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Unknown', value: 'unknown' },
]

const form = reactive(defaultForm())

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const selectedDamLabel = computed(() =>
  parentLabel(props.animals.find((animal) => animal.id === form.damId), 'No dam linked'),
)
const selectedSireLabel = computed(() =>
  parentLabel(props.animals.find((animal) => animal.id === form.sireId), 'No sire linked'),
)
const currentParentRoleLabel = computed(() => (parentPickerType.value === 'dam' ? 'dam / mother' : 'sire / father'))
const currentParentRequiredSex = computed(() => (parentPickerType.value === 'dam' ? 'female' : 'male'))
const parentCandidates = computed(() =>
  filterParentCandidates({
    animals: props.animals,
    currentAnimalId: form.id,
    species: form.species,
    requiredSex: currentParentRequiredSex.value,
    query: parentSearchTerm.value,
  }),
)

watch(
  () => [props.modelValue, props.animal],
  () => {
    if (props.modelValue) {
      loadForm()
    }
  },
  { immediate: true },
)

function defaultForm() {
  return {
    id: '',
    tag: '',
    name: '',
    species: '',
    sex: 'unknown',
    birthDate: '',
    status: 'active',
    damId: '',
    sireId: '',
    notes: '',
  }
}

function loadForm() {
  Object.assign(
    form,
    props.animal
      ? {
          id: props.animal.id,
          tag: props.animal.tag,
          name: props.animal.name,
          species: props.animal.species,
          sex: props.animal.sex ?? 'unknown',
          birthDate: props.animal.birthDate,
          status: props.animal.status,
          damId: props.animal.damId ?? '',
          sireId: props.animal.sireId ?? '',
          notes: props.animal.notes,
        }
      : defaultForm(),
  )

  parentSearchTerm.value = ''
}

function closeDialog() {
  emit('update:modelValue', false)
}

function openParentPicker(type) {
  parentPickerType.value = type
  parentSearchTerm.value = ''
  isParentPickerOpen.value = true
}

function selectParent(animal) {
  if (parentPickerType.value === 'dam') {
    form.damId = animal.id
  } else {
    form.sireId = animal.id
  }

  isParentPickerOpen.value = false
}

function clearParentSelection(type) {
  if (type === 'dam') {
    form.damId = ''
    return
  }

  form.sireId = ''
}

async function submitForm() {
  if (!form.tag.trim() && !form.name.trim()) {
    $q.notify({
      color: 'negative',
      message: 'Add at least a tag or a name before saving.',
      position: 'top',
    })
    return
  }

  if (form.damId && form.damId === form.sireId) {
    $q.notify({
      color: 'negative',
      message: 'Dam and sire should not point to the same animal.',
      position: 'top',
    })
    return
  }

  emit('submit', { ...form })
}

function animalDisplayName(animal) {
  return formatAnimalDisplayName(animal)
}

function parentLabel(animal, emptyLabel = 'Not linked') {
  if (!animal) {
    return emptyLabel
  }

  const primary = animalDisplayName(animal)
  const secondary = animal.species ? ` • ${animal.species}` : ''
  const sex = ` • ${sexLabel(animal.sex)}`

  return `${primary}${secondary}${sex}`
}

function sexLabel(sex) {
  return formatAnimalSex(sex)
}
</script>
