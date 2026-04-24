<template>
  <div class="bg-grey-1 rounded-borders q-pa-md q-mb-md">
    <div class="text-overline text-weight-bold text-accent">
      {{ t(`${messagePrefix}.overline`) }}
    </div>
    <div class="text-h6 text-weight-bold q-mt-sm q-mb-sm">
      {{ t(`${messagePrefix}.title`) }}
    </div>
    <div class="text-body2 text-grey-7">
      {{ t(`${messagePrefix}.description`) }}
    </div>

    <div class="row q-col-gutter-sm q-mt-sm">
      <div class="col-6 col-sm-auto">
        <q-btn unelevated color="primary" :icon="`img:${whatsAppIcon}`" :label="t(`${messagePrefix}.whatsAppButton`)"
          @click="shareOnWhatsApp" />
      </div>
      <div class="col-6 col-sm-auto">
        <q-btn outline color="primary" icon="content_copy" :label="t(`${messagePrefix}.shareButton`)"
          @click="shareGuide" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { copyToClipboard, useQuasar } from 'quasar'
import whatsAppIcon from 'src/assets/whatsapp-icon.svg'
import { useI18nText } from 'src/i18n'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  messagePrefix: {
    type: String,
    default: 'guideShare',
  },
})

const $q = useQuasar()
const { t } = useI18nText()
const messagePrefix = computed(() => props.messagePrefix || 'guideShare')

const absoluteUrl = computed(() => {
  const origin = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'https://breedz.app'

  return `${origin}${props.path}`
})

const whatsAppText = computed(() =>
  t(`${messagePrefix.value}.whatsAppText`, {
    title: props.title,
    url: absoluteUrl.value,
  }),
)

async function shareGuide() {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      await navigator.share({
        title: props.title,
        text: t(`${messagePrefix.value}.nativeShareText`, { title: props.title }),
        url: absoluteUrl.value,
      })
      return
    }

    await copyToClipboard(absoluteUrl.value)
    $q.notify({
      type: 'positive',
      message: t(`${messagePrefix.value}.copied`),
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      return
    }

    $q.notify({
      type: 'negative',
      message: t(`${messagePrefix.value}.error`),
    })
  }
}

function shareOnWhatsApp() {
  if (typeof window === 'undefined') {
    return
  }

  window.open(
    `https://wa.me/?text=${encodeURIComponent(whatsAppText.value)}`,
    '_blank',
    'noopener,noreferrer',
  )
}
</script>
