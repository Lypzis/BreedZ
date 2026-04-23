import { formatAnimalDisplayName, formatAnimalSpeciesBreed } from './animal-display.js'
import { normalizeEventAmount, normalizeEventRecord } from './event-records.js'
import { getCurrentLocaleValue } from '../i18n/index.js'

export function getEventAnimalIds(event = {}) {
  return normalizeEventRecord(event).animalIds
}

export function getEventAnimals(event = {}, resolveAnimalById = () => null) {
  return getEventAnimalIds(event).map((id) => ({
    id,
    animal: resolveAnimalById(id),
  }))
}

export function formatEventAnimalsSummary(
  event = {},
  resolveAnimalById = () => null,
  { maxNames = 2 } = {},
) {
  const names = getEventAnimals(event, resolveAnimalById)
    .map(({ animal }) => formatAnimalDisplayName(animal))

  if (names.length === 0) {
    return formatAnimalDisplayName(null)
  }

  if (names.length <= maxNames) {
    return names.join(', ')
  }

  return `${names.slice(0, maxNames).join(', ')} +${names.length - maxNames}`
}

export function formatEventSpeciesBreedSummary(event = {}, resolveAnimalById = () => null) {
  const labels = getEventAnimals(event, resolveAnimalById)
    .map(({ animal }) => formatAnimalSpeciesBreed(animal, { includeFallback: false }))
    .filter(Boolean)

  return [...new Set(labels)].join(', ')
}

export function formatEventAmount(value, locale = getCurrentLocaleValue()) {
  const amount = normalizeEventAmount(value)

  if (amount == null) {
    return ''
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
