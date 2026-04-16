<template>
  <q-page :class="pageClass">
    <div class="row justify-center">
      <div :class="containerClass">
        <slot />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  pageClass: {
    type: [String, Array, Object],
    default: 'q-pa-xs',
  },
  md: {
    type: [String, Number],
    default: 10,
  },
  lg: {
    type: [String, Number],
    default: 8,
  },
})

const containerClass = computed(() => `col-12 col-md-${props.md} col-lg-${props.lg}`)
</script>
