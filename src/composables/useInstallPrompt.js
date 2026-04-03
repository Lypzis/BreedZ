import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18nText } from 'src/i18n'

export function useInstallPrompt() {
  const { t } = useI18nText()

  const deferredInstallPrompt = ref(null)
  const installHintVisible = ref(false)
  const installStatusMessage = ref('')
  const isIos = ref(false)
  const isFirefox = ref(false)
  const isInstalled = ref(false)

  const installButtonLabel = computed(() =>
    isInstalled.value ? t('home.installed') : t('home.installApp'),
  )

  const installInstructions = computed(() =>
    isIos.value
      ? t('home.installHintIos')
      : isFirefox.value
        ? t('home.installHintFirefox')
        : t('home.installHintDefault'),
  )

  function checkStandaloneMode() {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true

    isInstalled.value = isStandalone
  }

  function onBeforeInstallPrompt(event) {
    event.preventDefault()
    deferredInstallPrompt.value = event
  }

  function onAppInstalled() {
    isInstalled.value = true
    deferredInstallPrompt.value = null
    installHintVisible.value = false
    installStatusMessage.value = t('home.installStatusInstalled')
  }

  async function handleInstallClick() {
    installStatusMessage.value = ''

    if (isInstalled.value) {
      installStatusMessage.value = t('home.installStatusInstalled')
      installHintVisible.value = true
      return
    }

    if (deferredInstallPrompt.value !== null) {
      const promptEvent = deferredInstallPrompt.value
      promptEvent.prompt()

      const choice = await promptEvent.userChoice

      if (choice.outcome === 'accepted') {
        installStatusMessage.value = t('home.installHintDefault')
      }

      deferredInstallPrompt.value = null
      return
    }

    installHintVisible.value = true
  }

  onMounted(() => {
    const userAgent = window.navigator.userAgent.toLowerCase()

    isIos.value =
      /iphone|ipad|ipod/.test(userAgent) &&
      !window.matchMedia('(display-mode: standalone)').matches
    isFirefox.value = userAgent.includes('firefox')
    checkStandaloneMode()

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.removeEventListener('appinstalled', onAppInstalled)
  })

  return {
    installButtonLabel,
    installHintVisible,
    installInstructions,
    installStatusMessage,
    isInstalled,
    handleInstallClick,
  }
}
