<template>
  <router-view />
</template>

<script setup>
import { useMeta } from 'quasar'

useMeta({
  title: 'BreedZ',
  meta: {
    description: {
      name: 'description',
      content: 'BreedZ is a herd management app for tracking cattle breeding records, animal lineage, and farm activity.',
    },
  },
})
</script>
