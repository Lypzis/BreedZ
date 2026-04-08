<template>
  <div class="fullscreen bg-white text-center q-pa-md flex flex-center">
    <div class="column items-center">
      <h1 class="text-h1 text-weight-bold text-primary q-mt-none q-mb-md">404</h1>

      <router-link :to="animalsPath" replace class="not-found-image-link">
        <q-img
          :src="notFoundImage"
          :alt="t('notFound.message')"
          fit="contain"
          no-spinner
          class="not-found-image"
        />
      </router-link>

      <div class="q-mt-md text-h4 text-weight-bold text-primary not-found-title">
        {{ t('notFound.title') }}
      </div>
      <div class="q-mt-sm text-subtitle1 text-grey-7 not-found-subtitle">
        {{ t('notFound.subtitle') }}
      </div>

      <q-btn
        class="q-mt-lg"
        color="primary"
        unelevated
        :to="animalsPath"
        replace
        :label="t('notFound.backToAnimals')"
        no-caps
      />
    </div>
  </div>
</template>

<script setup>
import { useI18nText } from 'src/i18n'
import { computed } from 'vue'
import notFoundImage from 'src/assets/404.png'

const { t } = useI18nText()
const animalsPath = computed(() => '/animals')
</script>

<style scoped>
.not-found-image-link {
  display: inline-block;
}

.not-found-image {
  width: min(92vw, 520px);
  max-width: 100%;
  border-radius: 24px;
}

.not-found-title,
.not-found-subtitle {
  max-width: 540px;
}
</style>
