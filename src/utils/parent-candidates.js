import { formatAnimalDisplayName } from './animal-display.js'
import { t } from '../i18n/index.js'

export function formatAnimalSex(sex) {
  if (sex === 'female') {
    return t('common.sex.female')
  }

  if (sex === 'male') {
    return t('common.sex.male')
  }

  return t('common.sex.unknown')
}

export function filterAnimalCandidates({
  animals,
  activeOnly = false,
  currentAnimalId = '',
  species = '',
  requiredSex = '',
  query = '',
}) {
  const normalizedQuery = query.trim().toLowerCase()
  const normalizedSpecies = species.trim().toLowerCase()

  return animals
    .filter((animal) => animal.id !== currentAnimalId)
    .filter((animal) => (activeOnly ? animal.status === 'active' : true))
    .filter((animal) => (requiredSex ? animal.sex === requiredSex : true))
    .filter((animal) =>
      normalizedSpecies ? animal.species?.trim().toLowerCase() === normalizedSpecies : true,
    )
    .filter((animal) => {
      if (!normalizedQuery) {
        return true
      }

      return [animal.tag, animal.name, animal.species]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    })
    .sort((left, right) => formatAnimalDisplayName(left).localeCompare(formatAnimalDisplayName(right)))
}

export function filterParentCandidates({
  animals,
  currentAnimalId = '',
  species = '',
  requiredSex = '',
  query = '',
}) {
  return filterAnimalCandidates({
    animals,
    activeOnly: true,
    currentAnimalId,
    species,
    requiredSex,
    query,
  })
}
