<template>
  <q-expansion-item class="dashboard-section-panel q-mb-lg" :default-opened="defaultOpened"
    group="dashboard-actionable-records">
    <template #header>
      <q-item-section avatar>
        <q-avatar :color="avatarColor" text-color="white" :icon="icon" />
      </q-item-section>

      <q-item-section>
        <q-item-label class="text-weight-bold">{{ title }}</q-item-label>
        <q-item-label caption>{{ caption }}</q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-chip square :color="chipColor" :text-color="chipTextColor">
          {{ count }}
        </q-chip>
      </q-item-section>
    </template>

    <div>
      <slot />
    </div>
  </q-expansion-item>
</template>

<script setup>
defineProps({
  avatarColor: {
    type: String,
    default: 'primary',
  },
  caption: {
    type: String,
    required: true,
  },
  chipColor: {
    type: String,
    default: 'green-1',
  },
  chipTextColor: {
    type: String,
    default: 'primary',
  },
  count: {
    type: Number,
    required: true,
  },
  defaultOpened: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.dashboard-section-panel.q-expansion-item--expanded {
  border: 1px solid rgba(46, 91, 49, 0.18);
  border-radius: 8px;
}
</style>
