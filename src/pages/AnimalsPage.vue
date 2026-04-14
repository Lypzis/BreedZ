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
                v-model="selectedBreed"
                outlined
                dense
                clearable
                :label="t('animals.breedFilter')"
                :options="breedOptions"
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
              <q-toggle
                v-model="breedersOnly"
                color="info"
                checked-icon="bookmark"
                :label="t('animals.breedersOnly')"
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

          <PagedListControls
            :current-page="currentPage"
            :list-mode="listMode"
            :list-mode-options="listModeOptions"
            :page-count="pageCount"
            :page-size="pageSize"
            :page-size-options="pageSizeOptions"
            :per-page-label="t('common.perPage')"
            :showing-text="t('animals.showingCount', { shown: displayedAnimalsCount, total: filteredAnimals.length })"
            :show-pagination="false"
            @update:current-page="currentPage = $event"
            @update:list-mode="listMode = $event"
            @update:page-size="pageSize = $event"
          />

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
                  {{ animalSummary(animal) }} • {{ sexLabel(animal.sex) }}
                  <span v-if="animal.birthDate"> • {{ ageSummary(animal.birthDate) }}</span>
                </q-item-label>
              </q-item-section>

              <q-item-section side top>
                <div class="column items-end q-gutter-sm">
                  <q-chip
                    v-if="animal.isBreeder"
                    square
                    dense
                    color="info"
                    text-color="white"
                  >
                    {{ t('common.reproducer') }}
                  </q-chip>
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
                      :to="`/animals/${animal.id}`"
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
                      {{ animalSummary(animal) }} • {{ sexLabel(animal.sex) }}
                      <span v-if="animal.birthDate"> • {{ ageSummary(animal.birthDate) }}</span>
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side top>
                    <div class="column items-end q-gutter-sm">
                      <q-chip
                        v-if="animal.isBreeder"
                        square
                        dense
                        color="info"
                        text-color="white"
                      >
                        {{ t('common.reproducer') }}
                      </q-chip>
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
                          :to="`/animals/${animal.id}`"
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

          <PagedListControls
            :current-page="currentPage"
            :list-mode="listMode"
            :list-mode-options="listModeOptions"
            :page-count="pageCount"
            :page-size="pageSize"
            :page-size-options="pageSizeOptions"
            :per-page-label="t('common.perPage')"
            :showing-text="t('animals.showingCount', { shown: displayedAnimalsCount, total: filteredAnimals.length })"
            :show-header="false"
            @update:current-page="currentPage = $event"
            @update:list-mode="listMode = $event"
            @update:page-size="pageSize = $event"
          />

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
import { useRouter } from 'vue-router'
import AnimalFormDialog from 'src/components/AnimalFormDialog.vue'
import PagedListControls from 'src/components/PagedListControls.vue'
import { useI18nText } from 'src/i18n'
import { useAuthStore } from 'src/stores/auth-store'
import { useAnimalsStore } from 'src/stores/animals-store'
import { formatAnimalDisplayName, formatAnimalSpeciesBreed } from 'src/utils/animal-display'
import { formatAgeLabel, formatDisplayDate } from 'src/utils/dates'
import { filterAnimalsList } from 'src/utils/list-filters'
import { formatAnimalSex } from 'src/utils/parent-candidates'
import {
  ANIMAL_LIMIT_REACHED_ERROR,
  canCreateAnimal,
  getAnimalLimitReminder,
} from 'src/utils/premium-limits'
import { normalizeBreedLabel, normalizeSpeciesLabel } from 'src/utils/species'

const $q = useQuasar()
const { t } = useI18nText()
const router = useRouter()
const authStore = useAuthStore()
const animalsStore = useAnimalsStore()
const { isPremium } = storeToRefs(authStore)
const { activeAnimals, animals, errorMessage, isLoading } = storeToRefs(animalsStore)

const searchTerm = ref('')
const selectedSpecies = ref('')
const selectedBreed = ref('')
const selectedStatus = ref('')
const breedersOnly = ref(false)
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
const breedOptions = computed(() =>
  [...new Set(animals.value.map((animal) => normalizeBreedLabel(animal.breed)).filter(Boolean))].sort(),
)

const filteredAnimals = computed(() => {
  return filterAnimalsList(animals.value, {
    searchTerm: searchTerm.value,
    status: selectedStatus.value,
    species: selectedSpecies.value,
    breed: selectedBreed.value,
    breedersOnly: breedersOnly.value,
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
  searchTerm.value || selectedStatus.value || selectedSpecies.value || selectedBreed.value || breedersOnly.value
    ? t('animals.emptyFiltered')
    : t('animals.emptyInitial'),
)

function openCreateDialog() {
  if (!canCreateAnimal(animals.value.length, { isPremium: isPremium.value })) {
    notifyAnimalLimitBlocked()
    return
  }

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
      if (!canCreateAnimal(animals.value.length, { isPremium: isPremium.value })) {
        notifyAnimalLimitBlocked()
        return
      }

      await animalsStore.addAnimal(payload, { isPremium: isPremium.value })
      $q.notify({ color: 'positive', message: t('animals.animalAdded'), position: 'top' })
      notifyAnimalLimitReminder(animals.value.length)
    } else {
      await animalsStore.editAnimal(payload.id, payload)
      $q.notify({ color: 'positive', message: t('animals.animalUpdated'), position: 'top' })
    }

    isFormDialogOpen.value = false
    selectedAnimal.value = null
  } catch (error) {
    if (error instanceof Error && error.message === ANIMAL_LIMIT_REACHED_ERROR) {
      notifyAnimalLimitBlocked()
      return
    }

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

function notifyAnimalLimitReminder(totalCount) {
  const reminder = getAnimalLimitReminder(totalCount, { isPremium: isPremium.value })

  if (!reminder) {
    return
  }

  $q.notify({
    group: false,
    timeout: 7000,
    color: reminder.color,
    textColor: 'white',
    icon: reminder.icon,
    message: t(reminder.messageKey),
    position: 'top',
  })
}

function notifyAnimalLimitBlocked() {
  $q.dialog({
    title: t('animals.premiumBlockedTitle'),
    message: t('animals.premiumBlocked'),
    ok: {
      label: t('animals.goToAccount'),
      color: 'primary',
      unelevated: true,
    },
    cancel: {
      label: t('common.close'),
      flat: true,
      color: 'grey-7',
    },
    persistent: true,
  }).onOk(() => {
    void router.push('/account')
  })
}

function animalDisplayName(animal) {
  return formatAnimalDisplayName(animal)
}

function animalSummary(animal) {
  return formatAnimalSpeciesBreed(animal)
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

function ageSummary(value) {
  const ageLabel = formatAgeLabel(value)

  return ageLabel || formatDate(value)
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

watch([searchTerm, selectedStatus, selectedSpecies, selectedBreed, breedersOnly, listMode, pageSize], () => {
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
