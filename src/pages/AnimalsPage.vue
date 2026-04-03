<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <q-card flat>
          <q-card-section class="row items-start justify-between q-col-gutter-md">
            <div class="col-12 col-md">
              <div class="text-overline text-weight-bold text-primary">{{ t('animals.overline') }}</div>
              <div class="text-h4 text-weight-bold q-mt-sm q-mb-sm">{{ t('animals.title') }}</div>
              <div class="text-body1 text-grey-7">
                {{ t('animals.description') }}
              </div>
            </div>

            <div class="col-12 col-md-auto">
              <q-btn unelevated color="primary" icon="add" :label="t('common.addAnimal')" @click="openCreateDialog" />
            </div>
          </q-card-section>

          <q-card-section class="row q-col-gutter-sm q-pt-none">
            <div class="col-12 col-sm">
              <q-input
                v-model="searchTerm"
                outlined
                dense
                clearable
                :label="t('animals.searchLabel')"
                :placeholder="t('animals.searchPlaceholder')"
              >
                <template #prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-4">
              <q-select
                v-model="selectedSpecies"
                outlined
                dense
                clearable
                :label="t('animals.speciesFilter')"
                :options="speciesOptions"
              />
            </div>
            <div class="col-12 col-sm-4">
              <q-select
                v-model="selectedStatus"
                outlined
                dense
                clearable
                :label="t('animals.statusFilter')"
                :options="statusOptions"
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-sm-auto">
              <q-chip square color="green-1" text-color="primary" icon="pets">
                {{ t('animals.totalChip', { count: animals.length }) }}
              </q-chip>
              <q-chip square color="green-1" text-color="primary" icon="task_alt">
                {{ t('animals.activeChip', { count: activeAnimals.length }) }}
              </q-chip>
            </div>
          </q-card-section>

          <q-card-section class="row items-center justify-between q-col-gutter-sm q-pt-none">
            <div class="col-12 col-md-auto">
              <q-btn-toggle
                v-model="listMode"
                unelevated
                no-caps
                color="green-1"
                text-color="primary"
                toggle-color="primary"
                toggle-text-color="white"
                :options="listModeOptions"
              />
            </div>

            <div class="col-12 col-md-auto">
              <div class="row items-center q-col-gutter-sm">
                <div v-if="listMode === 'paged'" class="col-auto">
                  <q-select
                    v-model="pageSize"
                    dense
                    outlined
                    emit-value
                    map-options
                    :label="t('common.perPage')"
                    :options="pageSizeOptions"
                  />
                </div>
                <div class="col-auto text-caption text-grey-7">
                  {{ t('animals.showingCount', { shown: displayedAnimalsCount, total: filteredAnimals.length }) }}
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-section v-if="errorMessage" class="q-pt-none">
            <q-banner rounded class="bg-red-1 text-negative">
              {{ errorMessage }}
            </q-banner>
          </q-card-section>

          <q-card-section v-if="isLoading" class="q-pt-none">
            <div class="row justify-center q-py-xl">
              <q-spinner color="primary" size="40px" />
            </div>
          </q-card-section>

          <q-card-section v-else-if="filteredAnimals.length === 0" class="q-pt-none">
            <q-banner rounded class="bg-grey-1 text-grey-8">
              <template #avatar>
                <q-icon name="pets" color="primary" />
              </template>
              {{ emptyStateMessage }}
            </q-banner>
          </q-card-section>

          <q-list v-else-if="listMode === 'paged'" separator>
            <q-item v-for="animal in paginatedAnimals" :key="animal.id">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" icon="pets" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium">
                    {{ animalDisplayName(animal) }}
                </q-item-label>
                <q-item-label caption>
                  {{ animal.species || t('common.speciesNotSet') }} • {{ sexLabel(animal.sex) }}
                  <span v-if="animal.birthDate"> • {{ t('animals.born', { date: formatDate(animal.birthDate) }) }}</span>
                </q-item-label>
                <q-item-label caption>
                  {{ t('animals.updated', { date: formatDateTime(animal.updatedAt) }) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side top>
                <div class="column items-end q-gutter-sm">
                  <q-chip square dense :color="statusColor(animal.status)" text-color="white">
                    {{ statusLabel(animal.status) }}
                  </q-chip>
                  <div class="row q-gutter-xs">
                    <q-btn
                      flat
                      round
                      dense
                      color="primary"
                      icon="visibility"
                      :aria-label="t('animals.viewAnimal')"
                      :title="t('animals.viewAnimal')"
                      :to="`/app/animals/${animal.id}`"
                    />
                    <q-btn
                      flat
                      round
                      dense
                      color="primary"
                      icon="edit"
                      :aria-label="t('animals.editAnimal')"
                      :title="t('animals.editAnimal')"
                      @click="openEditDialog(animal)"
                    />
                    <q-btn
                      flat
                      round
                      dense
                      color="negative"
                      icon="delete"
                      :aria-label="t('animals.deleteAnimal')"
                      :title="t('animals.deleteAnimal')"
                      @click="confirmDelete(animal)"
                    />
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <q-virtual-scroll
            v-else
            :items="filteredAnimals"
            :virtual-scroll-item-size="92"
            style="max-height: 70vh"
          >
            <template #default="{ item: animal, index }">
              <div :key="animal.id">
                <q-item>
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white" icon="pets" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-medium">
                      {{ animalDisplayName(animal) }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ animal.species || t('common.speciesNotSet') }} • {{ sexLabel(animal.sex) }}
                      <span v-if="animal.birthDate"> • {{ t('animals.born', { date: formatDate(animal.birthDate) }) }}</span>
                    </q-item-label>
                    <q-item-label caption>
                      {{ t('animals.updated', { date: formatDateTime(animal.updatedAt) }) }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side top>
                    <div class="column items-end q-gutter-sm">
                      <q-chip square dense :color="statusColor(animal.status)" text-color="white">
                        {{ statusLabel(animal.status) }}
                      </q-chip>
                      <div class="row q-gutter-xs">
                        <q-btn
                          flat
                          round
                          dense
                          color="primary"
                          icon="visibility"
                          :aria-label="t('animals.viewAnimal')"
                          :title="t('animals.viewAnimal')"
                          :to="`/app/animals/${animal.id}`"
                        />
                        <q-btn
                          flat
                          round
                          dense
                          color="primary"
                          icon="edit"
                          :aria-label="t('animals.editAnimal')"
                          :title="t('animals.editAnimal')"
                          @click="openEditDialog(animal)"
                        />
                        <q-btn
                          flat
                          round
                          dense
                          color="negative"
                          icon="delete"
                          :aria-label="t('animals.deleteAnimal')"
                          :title="t('animals.deleteAnimal')"
                          @click="confirmDelete(animal)"
                        />
                      </div>
                    </div>
                  </q-item-section>
                </q-item>
                <q-separator v-if="index < filteredAnimals.length - 1" />
              </div>
            </template>
          </q-virtual-scroll>

          <q-card-section v-if="listMode === 'paged' && pageCount > 1" class="row justify-center q-pt-md">
            <q-pagination
              v-model="currentPage"
              color="primary"
              :max="pageCount"
              :max-pages="6"
              boundary-links
              direction-links
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <AnimalFormDialog
      v-model="isFormDialogOpen"
      :animal="selectedAnimal"
      :animals="animals"
      :mode="formMode"
      @submit="submitForm"
    />
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import AnimalFormDialog from 'src/components/AnimalFormDialog.vue'
import { useI18nText } from 'src/i18n'
import { useAnimalsStore } from 'src/stores/animals-store'
import { formatAnimalDisplayName } from 'src/utils/animal-display'
import { formatDisplayDate, formatDisplayDateTime } from 'src/utils/dates'
import { filterAnimalsList } from 'src/utils/list-filters'
import { formatAnimalSex } from 'src/utils/parent-candidates'
import { normalizeSpeciesLabel } from 'src/utils/species'

const $q = useQuasar()
const { t } = useI18nText()
const animalsStore = useAnimalsStore()
const { activeAnimals, animals, errorMessage, isLoading } = storeToRefs(animalsStore)

const searchTerm = ref('')
const selectedSpecies = ref('')
const selectedStatus = ref('')
const listMode = ref('paged')
const currentPage = ref(1)
const pageSize = ref(10)
const isFormDialogOpen = ref(false)
const formMode = ref('create')
const selectedAnimal = ref(null)
const pageSizeOptions = [
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
]
const statusOptions = computed(() => [
  { label: t('common.status.active'), value: 'active' },
  { label: t('common.status.sold'), value: 'sold' },
  { label: t('common.status.dead'), value: 'dead' },
])
const listModeOptions = computed(() => [
  { label: t('common.pages'), value: 'paged' },
  { label: t('common.viewAll'), value: 'all' },
])
const speciesOptions = computed(() =>
  [...new Set(animals.value.map((animal) => normalizeSpeciesLabel(animal.species)).filter(Boolean))].sort(),
)

const filteredAnimals = computed(() => {
  return filterAnimalsList(animals.value, {
    searchTerm: searchTerm.value,
    status: selectedStatus.value,
    species: selectedSpecies.value,
  })
})
const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredAnimals.value.length / pageSize.value)),
)
const paginatedAnimals = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredAnimals.value.slice(start, start + pageSize.value)
})
const displayedAnimalsCount = computed(() =>
  listMode.value === 'paged' ? paginatedAnimals.value.length : filteredAnimals.value.length,
)

