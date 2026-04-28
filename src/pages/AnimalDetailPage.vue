<template>
  <AppPageShell>
    <div class="q-mb-md">
      <div class="row items-center justify-between q-col-gutter-sm">
        <div class="col-auto">
          <q-btn flat color="primary" icon="arrow_back" :label="backLinkLabel" :to="backLinkTarget" />
        </div>
      </div>
    </div>

    <q-card flat>
      <q-card-section v-if="isBusy" class="q-py-xl">
        <div class="row justify-center">
          <q-spinner color="primary" size="40px" />
        </div>
      </q-card-section>

      <q-card-section v-else-if="!animal">
        <q-banner rounded class="bg-grey-1 text-grey-8">
          <template #avatar>
            <q-icon name="pets" color="primary" />
          </template>
          {{ t('animalDetail.notFound') }}
        </q-banner>
      </q-card-section>

      <template v-else>
        <DetailHeader :title="animalDisplayName(animal)" avatar-color="primary" avatar-icon="pets">
          <template #badges>
            <q-chip square dense :color="statusColor(animal.status)" text-color="white" icon="task_alt">
              {{ statusLabel(animal.status) }}
            </q-chip>
            <q-chip v-if="animal.isBreeder" square dense color="info" text-color="white" icon="bookmark">
              {{ t('common.reproducer') }}
            </q-chip>
          </template>

          <template #chips>
            <div class="col-auto">
              <q-chip square color="green-1" text-color="primary" icon="pets">
                {{ animal.species || t('common.speciesNotSet') }}
              </q-chip>
            </div>
            <div class="col-auto" v-if="animal.breed">
              <q-chip square color="green-1" text-color="primary" icon="sell">
                {{ animal.breed }}
              </q-chip>
            </div>
            <div class="col-auto">
              <q-chip square color="green-1" text-color="primary" icon="wc">
                {{ sexLabel(animal.sex) }}
              </q-chip>
            </div>
            <div class="col-auto" v-if="animal.weight">
              <q-chip square color="green-1" text-color="primary" icon="scale">
                {{ weightChipLabel(animal.weight) }}
              </q-chip>
            </div>
            <div class="col-auto">
              <q-chip square color="green-1" text-color="primary" icon="event" class="detail-wrap-chip">
                {{ birthChipLabel(animal.birthDate) }}
              </q-chip>
            </div>
            <div class="col-auto">
              <q-chip square color="green-1" text-color="primary" icon="calendar_month" class="detail-wrap-chip">
                {{ ageSummary(animal.birthDate) }}
              </q-chip>
            </div>
            <div class="col-auto" v-if="animalEvents.length">
              <q-chip square color="green-1" text-color="primary" icon="timeline">
                {{ t('animalDetail.eventsChip', { count: animalEvents.length }) }}
              </q-chip>
            </div>
            <div class="col-auto" v-if="offspringAnimals.length">
              <q-chip square color="green-1" text-color="primary" icon="group">
                {{ t('animalDetail.offspringChip', { count: offspringAnimals.length }) }}
              </q-chip>
            </div>
          </template>

          <template #actions>
            <q-btn unelevated color="primary" icon="add" :label="t('common.addEvent')"
              :disable="animal.status !== 'active'" @click="openEventDialog" />
            <q-btn outline color="primary" icon="edit" :label="t('common.editAnimal')" @click="openEditDialog" />
          </template>
        </DetailHeader>

        <q-card-section>
          <div class="text-overline text-weight-bold text-primary">{{ t('animalDetail.lineageOverline') }}</div>
          <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">{{ t('animalDetail.lineageTitle') }}</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-banner rounded class="bg-grey-1 text-grey-8 parent-record-banner cursor-pointer" @click="openParentPickerDialog('dam')">
                <div class="row items-start no-wrap q-col-gutter-sm">
                  <div class="col-auto">
                    <q-icon name="female" color="primary" size="md" />
                  </div>
                  <div class="col">
                    <div class="text-subtitle2 text-weight-bold">{{ t('animalDetail.damTitle') }}</div>
                    <div v-if="damAnimal" class="q-mt-xs">
                      {{ animalDisplayName(damAnimal) }}
                    </div>
                    <div v-else class="q-mt-xs">{{ t('animalDetail.notLinkedYet') }}</div>
                  </div>
                  <div v-if="damAnimal" class="col-auto">
                    <q-btn flat round dense color="primary" icon="visibility" :aria-label="t('animalDetail.openParent')"
                      :title="t('animalDetail.openParent')" :to="`/animals/${damAnimal.id}`" @click.stop />
                  </div>
                </div>
              </q-banner>
            </div>

            <div class="col-12 col-md-6">
              <q-banner rounded class="bg-grey-1 text-grey-8 parent-record-banner cursor-pointer" @click="openParentPickerDialog('sire')">
                <div class="row items-start no-wrap q-col-gutter-sm">
                  <div class="col-auto">
                    <q-icon name="male" color="primary" size="md" />
                  </div>
                  <div class="col">
                    <div class="text-subtitle2 text-weight-bold">{{ t('animalDetail.sireTitle') }}</div>
                    <div v-if="sireAnimal" class="q-mt-xs">
                      {{ animalDisplayName(sireAnimal) }}
                    </div>
                    <div v-else class="q-mt-xs">{{ t('animalDetail.notLinkedYet') }}</div>
                  </div>
                  <div v-if="sireAnimal" class="col-auto">
                    <q-btn flat round dense color="primary" icon="visibility" :aria-label="t('animalDetail.openParent')"
                      :title="t('animalDetail.openParent')" :to="`/animals/${sireAnimal.id}`" @click.stop />
                  </div>
                </div>
              </q-banner>
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-overline text-weight-bold text-primary">{{ t('animalDetail.breedingsOverline') }}</div>
          <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">{{ t('animalDetail.breedingsTitle') }}</div>

          <q-banner v-if="breedingGroups.length === 0" rounded class="bg-grey-1 text-grey-8">
            <template #avatar>
              <q-icon name="favorite" color="primary" />
            </template>
            {{ t('animalDetail.breedingsEmpty') }}
          </q-banner>

          <PagedListControls v-else :current-page="breedingGroupPage" :list-mode="breedingGroupListMode"
            :list-mode-options="listModeOptions" :page-count="breedingGroupPageCount" :page-size="breedingGroupPageSize"
            :page-size-options="pageSizeOptions" :per-page-label="t('common.perPage')"
            :showing-text="t('animalDetail.showingBreedings', { shown: displayedBreedingGroupCount, total: breedingGroups.length })"
            :show-pagination="false" @update:current-page="breedingGroupPage = $event"
            @update:list-mode="breedingGroupListMode = $event" @update:page-size="breedingGroupPageSize = $event" />

          <div v-if="breedingGroups.length > 0" class="column q-gutter-md">
            <q-banner v-for="group in displayedBreedingGroups" :key="group.partnerAnimalId" rounded
              class="bg-grey-1 text-grey-8">
              <div class="row items-start no-wrap q-col-gutter-sm">
                <div class="col-auto">
                  <q-avatar color="primary" text-color="white" icon="favorite" />
                </div>

                <div class="col">
                  <div class="text-subtitle1 text-weight-medium">
                    {{ animalDisplayName(group.partnerAnimal) }}
                  </div>
                  <div class="text-body2 text-grey-7">
                    {{ sexLabel(group.partnerAnimal?.sex) }} • {{ animalSpeciesBreed(group.partnerAnimal) }}
                  </div>
                  <div class="text-body2 text-grey-7">
                    {{ breedingCountLabel(group.count) }}
                  </div>
                  <div class="text-body2 text-grey-7">
                    {{ t('animalDetail.lastBreeding', { date: formatDate(group.latestDate) }) }}
                  </div>
                </div>

                <div v-if="group.partnerAnimal" class="col-auto">
                  <q-btn flat round dense color="primary" icon="visibility" :aria-label="t('common.view')"
                    :title="t('common.view')" :to="`/animals/${group.partnerAnimal.id}`" />
                </div>
              </div>

              <q-card v-if="group.offspringAnimals.length > 0" flat bordered class="bg-white q-mt-md">
                <q-card-section class="q-pb-sm">
                  <div class="text-caption text-weight-medium text-primary">
                    {{ t('animalDetail.breedingOffspringTitle') }}
                  </div>
                </q-card-section>

                <q-list separator>
                  <q-item v-for="child in previewBreedingOffspring(group)" :key="child.id">
                    <q-item-section avatar>
                      <q-avatar color="secondary" text-color="white" icon="child_friendly" />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label class="text-weight-medium">
                        {{ animalDisplayName(child) }}
                      </q-item-label>
                      <q-item-label caption>
                        {{ animalSpeciesBreed(child) }} • {{ sexLabel(child.sex) }}
                        <span v-if="child.birthDate"> • {{ ageSummary(child.birthDate) }}</span>
                      </q-item-label>
                    </q-item-section>

                    <q-item-section side>
                      <q-btn flat round dense color="primary" icon="visibility" :aria-label="t('common.view')"
                        :title="t('common.view')" :to="`/animals/${child.id}`" />
                    </q-item-section>
                  </q-item>
                </q-list>

                <q-card-actions v-if="group.offspringAnimals.length > breedingOffspringPreviewSize" align="right">
                  <q-btn flat color="primary"
                    :label="t('animalDetail.showMoreBreedingOffspring', { count: group.offspringAnimals.length })"
                    @click="openBreedingOffspringDialog(group)" />
                </q-card-actions>
              </q-card>
            </q-banner>
          </div>

          <PagedListControls v-if="breedingGroups.length > 0" :current-page="breedingGroupPage"
            :list-mode="breedingGroupListMode" :list-mode-options="listModeOptions" :page-count="breedingGroupPageCount"
            :page-size="breedingGroupPageSize" :page-size-options="pageSizeOptions"
            :per-page-label="t('common.perPage')"
            :showing-text="t('animalDetail.showingBreedings', { shown: displayedBreedingGroupCount, total: breedingGroups.length })"
            :show-header="false" @update:current-page="breedingGroupPage = $event"
            @update:list-mode="breedingGroupListMode = $event" @update:page-size="breedingGroupPageSize = $event" />
        </q-card-section>

        <q-card-section v-if="animal.notes" class="q-pt-none">
          <q-banner rounded class="bg-grey-1 text-grey-8">
            <template #avatar>
              <q-icon name="notes" color="primary" />
            </template>
            {{ animal.notes }}
          </q-banner>
        </q-card-section>

        <q-card-section v-if="loadErrorMessage" class="q-pt-none">
          <q-banner rounded class="bg-red-1 text-negative">
            {{ loadErrorMessage }}
          </q-banner>
        </q-card-section>

        <q-card-section class="q-pb-none">
          <div class="text-overline text-weight-bold text-accent">{{ t('animalDetail.timelineSectionOverline') }}</div>
          <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">{{ t('animalDetail.timelineSectionTitle') }}</div>
        </q-card-section>

        <q-card-section v-if="animalEvents.length === 0" class="q-pt-none">
          <q-banner rounded class="bg-grey-1 text-grey-8">
            <template #avatar>
              <q-icon name="event_busy" color="accent" />
            </template>
            {{ t('animalDetail.timelineEmpty') }}
          </q-banner>
        </q-card-section>

        <PagedListControls v-if="animalEvents.length > 0" :current-page="timelinePage" :list-mode="timelineListMode"
          :list-mode-options="listModeOptions" :page-count="timelinePageCount" :page-size="timelinePageSize"
          :page-size-options="pageSizeOptions" :per-page-label="t('common.perPage')"
          :showing-text="t('events.showingCount', { shown: displayedTimelineEventCount, total: animalEvents.length })"
          :show-pagination="false" @update:current-page="timelinePage = $event"
          @update:list-mode="timelineListMode = $event" @update:page-size="timelinePageSize = $event" />

        <q-list v-if="animalEvents.length > 0" separator>
          <EventListItem v-for="event in displayedTimelineEvents" :key="event.id" :event="event"
            :animal-resolver="animalById" :detail-target="eventDetailTarget(event)" title-mode="type"
            :show-animal-meta="false" show-affected-animals :max-animal-names="3" @open="openEventDetail">
            <template #actions="{ event: itemEvent }">
              <q-btn flat round dense color="primary" icon="edit" :aria-label="t('animalDetail.editEvent')"
                :title="t('animalDetail.editEvent')" @click.stop="openEditEventDialog(itemEvent)" />
              <q-btn flat round dense color="negative" icon="delete" :aria-label="t('animalDetail.deleteEvent')"
                :title="t('animalDetail.deleteEvent')" @click.stop="confirmDeleteEvent(itemEvent)" />
            </template>
          </EventListItem>
        </q-list>

        <PagedListControls v-if="animalEvents.length > 0" :current-page="timelinePage" :list-mode="timelineListMode"
          :list-mode-options="listModeOptions" :page-count="timelinePageCount" :page-size="timelinePageSize"
          :page-size-options="pageSizeOptions" :per-page-label="t('common.perPage')"
          :showing-text="t('events.showingCount', { shown: displayedTimelineEventCount, total: animalEvents.length })"
          :show-header="false" @update:current-page="timelinePage = $event"
          @update:list-mode="timelineListMode = $event" @update:page-size="timelinePageSize = $event" />
      </template>
    </q-card>
    <EventFormDialog v-model="isEventDialogOpen" :animals="animals" :event="selectedEvent" :fixed-animal-id="animalId"
      :mode="eventFormMode" :overline="t('animalDetail.eventDialogOverline')" :title="eventDialogTitle"
      @purchase-selected="openPurchaseDialog" @submit="submitEvent" />
    <PurchaseEventDialog v-model="isPurchaseDialogOpen" :animals="animals" :current-animal-count="animals.length"
      :initial-animal-ids="initialPurchaseAnimalIds" :is-premium="isPremium" @submit="submitPurchaseEvent" />

    <q-dialog v-model="isBreedingOffspringDialogOpen">
      <q-card style="width: 100%; max-width: 720px">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-overline text-weight-bold text-primary">{{ t('animalDetail.breedingsOverline') }}</div>
            <div class="text-h6 text-weight-bold">{{ breedingOffspringDialogTitle }}</div>
          </div>
          <q-btn flat round dense icon="close" :aria-label="t('common.closeDialog')" :title="t('common.closeDialog')"
            @click="closeBreedingOffspringDialog" />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <PagedListControls v-if="selectedBreedingGroup" :current-page="breedingOffspringPage"
            :list-mode="breedingOffspringListMode" :list-mode-options="listModeOptions"
            :page-count="breedingOffspringPageCount" :page-size="breedingOffspringPageSize"
            :page-size-options="pageSizeOptions" :per-page-label="t('common.perPage')"
            :showing-text="t('animalDetail.showingBreedingOffspring', { shown: displayedBreedingOffspringCount, total: selectedBreedingGroup.offspringAnimals.length })"
            :show-pagination="false" @update:current-page="breedingOffspringPage = $event"
            @update:list-mode="breedingOffspringListMode = $event"
            @update:page-size="breedingOffspringPageSize = $event" />

          <q-list v-if="selectedBreedingGroup" separator>
            <q-item v-for="child in displayedBreedingOffspringAnimals" :key="child.id">
              <q-item-section avatar>
                <q-avatar color="secondary" text-color="white" icon="child_friendly" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium">
                  {{ animalDisplayName(child) }}
                </q-item-label>
                <q-item-label caption>
                  {{ animalSpeciesBreed(child) }} • {{ sexLabel(child.sex) }}
                  <span v-if="child.birthDate"> • {{ ageSummary(child.birthDate) }}</span>
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn flat round dense color="primary" icon="visibility" :aria-label="t('common.view')"
                  :title="t('common.view')" :to="`/animals/${child.id}`" />
              </q-item-section>
            </q-item>
          </q-list>

          <PagedListControls v-if="selectedBreedingGroup" :current-page="breedingOffspringPage"
            :list-mode="breedingOffspringListMode" :list-mode-options="listModeOptions"
            :page-count="breedingOffspringPageCount" :page-size="breedingOffspringPageSize"
            :page-size-options="pageSizeOptions" :per-page-label="t('common.perPage')"
            :showing-text="t('animalDetail.showingBreedingOffspring', { shown: displayedBreedingOffspringCount, total: selectedBreedingGroup.offspringAnimals.length })"
            :show-header="false" @update:current-page="breedingOffspringPage = $event"
            @update:list-mode="breedingOffspringListMode = $event"
            @update:page-size="breedingOffspringPageSize = $event" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="isParentPickerOpen">
      <q-card class="app-dialog-card" style="width: 100%; max-width: 640px">
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

        <q-card-section class="app-dialog-card__body q-pt-none">
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

          <q-list v-if="parentCandidates.length > 0" separator class="q-mt-md">
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
                  {{ animalSpeciesBreed(candidate) }} • {{ sexLabel(candidate.sex) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <q-banner v-else rounded class="bg-grey-1 text-grey-8 q-mt-md">
            <template #avatar>
              <q-icon name="search_off" color="primary" />
            </template>
            {{ t('animalForm.noMatchingParents') }}
          </q-banner>
        </q-card-section>

        <q-card-actions align="between" class="app-dialog-card__actions">
          <q-btn
            v-if="currentParentLinkedAnimal"
            flat
            color="negative"
            icon="link_off"
            :label="currentParentUnlinkLabel"
            @click="clearParentSelection"
          />
          <q-space v-else />
          <q-btn flat color="grey-7" :label="t('common.cancel')" @click="isParentPickerOpen = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <AnimalFormDialog v-model="isAnimalDialogOpen" :animal="animal" :animals="animals" mode="edit"
      @submit="submitAnimalEdit" />
  </AppPageShell>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import AppPageShell from 'src/components/AppPageShell.vue'
import AnimalFormDialog from 'src/components/AnimalFormDialog.vue'
import DetailHeader from 'src/components/DetailHeader.vue'
import EventFormDialog from 'src/components/EventFormDialog.vue'
import EventListItem from 'src/components/EventListItem.vue'
import PagedListControls from 'src/components/PagedListControls.vue'
import PurchaseEventDialog from 'src/components/PurchaseEventDialog.vue'
import { getEventTypeMeta } from 'src/constants/events'
import { useI18nText } from 'src/i18n'
import { useAnimalsStore } from 'src/stores/animals-store'
import { useAuthStore } from 'src/stores/auth-store'
import { useEventsStore } from 'src/stores/events-store'
import { useSettingsStore } from 'src/stores/settings-store'
import { formatAnimalDisplayName, formatAnimalSpeciesBreed } from 'src/utils/animal-display'
import { groupBreedingsByPartner } from 'src/utils/breeding-history'
import { formatAgeLabel, formatDisplayDate } from 'src/utils/dates'
import { filterParentCandidates, formatAnimalSex } from 'src/utils/parent-candidates'
import { formatStoredWeightForDisplay } from 'src/utils/weight'

const $q = useQuasar()
const { t } = useI18nText()
const route = useRoute()
const router = useRouter()
const animalsStore = useAnimalsStore()
const authStore = useAuthStore()
const eventsStore = useEventsStore()
const settingsStore = useSettingsStore()

const { animals, errorMessage: animalsErrorMessage, isLoading: animalsLoading } = storeToRefs(animalsStore)
const { isPremium } = storeToRefs(authStore)
const { errorMessage: eventsErrorMessage, isLoading: eventsLoading, events } = storeToRefs(eventsStore)
const { weightUnit } = storeToRefs(settingsStore)

const isAnimalDialogOpen = ref(false)
const isParentPickerOpen = ref(false)
const parentPickerType = ref('dam')
const parentSearchTerm = ref('')
const isEventDialogOpen = ref(false)
const isPurchaseDialogOpen = ref(false)
const isBreedingOffspringDialogOpen = ref(false)
const initialPurchaseAnimalIds = ref([])
const eventFormMode = ref('create')
const selectedEventId = ref('')
const selectedBreedingPartnerId = ref('')
const breedingOffspringPreviewSize = 2
const pageSizeOptions = [
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '25', value: 25 },
]
const listModeOptions = computed(() => [
  { label: t('common.pages'), value: 'paged' },
  { label: t('common.viewAll'), value: 'all' },
])
const timelineListMode = ref('paged')
const timelinePage = ref(1)
const timelinePageSize = ref(5)
const breedingGroupListMode = ref('paged')
const breedingGroupPage = ref(1)
const breedingGroupPageSize = ref(5)
const breedingOffspringListMode = ref('paged')
const breedingOffspringPage = ref(1)
const breedingOffspringPageSize = ref(5)

const animalId = computed(() => String(route.params.id ?? ''))
const animal = computed(() => animalsStore.getAnimalById(animalId.value))
const animalEvents = computed(() => eventsStore.eventsForAnimal(animalId.value))
const damAnimal = computed(() => animalsStore.getAnimalById(animal.value?.damId ?? ''))
const sireAnimal = computed(() => animalsStore.getAnimalById(animal.value?.sireId ?? ''))
const currentParentRoleLabel = computed(() => (parentPickerType.value === 'dam' ? t('animalForm.dam') : t('animalForm.sire')))
const currentParentDialogTitle = computed(() =>
  parentPickerType.value === 'dam' ? t('animalForm.pickDam') : t('animalForm.pickSire'),
)
const currentParentRequiredSex = computed(() => (parentPickerType.value === 'dam' ? 'female' : 'male'))
const currentParentLinkedAnimal = computed(() =>
  parentPickerType.value === 'dam' ? damAnimal.value : sireAnimal.value,
)
const currentParentUnlinkLabel = computed(() =>
  parentPickerType.value === 'dam' ? t('animalDetail.unlinkDam') : t('animalDetail.unlinkSire'),
)
const parentCandidateBanner = computed(() => {
  const speciesPart = animal.value?.species
    ? t('animalForm.showingCandidatesSpeciesPart', { species: animal.value.species })
    : ''

  return t('animalForm.showingCandidates', {
    role: currentParentRoleLabel.value.toLowerCase(),
    speciesPart,
  })
})
const parentCandidates = computed(() =>
  filterParentCandidates({
    animals: animals.value,
    currentAnimalId: animal.value?.id ?? '',
    species: animal.value?.species ?? '',
    requiredSex: currentParentRequiredSex.value,
    query: parentSearchTerm.value,
  }),
)
const timelinePageCount = computed(() =>
  Math.max(1, Math.ceil(animalEvents.value.length / timelinePageSize.value)),
)
const paginatedTimelineEvents = computed(() => {
  const start = (timelinePage.value - 1) * timelinePageSize.value
  return animalEvents.value.slice(start, start + timelinePageSize.value)
})
const displayedTimelineEvents = computed(() =>
  timelineListMode.value === 'paged' ? paginatedTimelineEvents.value : animalEvents.value,
)
const displayedTimelineEventCount = computed(() => displayedTimelineEvents.value.length)
const breedingGroups = computed(() =>
  groupBreedingsByPartner(animalId.value, animals.value, events.value),
)
const breedingGroupPageCount = computed(() =>
  Math.max(1, Math.ceil(breedingGroups.value.length / breedingGroupPageSize.value)),
)
const paginatedBreedingGroups = computed(() => {
  const start = (breedingGroupPage.value - 1) * breedingGroupPageSize.value
  return breedingGroups.value.slice(start, start + breedingGroupPageSize.value)
})
const displayedBreedingGroups = computed(() =>
  breedingGroupListMode.value === 'paged' ? paginatedBreedingGroups.value : breedingGroups.value,
)
const displayedBreedingGroupCount = computed(() => displayedBreedingGroups.value.length)
const selectedBreedingGroup = computed(() =>
  breedingGroups.value.find((group) => group.partnerAnimalId === selectedBreedingPartnerId.value) ?? null,
)
const selectedEvent = computed(() =>
  events.value.find((event) => event.id === selectedEventId.value) ?? null,
)
const selectedBreedingOffspringAnimals = computed(() => selectedBreedingGroup.value?.offspringAnimals ?? [])
const offspringAnimals = computed(() => animalsStore.getOffspringForAnimal(animalId.value))
const breedingOffspringPageCount = computed(() =>
  Math.max(1, Math.ceil(selectedBreedingOffspringAnimals.value.length / breedingOffspringPageSize.value)),
)
const paginatedBreedingOffspringAnimals = computed(() => {
  const start = (breedingOffspringPage.value - 1) * breedingOffspringPageSize.value
  return selectedBreedingOffspringAnimals.value.slice(start, start + breedingOffspringPageSize.value)
})
const displayedBreedingOffspringAnimals = computed(() =>
  breedingOffspringListMode.value === 'paged'
    ? paginatedBreedingOffspringAnimals.value
    : selectedBreedingOffspringAnimals.value,
)
const displayedBreedingOffspringCount = computed(() => displayedBreedingOffspringAnimals.value.length)
const isBusy = computed(() => animalsLoading.value || eventsLoading.value)
const loadErrorMessage = computed(() => animalsErrorMessage.value || eventsErrorMessage.value)
const eventDialogTitle = computed(() =>
  eventFormMode.value === 'edit' ? t('animalDetail.eventEditTitle') : t('animalDetail.eventAddTitle'),
)
const breedingOffspringDialogTitle = computed(() => {
  const group = selectedBreedingGroup.value

  if (!group?.partnerAnimal) {
    return t('animalDetail.breedingOffspringTitle')
  }

  return t('animalDetail.breedingOffspringDialogTitle', {
    partner: animalDisplayName(group.partnerAnimal),
  })
})
const backLinkTarget = computed(() => {
  const from = String(route.query.from ?? '')

  if (from === 'dashboard') {
    return '/'
  }

  if (from === 'events') {
    return '/events'
  }

  return '/animals'
})
const backLinkLabel = computed(() => {
  const from = String(route.query.from ?? '')

  if (from === 'dashboard') {
    return t('animalDetail.backToDashboard')
  }

  if (from === 'events') {
    return t('animalDetail.backToEvents')
  }

  return t('animalDetail.backToAnimals')
})

function openEventDialog() {
  if (animal.value?.status !== 'active') {
    $q.notify({
      color: 'negative',
      message: t('common.onlyActiveAnimalsForEvents'),
      position: 'top',
    })
    return
  }

  eventFormMode.value = 'create'
  selectedEventId.value = ''
  isEventDialogOpen.value = true
}

function openEditEventDialog(event) {
  eventFormMode.value = 'edit'
  selectedEventId.value = event.id
  isEventDialogOpen.value = true
}

function openEditDialog() {
  isAnimalDialogOpen.value = true
}

function openParentPickerDialog(type) {
  parentPickerType.value = type
  parentSearchTerm.value = ''
  isParentPickerOpen.value = true
}

function previewBreedingOffspring(group) {
  return group.offspringAnimals.slice(0, breedingOffspringPreviewSize)
}

function openBreedingOffspringDialog(group) {
  selectedBreedingPartnerId.value = group.partnerAnimalId
  isBreedingOffspringDialogOpen.value = true
}

function closeBreedingOffspringDialog() {
  isBreedingOffspringDialogOpen.value = false
  selectedBreedingPartnerId.value = ''
}

async function submitAnimalEdit(payload) {
  try {
    await animalsStore.editAnimal(payload.id, payload)
    isAnimalDialogOpen.value = false

    $q.notify({
      color: 'positive',
      message: t('animalDetail.animalUpdated'),
      position: 'top',
    })
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: error instanceof Error ? error.message : t('animalDetail.animalUpdateFailed'),
      position: 'top',
    })
  }
}

