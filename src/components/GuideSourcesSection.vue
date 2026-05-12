<template>
  <q-card-section>
    <div class="text-overline text-weight-bold text-primary">
      {{ t('guideSources.overline') }}
    </div>
    <div class="text-h6 text-weight-bold q-mt-sm q-mb-sm">
      {{ t('guideSources.title') }}
    </div>
    <div class="text-body2 text-grey-7 q-mb-sm">
      {{ t('guideSources.description') }}
    </div>

    <q-list>
      <q-item
        v-for="source in sources"
        :key="source.url"
        clickable
        tag="a"
        :href="source.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        <q-item-section avatar>
          <q-icon name="open_in_new" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ source.title }}</q-item-label>
          <q-item-label caption>{{ source.publisher }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-card-section>
</template>

<script setup>
import { useI18nText } from 'src/i18n'

defineProps({
  sources: {
    type: Array,
    required: true,
  },
})

const { t } = useI18nText()
</script>
