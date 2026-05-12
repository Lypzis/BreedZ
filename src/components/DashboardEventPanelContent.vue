<template>
  <q-banner v-if="events.length === 0" rounded class="bg-grey-1 text-grey-8">
    <template #avatar>
      <q-icon :name="emptyIcon" color="primary" />
    </template>
    {{ emptyText }}
  </q-banner>

  <template v-else>
    <PagedListControls
      :current-page="currentPage"
      :list-mode="listMode"
      :list-mode-options="listModeOptions"
      :page-count="pageCount"
      :page-size="pageSize"
      :page-size-options="pageSizeOptions"
      :per-page-label="t('common.perPage')"
      :showing-text="showingText"
      :show-pagination="false"
      @update:current-page="currentPage = $event"
      @update:list-mode="listMode = $event"
      @update:page-size="pageSize = $event"
    />

    <q-list separator>
      <EventListItem
        v-for="event in displayedEvents"
        :key="event.id"
        :event="event"
        :animal-resolver="animalResolver"
        :detail-target="detailTarget(event)"
        :notes-fallback="notesFallback"
        :show-animal-meta="showAnimalMeta"
        :show-date="showDate"
        :show-notes="showNotes"
        item-class="q-py-md"
        :side-top="false"
        @open="$emit('open', $event)"
      />
    </q-list>

    <PagedListControls
      :current-page="currentPage"
      :list-mode="listMode"
      :list-mode-options="listModeOptions"
      :page-count="pageCount"
      :page-size="pageSize"
      :page-size-options="pageSizeOptions"
      :per-page-label="t('common.perPage')"
      :showing-text="showingText"
      :show-header="false"
      @update:current-page="currentPage = $event"
      @update:list-mode="listMode = $event"
      @update:page-size="pageSize = $event"
    />
  </template>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import EventListItem from 'src/components/EventListItem.vue'
import PagedListControls from 'src/components/PagedListControls.vue'
import { useI18nText } from 'src/i18n'

const props = defineProps({
  animalResolver: {
    type: Function,
    required: true,
  },
  detailTarget: {
    type: Function,
    required: true,
  },
  emptyIcon: {
    type: String,
    default: 'event',
  },
  emptyText: {
    type: String,
    required: true,
  },
  events: {
    type: Array,
    default: () => [],
  },
  notesFallback: {
    type: String,
    default: '',
  },
  showingTextKey: {
    type: String,
    required: true,
  },
  showAnimalMeta: {
    type: Boolean,
    default: false,
  },
  showDate: {
    type: Boolean,
    default: true,
  },
  showNotes: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['open'])

const { t } = useI18nText()
const listMode = ref('paged')
const currentPage = ref(1)
const pageSize = ref(5)
const pageSizeOptions = [
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '25', value: 25 },
]
const listModeOptions = computed(() => [
  { label: t('common.pages'), value: 'paged' },
  { label: t('common.viewAll'), value: 'all' },
])
const pageCount = computed(() =>
  Math.max(1, Math.ceil(props.events.length / pageSize.value)),
)
const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return props.events.slice(start, start + pageSize.value)
})
const displayedEvents = computed(() =>
  listMode.value === 'paged' ? paginatedEvents.value : props.events,
)
const showingText = computed(() =>
  t(props.showingTextKey, { shown: displayedEvents.value.length, total: props.events.length }),
)

watch(
  () => [props.events, listMode.value, pageSize.value],
  () => {
    currentPage.value = 1
  },
)

watch(pageCount, () => {
  if (currentPage.value > pageCount.value) {
    currentPage.value = pageCount.value
  }
})
</script>
