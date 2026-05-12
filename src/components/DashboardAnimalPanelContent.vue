<template>
  <q-banner v-if="animals.length === 0" rounded class="bg-grey-1 text-grey-8">
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
      <AnimalListItem
        v-for="animal in displayedAnimals"
        :key="animal.id"
        :animal="animal"
        :caption-suffix="captionSuffix"
        :detail-target="detailTarget(animal)"
        :show-age="false"
        :show-breeder="false"
        :show-sex="false"
        :show-status="false"
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
import AnimalListItem from 'src/components/AnimalListItem.vue'
import PagedListControls from 'src/components/PagedListControls.vue'
import { useI18nText } from 'src/i18n'

const props = defineProps({
  animals: {
    type: Array,
    default: () => [],
  },
  captionSuffix: {
    type: String,
    default: '',
  },
  detailTarget: {
    type: Function,
    required: true,
  },
  emptyIcon: {
    type: String,
    default: 'task_alt',
  },
  emptyText: {
    type: String,
    required: true,
  },
  showingTextKey: {
    type: String,
    required: true,
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
  Math.max(1, Math.ceil(props.animals.length / pageSize.value)),
)
const paginatedAnimals = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return props.animals.slice(start, start + pageSize.value)
})
const displayedAnimals = computed(() =>
  listMode.value === 'paged' ? paginatedAnimals.value : props.animals,
)
const showingText = computed(() =>
  t(props.showingTextKey, { shown: displayedAnimals.value.length, total: props.animals.length }),
)

watch(
  () => [props.animals, listMode.value, pageSize.value],
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
