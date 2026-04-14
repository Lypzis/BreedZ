import { t } from '../i18n/index.js'

export function formatAnimalDisplayName(animal, options = {}) {
  if (!animal) {
    return options.missingLabel ?? t('common.unknownAnimal')
  }

  const tag = animal.tag?.trim() ?? ''
  const name = animal.name?.trim() ?? ''

  if (name && tag) {
    return `${name} - ${tag}`
  }

  return tag || name || (options.emptyLabel ?? t('common.unnamedAnimal'))
}

export function formatAnimalSpeciesBreed(animal, options = {}) {
  const parts = []

  if (animal?.species) {
    parts.push(animal.species)
  } else if (options.includeFallback !== false) {
    parts.push(options.missingSpeciesLabel ?? t('common.speciesNotSet'))
  }

  if (animal?.breed) {
    parts.push(animal.breed)
  }

  return parts.join(' • ')
}
