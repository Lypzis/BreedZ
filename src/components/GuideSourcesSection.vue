<template>
  <q-card-section tag="section">
    <div class="text-overline text-weight-bold text-primary">
      {{ t('guideSources.overline') }}
    </div>
    <h2 class="text-h6 text-weight-bold q-mt-sm q-mb-sm">
      {{ t('guideSources.title') }}
    </h2>
    <p class="text-body2 text-grey-7 q-mb-sm">
      {{ t('guideSources.description') }}
    </p>

    <ul class="q-list q-pa-none q-ma-none">
      <li
        v-for="source in sources"
        :key="source.url"
        class="q-item q-item-type row no-wrap"
      >
        <div class="q-item__section column q-item__section--side justify-center q-item__section--avatar">
          <q-icon name="open_in_new" color="primary" />
        </div>
        <div class="q-item__section column q-item__section--main justify-center">
          <cite class="text-weight-regular">
            <a :href="source.url" target="_blank" rel="noopener noreferrer" class="text-primary">
              {{ source.title }}
            </a>
          </cite>
          <div class="text-caption text-grey-7">{{ source.publisher }}</div>
        </div>
      </li>
    </ul>
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

<style scoped>
cite {
  font-style: normal;
}

a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
