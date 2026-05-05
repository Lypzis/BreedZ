const DEVICE_ID_STORAGE_KEY = 'breedz-device-id'

function createDeviceId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `device-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function getDeviceId() {
  if (typeof window === 'undefined') {
    return ''
  }

  const existingDeviceId = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY)

  if (existingDeviceId) {
    return existingDeviceId
  }

  const deviceId = createDeviceId()
  window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId)

  return deviceId
}
