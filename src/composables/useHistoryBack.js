import { computed, unref } from 'vue'

function resolveInAppBackTarget(currentFullPath) {
  if (typeof window === 'undefined') {
    return null
  }

  const back = window.history.state?.back

  if (typeof back !== 'string' || !back) {
    return null
  }

  try {
    const url = new URL(back, window.location.origin)

    if (url.origin !== window.location.origin) {
      return null
    }

    const target = `${url.pathname}${url.search}${url.hash}`

    if (!target.startsWith('/') || target === currentFullPath) {
      return null
    }

    return target
  } catch {
    return null
  }
}

export function useHistoryAwareBack({
  route,
  router,
  fallbackTarget,
  fallbackLabel,
  genericLabel,
}) {
  const historyBackTarget = computed(() => resolveInAppBackTarget(route.fullPath))
  const hasHistoryBack = computed(() => Boolean(historyBackTarget.value))
  const backLabel = computed(() => (
    hasHistoryBack.value ? unref(genericLabel) : unref(fallbackLabel)
  ))

  async function navigateBack() {
    if (hasHistoryBack.value) {
      router.back()
      return
    }

    await router.push(unref(fallbackTarget))
  }

  return {
    backLabel,
    hasHistoryBack,
    historyBackTarget,
    navigateBack,
  }
}
