<template>
  <q-banner rounded class="bg-green-1 text-primary q-mt-lg q-mb-md">
    <div class="row items-center q-gutter-sm q-mb-sm">
      <q-icon name="auto_stories" color="primary" />
      <div class="text-overline text-weight-bold">
        {{ t('guideShare.relatedOverline') }}
      </div>
    </div>

    <div class="row items-end q-col-gutter-md">
      <div class="col-12 col-sm">
        <div class="text-subtitle1 text-weight-bold">
          {{ title }}
        </div>
        <div class="text-body2 text-grey-8 q-mt-xs">
          {{ description }}
        </div>
      </div>
      <div class="col-12 col-sm-auto">
        <q-btn unelevated color="primary" icon-right="arrow_forward" :label="t('guideShare.readRelatedGuide')" :to="to"
          class="full-width" />
      </div>
    </div>
  </q-banner>
</template>

<script setup>
import { useI18nText } from 'src/i18n'

defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
})

const { t } = useI18nText()
</script>