function buildAnimalEditPayload(overrides = {}) {
  if (!animal.value) {
    return null
  }

  return {
    ...animal.value,
    status: animal.value.baseStatus ?? animal.value.status,
    ...overrides,
  }
}

async function saveParentLink(overrides) {
  const payload = buildAnimalEditPayload(overrides)

  if (!payload || !animal.value) {
    return
  }

  try {
    await animalsStore.editAnimal(animal.value.id, payload)
    isParentPickerOpen.value = false
    parentSearchTerm.value = ''
    $q.notify({
      color: 'positive',
      message: t('animalDetail.animalUpdated'),
      position: 'top',
    })
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: error instanceof Error ? error.message : t('animalDetail.animalUpdateFailed'),
      position: 'top',
    })
  }
}

function selectParent(parentAnimal) {
  if (parentPickerType.value === 'dam') {
    void saveParentLink({ damId: parentAnimal.id })
    return
  }

  void saveParentLink({ sireId: parentAnimal.id })
}

function clearParentSelection() {
  if (parentPickerType.value === 'dam') {
    void saveParentLink({ damId: '' })
    return
  }

  void saveParentLink({ sireId: '' })
}

async function submitEvent(payload) {
  if (!animal.value) {
    return
  }

  try {
    const isEditing = eventFormMode.value === 'edit'

    if (isEditing) {
      await eventsStore.editEvent(selectedEventId.value, payload)
    } else {
      await eventsStore.addEvent(payload)
    }

    await animalsStore.loadAnimals()
    isEventDialogOpen.value = false
    eventFormMode.value = 'create'
    selectedEventId.value = ''
    $q.notify({
      color: 'positive',
      message: isEditing ? t('animalDetail.eventUpdated') : t('animalDetail.eventAdded'),
      position: 'top',
    })
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: error instanceof Error ? error.message : t('animalDetail.eventSaveFailed'),
      position: 'top',
    })
  }
}

