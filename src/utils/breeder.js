export function normalizeAnimalBreeder(value, legacyPurpose = '') {
  if (typeof value === 'boolean') {
    return value
  }

  const normalized = String(value ?? '')
    .trim()
    .toLowerCase()

  if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
    return true
  }

  if (normalized === 'false' || normalized === '0' || normalized === 'no') {
    return false
  }

  return String(legacyPurpose ?? '')
    .trim()
    .toLowerCase() === 'breeding'
}
