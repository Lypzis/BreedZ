<template>
  <q-card-section tag="section">
    <div class="text-overline text-weight-bold text-accent">
      {{ overline }}
    </div>
    <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-md">
      {{ title }}
    </h2>

    <dl class="q-my-none">
      <div v-for="faq in faqs" :key="faq.question" class="q-py-sm">
        <dt class="text-weight-bold">{{ faq.question }}</dt>
        <dd class="text-body2 text-grey-7 q-ml-none q-mt-xs">{{ faq.answer }}</dd>
      </div>
    </dl>
  </q-card-section>
</template>

<script setup>
defineProps({
  overline: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  faqs: {
    type: Array,
    required: true,
  },
})
</script>