function openPurchaseDialog(payload = {}) {
  initialPurchaseAnimalIds.value = payload.animalIds?.length ? payload.animalIds : [animalId.value]
  eventFormMode.value = 'create'
  selectedEventId.value = ''
  isPurchaseDialogOpen.value = true
}

async function submitPurchaseEvent(payload) {
  try {
    await eventsStore.addPurchaseEvent(payload)
    await animalsStore.loadAnimals()
    isPurchaseDialogOpen.value = false
    initialPurchaseAnimalIds.value = []

    $q.notify({
      color: 'positive',
      message: t('animalDetail.eventAdded'),
      position: 'top',
    })
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: error instanceof Error ? error.message : t('animalDetail.eventSaveFailed'),
      position: 'top',
    })
  }
}

function confirmDeleteEvent(event) {
  $q.dialog({
    title: t('animalDetail.deleteEventTitle'),
    message: t('animalDetail.deleteEventMessage', { eventType: getEventTypeMeta(event.type).label.toLowerCase() }),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await eventsStore.removeEvent(event.id)
      await animalsStore.loadAnimals()
      $q.notify({ color: 'positive', message: t('animalDetail.eventRemoved'), position: 'top' })
    } catch (error) {
      $q.notify({
        color: 'negative',
        message: error instanceof Error ? error.message : t('animalDetail.eventDeleteFailed'),
        position: 'top',
      })
    }
  })
}

