<template>
  <div class="text-caption text-grey-7 q-mt-sm guide-attribution">
    <span>
      {{ t('guideArticle.by') }}
      <router-link :to="authorPath" class="text-primary text-weight-medium">
        {{ t('guideArticle.authorName') }}
      </router-link>,
      {{ t('guideArticle.authorRole') }}
    </span>
    <span aria-hidden="true"> · </span>
    <span>
      {{ t('guideArticle.publishedOn') }}
      <time :datetime="publishedAt">{{ publishedLabel }}</time>
    </span>
    <template v-if="modifiedAt && modifiedAt !== publishedAt">
      <span aria-hidden="true"> · </span>
      <span>
        {{ t('guideArticle.updatedOn') }}
        <time :datetime="modifiedAt">{{ modifiedLabel }}</time>
      </span>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18nText } from 'src/i18n'
import { formatDisplayDate } from 'src/utils/dates'
import { buildLocalizedPath, localeFromPath } from 'src/utils/localeRouting'

const props = defineProps({
  publishedAt: {
    type: String,
    required: true,
  },
  modifiedAt: {
    type: String,
    default: '',
  },
})

const { t } = useI18nText()
const route = useRoute()
const routeLocale = computed(() => localeFromPath(route.path) || 'en')
const authorPath = computed(() => `${buildLocalizedPath(routeLocale.value, '/about')}#victor-v-piccoli`)
const publishedLabel = computed(() => formatDisplayDate(props.publishedAt))
const modifiedLabel = computed(() => formatDisplayDate(props.modifiedAt))
</script>

<style scoped>
.guide-attribution a {
  text-decoration: none;
}

.guide-attribution a:hover {
  text-decoration: underline;
}
</style>
