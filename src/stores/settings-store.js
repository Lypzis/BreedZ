import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'

const SETTINGS_STORAGE_KEY = 'breedz-settings'
const DEFAULT_WEIGHT_UNIT = 'kg'

function normalizeWeightUnit(value) {
  return value === 'lb' ? 'lb' : DEFAULT_WEIGHT_UNIT
}

function readStoredSettings() {
  if (typeof window === 'undefined') {
    return { weightUnit: DEFAULT_WEIGHT_UNIT }
  }

  try {
    const rawValue = window.localStorage.getItem(SETTINGS_STORAGE_KEY)

    if (!rawValue) {
      return { weightUnit: DEFAULT_WEIGHT_UNIT }
    }

    const parsed = JSON.parse(rawValue)

    return {
      weightUnit: normalizeWeightUnit(parsed?.weightUnit),
    }
  } catch {
    return { weightUnit: DEFAULT_WEIGHT_UNIT }
  }
}

function persistSettings(settings) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}

export const useSettingsStore = defineStore('settings', () => {
  const initialSettings = readStoredSettings()
  const weightUnit = ref(initialSettings.weightUnit)

  function setWeightUnit(value) {
    weightUnit.value = normalizeWeightUnit(value)
    persistSettings({
      weightUnit: weightUnit.value,
    })
  }

  return {
    weightUnit,
    setWeightUnit,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}