const emptyStateMessage = computed(() =>
  searchTerm.value || selectedStatus.value || selectedSpecies.value
    ? t('animals.emptyFiltered')
    : t('animals.emptyInitial'),
)

function openCreateDialog() {
  formMode.value = 'create'
  selectedAnimal.value = null
  isFormDialogOpen.value = true
}

function openEditDialog(animal) {
  formMode.value = 'edit'
  selectedAnimal.value = animal
  isFormDialogOpen.value = true
}

async function submitForm(payload) {
  try {
    if (formMode.value === 'create') {
      await animalsStore.addAnimal(payload)
      $q.notify({ color: 'positive', message: t('animals.animalAdded'), position: 'top' })
    } else {
      await animalsStore.editAnimal(payload.id, payload)
      $q.notify({ color: 'positive', message: t('animals.animalUpdated'), position: 'top' })
    }

    isFormDialogOpen.value = false
    selectedAnimal.value = null
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: error instanceof Error ? error.message : t('animals.animalSaveFailed'),
      position: 'top',
    })
  }
}

function confirmDelete(animal) {
  $q.dialog({
    title: t('animals.deleteTitle'),
    message: t('animals.deleteMessage', { animal: animalDisplayName(animal) }),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await animalsStore.removeAnimal(animal.id)
      $q.notify({ color: 'positive', message: t('animals.animalRemoved'), position: 'top' })
    } catch (error) {
      $q.notify({
        color: 'negative',
        message: error instanceof Error ? error.message : t('animals.animalDeleteFailed'),
        position: 'top',
      })
    }
  })
}

function animalDisplayName(animal) {
  return formatAnimalDisplayName(animal)
}

function sexLabel(sex) {
  return formatAnimalSex(sex)
}

function statusLabel(status) {
  return t(`common.status.${status}`)
}

function formatDate(value) {
  if (!value) {
    return ''
  }

  return formatDisplayDate(value)
}

function formatDateTime(value) {
  if (!value) {
    return t('common.justNow')
  }

  return formatDisplayDateTime(value)
}

function statusColor(status) {
  if (status === 'sold') {
    return 'accent'
  }

  if (status === 'dead') {
    return 'negative'
  }

  return 'primary'
}

watch([searchTerm, selectedStatus, selectedSpecies, listMode, pageSize], () => {
  currentPage.value = 1
})

watch(filteredAnimals, () => {
  if (currentPage.value > pageCount.value) {
    currentPage.value = pageCount.value
  }
})

onMounted(async () => {
  if (!animalsStore.isLoaded) {
    try {
      await animalsStore.loadAnimals()
    } catch {
      // error state is already handled in the store
    }
  }
})
</script>
