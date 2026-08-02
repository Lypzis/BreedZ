<template>
  <nav :aria-label="t('guideArticle.breadcrumbLabel')" class="q-mb-md">
    <q-breadcrumbs class="text-caption text-grey-7">
      <q-breadcrumbs-el :label="t('guideArticle.guides')" :to="guidesPath" />
      <q-breadcrumbs-el :label="title" />
    </q-breadcrumbs>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18nText } from 'src/i18n'
import { buildLocalizedPath, localeFromPath } from 'src/utils/localeRouting'

defineProps({
  title: {
    type: String,
    required: true,
  },
})

const { t } = useI18nText()
const route = useRoute()
const routeLocale = computed(() => localeFromPath(route.path) || 'en')
const guidesPath = computed(() => buildLocalizedPath(routeLocale.value, '/guides'))
</script>
