import { formatAnimalDisplayName } from './animal-display.js'

function normalizeValue(value) {
  return String(value || '').trim().toLowerCase()
}

function getOppositeSex(sex) {
  if (sex === 'female') {
    return 'male'
  }

  if (sex === 'male') {
    return 'female'
  }

  return ''
}

export function filterBreedingPartnerCandidates({
  animals,
  animalId = '',
  currentPartnerId = '',
  query = '',
}) {
  const sourceAnimal = animals.find((animal) => animal.id === animalId) ?? null
  const normalizedQuery = normalizeValue(query)
  const sourceSpecies = normalizeValue(sourceAnimal?.species)
  const requiredSex = getOppositeSex(sourceAnimal?.sex)

  return animals
    .filter((animal) => animal.id !== animalId)
    .filter((animal) => animal.status === 'active' || animal.id === currentPartnerId)
    .filter((animal) => {
      if (animal.id === currentPartnerId || !sourceSpecies) {
        return true
      }

      const candidateSpecies = normalizeValue(animal.species)
      return !candidateSpecies || candidateSpecies === sourceSpecies
    })
    .filter((animal) => {
      if (animal.id === currentPartnerId || !requiredSex) {
        return true
      }

      return animal.sex === 'unknown' || animal.sex === requiredSex
    })
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

export function validateBreedingPartnerSelection({
  animals,
  animalId = '',
  partnerAnimalId = '',
}) {
  if (!partnerAnimalId) {
    return 'events.breedingPartnerRequired'
  }

  if (animalId === partnerAnimalId) {
    return 'events.breedingPartnerSameAnimal'
  }

  const sourceAnimal = animals.find((animal) => animal.id === animalId) ?? null
  const partnerAnimal = animals.find((animal) => animal.id === partnerAnimalId) ?? null

  if (!sourceAnimal || !partnerAnimal) {
    return 'events.breedingPartnerRequired'
  }

  if (partnerAnimal.status !== 'active') {
    return 'events.breedingPartnerMustBeActive'
  }

  const sourceSpecies = normalizeValue(sourceAnimal.species)
  const partnerSpecies = normalizeValue(partnerAnimal.species)

  if (sourceSpecies && partnerSpecies && sourceSpecies !== partnerSpecies) {
    return 'events.breedingPartnerSpeciesMismatch'
  }

  if (
    sourceAnimal.sex !== 'unknown'
    && partnerAnimal.sex !== 'unknown'
    && sourceAnimal.sex === partnerAnimal.sex
  ) {
    return 'events.breedingPartnerSexMismatch'
  }

  return ''
}