function animalDisplayName(currentAnimal) {
  return formatAnimalDisplayName(currentAnimal)
}

function animalSpeciesBreed(currentAnimal, options) {
  return formatAnimalSpeciesBreed(currentAnimal, options)
}

function animalById(id) {
  return animalsStore.getAnimalById(id)
}

function eventDetailTarget(event) {
  return { path: `/events/${event.id}`, query: { from: 'animal', animal: animalId.value } }
}

function openEventDetail(event) {
  void router.push(eventDetailTarget(event))
}

function sexLabel(sex) {
  return formatAnimalSex(sex)
}

function weightChipLabel(weight) {
  return formatStoredWeightForDisplay(weight, weightUnit.value)
}

function formatDate(value) {
  if (!value) {
    return t('common.dateNotSet')
  }

  return formatDisplayDate(value)
}

function birthChipLabel(value) {
  const dateLabel = t('animalDetail.bornChip', { date: formatDate(value) })

  return dateLabel;
}

function ageSummary(value) {
  return formatAgeLabel(value) || formatDate(value)
}

function statusLabel(status) {
  return t(`common.status.${status}`)
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

function breedingCountLabel(count) {
  return count === 1
    ? t('animalDetail.breedingCountOne')
    : t('animalDetail.breedingCountMany', { count })
}

watch(breedingGroups, () => {
  if (breedingGroupPage.value > breedingGroupPageCount.value) {
    breedingGroupPage.value = breedingGroupPageCount.value
  }
})

watch(animalEvents, () => {
  if (timelinePage.value > timelinePageCount.value) {
    timelinePage.value = timelinePageCount.value
  }
})

watch([timelineListMode, timelinePageSize, animalId], () => {
  timelinePage.value = 1
})

watch([breedingGroupListMode, breedingGroupPageSize], () => {
  breedingGroupPage.value = 1
})

watch(selectedBreedingOffspringAnimals, () => {
  if (breedingOffspringPage.value > breedingOffspringPageCount.value) {
    breedingOffspringPage.value = breedingOffspringPageCount.value
  }
})

watch([breedingOffspringListMode, breedingOffspringPageSize], () => {
  breedingOffspringPage.value = 1
})

watch(selectedBreedingPartnerId, () => {
  breedingOffspringListMode.value = 'paged'
  breedingOffspringPage.value = 1
  breedingOffspringPageSize.value = 5
})

onMounted(async () => {
  try {
    if (!animalsStore.isLoaded) {
      await animalsStore.loadAnimals()
    }

    if (!eventsStore.isLoaded) {
      await eventsStore.loadEvents()
    }
  } catch {
    // store error messages are already exposed to the UI
  }
})
</script>

<style scoped>
.parent-record-banner {
  border: 1px dashed rgba(61, 111, 63, 0.5);
  transition: background-color 0.15s ease;
}

.parent-record-banner:hover {
  background-color: rgba(61, 111, 63, 0.08);
}
</style>

<style scoped>
.detail-wrap-chip {
  max-width: 100%;
  /* height: auto; */
}

.detail-wrap-chip :deep(.q-chip__content) {
  white-space: normal;
  overflow-wrap: anywhere;

}
</style>
