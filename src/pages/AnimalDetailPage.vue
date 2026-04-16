<template>
  <AppPageShell>
        <div class="q-mb-md">
          <div class="row items-center justify-between q-col-gutter-sm">
            <div class="col-auto">
              <q-btn
                flat
                color="primary"
                icon="arrow_back"
                :label="backLinkLabel"
                :to="backLinkTarget"
              />
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
            <q-card-section>
              <div>
                <!-- <div class="text-overline text-weight-bold text-primary">{{ t('animalDetail.timelineOverline') }}</div> -->
                <div class="row q-gutter-xs q-mt-xs">
                  <q-chip square dense :color="statusColor(animal.status)" text-color="white" icon="task_alt">
                    {{ statusLabel(animal.status) }}
                  </q-chip>
                  <q-chip v-if="animal.isBreeder" square dense color="info" text-color="white" icon="bookmark">
                    {{ t('common.reproducer') }}
                  </q-chip>
                </div>
                <div class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
                  {{ animalDisplayName(animal) }}
                </div>
              </div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="row q-col-gutter-xs">
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
                <div class="col-auto">
                  <q-chip square color="green-1" text-color="primary" icon="cake" class="detail-wrap-chip">
                    {{ birthChipLabel(animal.birthDate) }}
                  </q-chip>
                </div>
                <div class="col-auto">
                  <q-chip square color="green-1" text-color="primary" icon="calendar_today" class="detail-wrap-chip">
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
              </div>
            </q-card-section>

            <q-card-section >
              <div class="row q-gutter-sm">
                <q-btn
                  unelevated
                  color="primary"
                  icon="add"
                  :label="t('common.addEvent')"
                  :disable="animal.status !== 'active'"
                  @click="openEventDialog"
                />
                <q-btn outline color="primary" icon="edit" :label="t('common.editAnimal')" @click="openEditDialog" />
              </div>
            </q-card-section>

            <q-card-section >
              <div class="text-overline text-weight-bold text-primary">{{ t('animalDetail.lineageOverline') }}</div>
              <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">{{ t('animalDetail.lineageTitle') }}</div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-banner rounded class="bg-grey-1 text-grey-8">
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
                        <q-btn
                          flat
                          round
                          dense
                          color="primary"
                          icon="visibility"
                          :aria-label="t('animalDetail.openParent')"
                          :title="t('animalDetail.openParent')"
                          :to="`/animals/${damAnimal.id}`"
                        />
                      </div>
                    </div>
                  </q-banner>
                </div>

                <div class="col-12 col-md-6">
                  <q-banner rounded class="bg-grey-1 text-grey-8">
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
                        <q-btn
                          flat
                          round
                          dense
                          color="primary"
                          icon="visibility"
                          :aria-label="t('animalDetail.openParent')"
                          :title="t('animalDetail.openParent')"
                          :to="`/animals/${sireAnimal.id}`"
                        />
                      </div>
                    </div>
                  </q-banner>
                </div>
              </div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="text-overline text-weight-bold text-primary">{{ t('animalDetail.breedingsOverline') }}</div>
              <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">{{ t('animalDetail.breedingsTitle') }}</div>

              <q-banner v-if="breedingGroups.length === 0" rounded class="bg-grey-1 text-grey-8">
                <template #avatar>
                  <q-icon name="favorite" color="primary" />
                </template>
                {{ t('animalDetail.breedingsEmpty') }}
              </q-banner>

              <PagedListControls
                v-else
                :current-page="breedingGroupPage"
                :list-mode="breedingGroupListMode"
                :list-mode-options="listModeOptions"
                :page-count="breedingGroupPageCount"
                :page-size="breedingGroupPageSize"
                :page-size-options="pageSizeOptions"
                :per-page-label="t('common.perPage')"
                :showing-text="t('animalDetail.showingBreedings', { shown: displayedBreedingGroupCount, total: breedingGroups.length })"
                :show-pagination="false"
                @update:current-page="breedingGroupPage = $event"
                @update:list-mode="breedingGroupListMode = $event"
                @update:page-size="breedingGroupPageSize = $event"
              />

              <div v-if="breedingGroups.length > 0" class="column q-gutter-md">
                <q-banner
                  v-for="group in displayedBreedingGroups"
                  :key="group.partnerAnimalId"
                  rounded
                  class="bg-grey-1 text-grey-8"
                >
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
                      <q-btn
                        flat
                        round
                        dense
                        color="primary"
                        icon="visibility"
                        :aria-label="t('common.view')"
                        :title="t('common.view')"
                        :to="`/animals/${group.partnerAnimal.id}`"
                      />
                    </div>
                  </div>

                  <q-card
                    v-if="group.offspringAnimals.length > 0"
                    flat
                    bordered
                    class="bg-white q-mt-md"
                  >
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
                          <q-btn
                            flat
                            round
                            dense
                            color="primary"
                            icon="visibility"
                            :aria-label="t('common.view')"
                            :title="t('common.view')"
                            :to="`/animals/${child.id}`"
                          />
                        </q-item-section>
                      </q-item>
                    </q-list>

                    <q-card-actions v-if="group.offspringAnimals.length > breedingOffspringPreviewSize" align="right">
                      <q-btn
                        flat
                        color="primary"
                        :label="t('animalDetail.showMoreBreedingOffspring', { count: group.offspringAnimals.length })"
                        @click="openBreedingOffspringDialog(group)"
                      />
                    </q-card-actions>
                  </q-card>
                </q-banner>
              </div>

              <PagedListControls
                v-if="breedingGroups.length > 0"
                :current-page="breedingGroupPage"
                :list-mode="breedingGroupListMode"
                :list-mode-options="listModeOptions"
                :page-count="breedingGroupPageCount"
                :page-size="breedingGroupPageSize"
                :page-size-options="pageSizeOptions"
                :per-page-label="t('common.perPage')"
                :showing-text="t('animalDetail.showingBreedings', { shown: displayedBreedingGroupCount, total: breedingGroups.length })"
                :show-header="false"
                @update:current-page="breedingGroupPage = $event"
                @update:list-mode="breedingGroupListMode = $event"
                @update:page-size="breedingGroupPageSize = $event"
              />
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

            <q-card-section class="q-pt-none">
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

            <q-list v-else separator>
              <q-item v-for="event in animalEvents" :key="event.id">
                <q-item-section avatar>
                  <q-avatar
                    :color="getEventTypeMeta(event.type).color"
                    text-color="white"
                    :icon="getEventTypeMeta(event.type).icon"
                  />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ getEventTypeMeta(event.type).label }}</q-item-label>
                  <q-item-label caption>{{ formatDate(event.date) }}</q-item-label>
                  <q-item-label v-if="event.notes" caption class="text-grey-7">
                    {{ event.notes }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="row q-gutter-xs">
                    <q-btn
                      flat
                      round
                      dense
                      color="primary"
                      icon="edit"
                      :aria-label="t('animalDetail.editEvent')"
                      :title="t('animalDetail.editEvent')"
                      @click="openEditEventDialog(event)"
                    />
                    <q-btn
                      flat
                      round
                      dense
                      color="negative"
                      icon="delete"
                      :aria-label="t('animalDetail.deleteEvent')"
                      :title="t('animalDetail.deleteEvent')"
                      @click="confirmDeleteEvent(event)"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </template>
        </q-card>
    <q-dialog v-model="isEventDialogOpen">
      <q-card style="width: 100%; max-width: 640px">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-overline text-weight-bold text-primary">{{ t('animalDetail.eventDialogOverline') }}</div>
            <div class="text-h6 text-weight-bold">{{ eventDialogTitle }}</div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            :aria-label="t('common.closeDialog')"
            :title="t('common.closeDialog')"
            @click="closeEventDialog"
          />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form class="column q-gutter-md" @submit.prevent="submitEvent">
            <q-select
              v-model="eventForm.type"
              outlined
              :label="t('events.eventType')"
              :options="eventTypeOptions"
              emit-value
              map-options
            />
            <AnimalPickerField
              v-if="eventForm.type === 'breeding'"
              v-model="eventForm.partnerAnimalId"
              :animals="animalBreedingPartnerAnimals"
              :label="t('events.pickPartner')"
              :dialog-title="t('events.pickPartner')"
              :empty-label="t('common.noAnimalSelected')"
            />
            <q-input v-model="eventForm.date" outlined type="date" :label="t('events.eventDate')" />
            <q-input v-model="eventForm.notes" outlined autogrow type="textarea" :label="t('events.notes')" />

            <div class="row justify-end q-gutter-sm">
              <q-btn flat color="grey-7" :label="t('common.cancel')" @click="closeEventDialog" />
              <q-btn unelevated color="primary" :label="eventSubmitLabel" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="isBreedingOffspringDialogOpen">
      <q-card style="width: 100%; max-width: 720px">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-overline text-weight-bold text-primary">{{ t('animalDetail.breedingsOverline') }}</div>
            <div class="text-h6 text-weight-bold">{{ breedingOffspringDialogTitle }}</div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            :aria-label="t('common.closeDialog')"
            :title="t('common.closeDialog')"
            @click="closeBreedingOffspringDialog"
          />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <PagedListControls
            v-if="selectedBreedingGroup"
            :current-page="breedingOffspringPage"
            :list-mode="breedingOffspringListMode"
            :list-mode-options="listModeOptions"
            :page-count="breedingOffspringPageCount"
            :page-size="breedingOffspringPageSize"
            :page-size-options="pageSizeOptions"
            :per-page-label="t('common.perPage')"
            :showing-text="t('animalDetail.showingBreedingOffspring', { shown: displayedBreedingOffspringCount, total: selectedBreedingGroup.offspringAnimals.length })"
            :show-pagination="false"
            @update:current-page="breedingOffspringPage = $event"
            @update:list-mode="breedingOffspringListMode = $event"
            @update:page-size="breedingOffspringPageSize = $event"
          />

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
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="visibility"
                  :aria-label="t('common.view')"
                  :title="t('common.view')"
                  :to="`/animals/${child.id}`"
                />
              </q-item-section>
            </q-item>
          </q-list>

          <PagedListControls
            v-if="selectedBreedingGroup"
            :current-page="breedingOffspringPage"
            :list-mode="breedingOffspringListMode"
            :list-mode-options="listModeOptions"
            :page-count="breedingOffspringPageCount"
            :page-size="breedingOffspringPageSize"
            :page-size-options="pageSizeOptions"
            :per-page-label="t('common.perPage')"
            :showing-text="t('animalDetail.showingBreedingOffspring', { shown: displayedBreedingOffspringCount, total: selectedBreedingGroup.offspringAnimals.length })"
            :show-header="false"
            @update:current-page="breedingOffspringPage = $event"
            @update:list-mode="breedingOffspringListMode = $event"
            @update:page-size="breedingOffspringPageSize = $event"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <AnimalFormDialog
      v-model="isAnimalDialogOpen"
      :animal="animal"
      :animals="animals"
      mode="edit"
      @submit="submitAnimalEdit"
    />
  </AppPageShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import AppPageShell from 'src/components/AppPageShell.vue'
import AnimalPickerField from 'src/components/AnimalPickerField.vue'
import AnimalFormDialog from 'src/components/AnimalFormDialog.vue'
import PagedListControls from 'src/components/PagedListControls.vue'
import { getEventTypeMeta, getEventTypeOptions } from 'src/constants/events'
import { useI18nText } from 'src/i18n'
import { useAnimalsStore } from 'src/stores/animals-store'
import { useEventsStore } from 'src/stores/events-store'
import { formatAnimalDisplayName, formatAnimalSpeciesBreed } from 'src/utils/animal-display'
import { groupBreedingsByPartner } from 'src/utils/breeding-history'
import {
  filterBreedingPartnerCandidates,
  validateBreedingPartnerSelection,
} from 'src/utils/breeding-partners'
import { formatAgeLabel, formatDisplayDate, todayDateString } from 'src/utils/dates'
import { formatAnimalSex } from 'src/utils/parent-candidates'

const $q = useQuasar()
const { t } = useI18nText()
const route = useRoute()
const animalsStore = useAnimalsStore()
const eventsStore = useEventsStore()

const { animals, errorMessage: animalsErrorMessage, isLoading: animalsLoading } = storeToRefs(animalsStore)
const { errorMessage: eventsErrorMessage, isLoading: eventsLoading, events } = storeToRefs(eventsStore)

const isAnimalDialogOpen = ref(false)
const isEventDialogOpen = ref(false)
const isBreedingOffspringDialogOpen = ref(false)
const eventFormMode = ref('create')
const selectedEventId = ref('')
const selectedBreedingPartnerId = ref('')
const eventForm = reactive(defaultEventForm())
const eventTypeOptions = computed(() => getEventTypeOptions())
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
const selectedBreedingOffspringAnimals = computed(() => selectedBreedingGroup.value?.offspringAnimals ?? [])
const offspringAnimals = computed(() => animalsStore.getOffspringForAnimal(animalId.value))
const animalBreedingPartnerAnimals = computed(() =>
  filterBreedingPartnerCandidates({
    animals: animals.value,
    animalId: animalId.value,
    currentPartnerId: eventForm.partnerAnimalId,
  }),
)
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
const eventSubmitLabel = computed(() =>
  eventFormMode.value === 'edit' ? t('common.saveChanges') : t('common.saveEvent'),
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

function defaultEventForm() {
  return {
    type: 'breeding',
    partnerAnimalId: '',
    date: todayDateString(),
    notes: '',
  }
}

function resetEventForm() {
  Object.assign(eventForm, defaultEventForm())
}

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
  resetEventForm()
  isEventDialogOpen.value = true
}

function openEditEventDialog(event) {
  eventFormMode.value = 'edit'
  selectedEventId.value = event.id
  Object.assign(eventForm, {
    type: event.type,
    partnerAnimalId: event.partnerAnimalId ?? '',
    date: event.date,
    notes: event.notes ?? '',
  })
  isEventDialogOpen.value = true
}

function closeEventDialog() {
  isEventDialogOpen.value = false
  eventFormMode.value = 'create'
  selectedEventId.value = ''
  resetEventForm()
}

function openEditDialog() {
  isAnimalDialogOpen.value = true
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

async function submitEvent() {
  if (!animal.value) {
    return
  }

  if (eventForm.type === 'breeding') {
    const breedingValidationKey = validateBreedingPartnerSelection({
      animals: animals.value,
      animalId: animal.value.id,
      partnerAnimalId: eventForm.partnerAnimalId,
    })

    if (breedingValidationKey) {
      $q.notify({
        color: 'negative',
        message: t(breedingValidationKey),
        position: 'top',
      })
      return
    }
  }

  try {
    const isEditing = eventFormMode.value === 'edit'

    if (isEditing) {
      await eventsStore.editEvent(selectedEventId.value, {
        animalId: animal.value.id,
        type: eventForm.type,
        partnerAnimalId: eventForm.partnerAnimalId,
        date: eventForm.date,
        notes: eventForm.notes,
      })
    } else {
      await eventsStore.addEvent({
        animalId: animal.value.id,
        type: eventForm.type,
        partnerAnimalId: eventForm.partnerAnimalId,
        date: eventForm.date,
        notes: eventForm.notes,
      })
    }

    await animalsStore.loadAnimals()
    closeEventDialog()
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

function sexLabel(sex) {
  return formatAnimalSex(sex)
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

watch(
  () => eventForm.type,
  (value) => {
    if (value !== 'breeding') {
      eventForm.partnerAnimalId = ''
    }
  },
)

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
.detail-wrap-chip {
  max-width: 100%;
  /* height: auto; */
}

.detail-wrap-chip :deep(.q-chip__content) {
  white-space: normal;
  overflow-wrap: anywhere;
  
}
</style>
