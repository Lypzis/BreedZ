<template>
  <div>
    <q-card-section class="detail-header">
      <div class="row items-center q-col-gutter-md">
        <div v-if="avatarIcon" class="col-auto">
          <q-avatar
            :color="avatarColor"
            :text-color="avatarTextColor"
            :icon="avatarIcon"
            :size="avatarSize"
          />
        </div>

        <div class="col">
          <div v-if="$slots.badges" class="row q-gutter-xs q-mt-xs">
            <slot name="badges" />
          </div>
          <div class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
            {{ title }}
          </div>
        </div>
      </div>
    </q-card-section>

    <q-card-section v-if="$slots.chips" class="q-pt-none">
      <div class="row q-col-gutter-xs">
        <slot name="chips" />
      </div>
    </q-card-section>

    <q-card-section v-if="$slots.actions" class="q-pt-none">
      <div class="row q-gutter-sm">
        <slot name="actions" />
      </div>
    </q-card-section>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  avatarIcon: {
    type: String,
    default: '',
  },
  avatarColor: {
    type: String,
    default: 'primary',
  },
  avatarTextColor: {
    type: String,
    default: 'white',
  },
  avatarSize: {
    type: String,
    default: '56px',
  },
})
</script>

<style scoped>
.detail-header {
  padding-top: 0;
}
</style>
