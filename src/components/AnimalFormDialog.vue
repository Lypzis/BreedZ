<template>
  <q-dialog v-model="isOpen">
    <q-card style="width: 100%; max-width: 640px">
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="text-overline text-weight-bold text-primary">{{ t('animalForm.overline') }}</div>
          <div class="text-h6 text-weight-bold">
            {{ mode === 'create' ? t('animalForm.addTitle') : t('animalForm.editTitle') }}
          </div>
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
          <q-input v-model="form.tag" outlined :label="t('animalForm.tag')" />
          <q-input
            v-model="form.name"
            outlined
            :label="t('animalForm.name')"
            :placeholder="t('animalForm.namePlaceholder')"
          />
          <q-select
            v-model="form.species"
            outlined
            clearable
            use-input
            fill-input
            hide-selected
            input-debounce="0"
            :label="t('animalForm.species')"
            :placeholder="t('animalForm.speciesPlaceholder')"
            :options="filteredSpeciesOptions"
            @filter="filterSpeciesOptions"
            @new-value="createSpeciesValue"
          />
          <q-select v-model="form.sex" outlined :label="t('animalForm.sex')" :options="sexOptions" emit-value map-options />
          <q-input v-model="form.birthDate" outlined type="date" :label="t('animalForm.birthDate')" />
          <q-select
            v-model="form.status"
            outlined
            :label="t('animalForm.status')"
            :options="statusOptions"
            emit-value
            map-options
          />
          <q-toggle
            v-model="form.isBreeder"
            color="info"
            checked-icon="bookmark"
            :label="t('animalForm.isBreeder')"
          />

          <q-input :model-value="selectedDamLabel" outlined readonly :label="t('animalForm.dam')">
            <template #append>
              <q-btn
                v-if="form.damId"
                flat
                round
                dense
                icon="close"
                color="grey-7"
                :aria-label="t('animalForm.clearDam')"
                :title="t('animalForm.clearDam')"
                @click="clearParentSelection('dam')"
              />
              <q-btn
                flat
                round
                dense
                icon="search"
                color="primary"
                :aria-label="t('animalForm.searchDam')"
                :title="t('animalForm.searchDam')"
                @click="openParentPicker('dam')"
              />
            </template>
          </q-input>

          <q-input :model-value="selectedSireLabel" outlined readonly :label="t('animalForm.sire')">
            <template #append>
              <q-btn
                v-if="form.sireId"
                flat
                round
                dense
                icon="close"
                color="grey-7"
                :aria-label="t('animalForm.clearSire')"
                :title="t('animalForm.clearSire')"
                @click="clearParentSelection('sire')"
              />
              <q-btn
                flat
                round
                dense
                icon="search"
                color="primary"
                :aria-label="t('animalForm.searchSire')"
                :title="t('animalForm.searchSire')"
                @click="openParentPicker('sire')"
              />
            </template>
          </q-input>

          <q-input v-model="form.notes" outlined autogrow type="textarea" :label="t('animalForm.notes')" />

          <div class="row justify-end q-gutter-sm">
            <q-btn flat color="grey-7" :label="t('common.cancel')" @click="closeDialog" />
            <q-btn
              unelevated
              color="primary"
              :label="mode === 'create' ? t('common.saveAnimal') : t('common.updateAnimal')"
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
            <div class="text-overline text-weight-bold text-primary">{{ t('animalForm.lineageOverline') }}</div>
            <div class="text-h6 text-weight-bold">{{ currentParentDialogTitle }}</div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            :aria-label="t('common.closeDialog')"
            :title="t('common.closeDialog')"
            @click="isParentPickerOpen = false"
          />
        </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          v-model="parentSearchTerm"
          outlined
          dense
          clearable
          :label="t('animalForm.searchParent')"
          :placeholder="t('animalPicker.searchPlaceholder')"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

          <q-banner rounded class="bg-grey-1 text-grey-8 q-mt-md">
            <template #avatar>
              <q-icon name="filter_alt" color="primary" />
            </template>
            {{ parentCandidateBanner }}
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
              {{ candidate.species || t('common.speciesNotSet') }} • {{ sexLabel(candidate.sex) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

        <q-card-section v-else class="q-pt-none">
          <q-banner rounded class="bg-grey-1 text-grey-8">
            <template #avatar>
              <q-icon name="search_off" color="primary" />
            </template>
            {{ t('animalForm.noMatchingParents') }}
          </q-banner>
        </q-card-section>
      </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18nText } from 'src/i18n'
import { formatAnimalDisplayName } from 'src/utils/animal-display'
import { filterParentCandidates, formatAnimalSex } from 'src/utils/parent-candidates'
import { normalizeSpeciesLabel } from 'src/utils/species'

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
const { t } = useI18nText()

const isParentPickerOpen = ref(false)
const parentPickerType = ref('dam')
const parentSearchTerm = ref('')
const filteredSpeciesOptions = ref([])

const statusOptions = computed(() => [
  { label: t('common.status.active'), value: 'active' },
  { label: t('common.status.sold'), value: 'sold' },
  { label: t('common.status.dead'), value: 'dead' },
])
const sexOptions = computed(() => [
  { label: t('common.sex.female'), value: 'female' },
  { label: t('common.sex.male'), value: 'male' },
  { label: t('common.sex.unknown'), value: 'unknown' },
])
const form = reactive(defaultForm())

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const selectedDamLabel = computed(() =>
  parentLabel(props.animals.find((animal) => animal.id === form.damId), t('animalForm.noDamLinked')),
)
const selectedSireLabel = computed(() =>
  parentLabel(props.animals.find((animal) => animal.id === form.sireId), t('animalForm.noSireLinked')),
)
const currentParentRoleLabel = computed(() => (parentPickerType.value === 'dam' ? t('animalForm.dam') : t('animalForm.sire')))
const currentParentDialogTitle = computed(() =>
  parentPickerType.value === 'dam' ? t('animalForm.pickDam') : t('animalForm.pickSire'),
)
const currentParentRequiredSex = computed(() => (parentPickerType.value === 'dam' ? 'female' : 'male'))
const speciesOptions = computed(() => {
  const uniqueSpecies = new Set(
    props.animals
      .map((animal) => normalizeSpeciesLabel(animal.species))
      .filter(Boolean),
  )

  return [...uniqueSpecies].sort((left, right) => left.localeCompare(right))
})
const parentCandidateBanner = computed(() => {
  const speciesPart = form.species
    ? t('animalForm.showingCandidatesSpeciesPart', { species: form.species })
    : ''

  return t('animalForm.showingCandidates', {
    role: currentParentRoleLabel.value.toLowerCase(),
    speciesPart,
  })
})
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

watch(
  speciesOptions,
  (options) => {
    filteredSpeciesOptions.value = options
  },
  { immediate: true },
)

function defaultForm() {
  return {
    id: '',
    tag: '',
    name: '',
    species: '',
    isBreeder: false,
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
          isBreeder: props.animal.isBreeder === true,
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
  filteredSpeciesOptions.value = speciesOptions.value
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

function filterSpeciesOptions(value, update) {
  update(() => {
    const normalizedQuery = String(value || '').trim().toLowerCase()

    filteredSpeciesOptions.value = speciesOptions.value.filter((species) =>
      normalizedQuery ? species.toLowerCase().includes(normalizedQuery) : true,
    )
  })
}

function createSpeciesValue(value, done) {
  done(normalizeSpeciesLabel(value))
}

async function submitForm() {
  if (!form.tag.trim() && !form.name.trim()) {
    $q.notify({
      color: 'negative',
      message: t('animalForm.requireTagOrName'),
      position: 'top',
    })
    return
  }

  if (form.damId && form.damId === form.sireId) {
    $q.notify({
      color: 'negative',
      message: t('animalForm.sameParentError'),
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
