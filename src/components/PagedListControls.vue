<template>
  <div>
    <q-card-section
      v-if="showHeader"
      class="row items-center justify-between q-col-gutter-sm q-pt-none"
    >
      <div class="col-12 col-md-auto">
        <q-btn-toggle
          :model-value="listMode"
          unelevated
          no-caps
          color="green-1"
          text-color="primary"
          toggle-color="primary"
          toggle-text-color="white"
          :options="listModeOptions"
          @update:model-value="emit('update:listMode', $event)"
        />
      </div>

      <div class="col-12 col-md-auto">
        <div class="row items-center q-col-gutter-sm">
          <div v-if="listMode === 'paged'" class="col-auto">
            <q-select
              :model-value="pageSize"
              dense
              outlined
              emit-value
              map-options
              :label="perPageLabel"
              :options="pageSizeOptions"
              @update:model-value="emit('update:pageSize', $event)"
            />
          </div>
          <div class="col-auto text-caption text-grey-7">
            {{ showingText }}
          </div>
        </div>
      </div>
    </q-card-section>

    <q-card-section
      v-if="showPagination && listMode === 'paged' && pageCount > 1"
      class="row justify-center q-pt-md"
    >
      <q-pagination
        :model-value="currentPage"
        color="primary"
        :max="pageCount"
        :max-pages="6"
        boundary-links
        direction-links
        @update:model-value="emit('update:currentPage', $event)"
      />
    </q-card-section>
  </div>
</template>

<script setup>
defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  showPagination: {
    type: Boolean,
    default: true,
  },
  listMode: {
    type: String,
    required: true,
  },
  listModeOptions: {
    type: Array,
    required: true,
  },
  pageCount: {
    type: Number,
    required: true,
  },
  pageSize: {
    type: Number,
    required: true,
  },
  pageSizeOptions: {
    type: Array,
    required: true,
  },
  perPageLabel: {
    type: String,
    required: true,
  },
  showingText: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:currentPage', 'update:listMode', 'update:pageSize'])
</script>
