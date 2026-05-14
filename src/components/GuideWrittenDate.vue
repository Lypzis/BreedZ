<template>
  <div class="text-caption text-grey-7 q-mt-sm">
    {{ t('guideShare.writtenOn', { date: formattedDate }) }}
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18nText } from 'src/i18n'
import { formatDisplayDate } from 'src/utils/dates'

const props = defineProps({
  date: {
    type: String,
    default: '2026-05-14',
  },
})

const { t } = useI18nText()

const formattedDate = computed(() => formatDisplayDate(props.date))
</script>
