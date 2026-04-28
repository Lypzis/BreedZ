import { getEventTypeMeta } from '../constants/events.js'
import { getEventAnimalIds } from './event-records.js'
import { normalizeBreedLabel, normalizeSpeciesLabel } from './species.js'

export function filterAnimalsList(animals, filters = {}) {
  const query = String(filters.searchTerm ?? '')
    .trim()
    .toLowerCase()
  const status = String(filters.status ?? '').trim().toLowerCase()
  const species = normalizeSpeciesLabel(filters.species).toLowerCase()
  const breed = normalizeBreedLabel(filters.breed).toLowerCase()
  const breedersOnly = Boolean(filters.breedersOnly)

  return animals.filter((animal) => {
    if (status && String(animal.status ?? '').toLowerCase() !== status) {
      return false
    }

    if (species && normalizeSpeciesLabel(animal.species).toLowerCase() !== species) {
      return false
    }

    if (breed && normalizeBreedLabel(animal.breed).toLowerCase() !== breed) {
      return false
    }

    if (breedersOnly && animal.isBreeder !== true) {
      return false
    }

    if (!query) {
      return true
    }

    return [animal.tag, animal.name, animal.species, animal.breed, animal.status, animal.isBreeder ? 'breeding' : 'cut'].some((value) =>
      String(value ?? '')
        .toLowerCase()
        .includes(query),
    )
  })
}

export function filterEventsList(events, resolveAnimalById, filters = {}) {
  const query = String(filters.searchTerm ?? '')
    .trim()
    .toLowerCase()
  const eventType = String(filters.eventType ?? '').trim().toLowerCase()
  const startDate = String(filters.startDate ?? '').trim()
  const endDate = String(filters.endDate ?? '').trim()

  return events.filter((event) => {
    if (eventType && String(event.type ?? '').toLowerCase() !== eventType) {
      return false
    }

    if (startDate && String(event.date ?? '') < startDate) {
      return false
    }

    if (endDate && String(event.date ?? '') > endDate) {
      return false
    }

    if (!query) {
      return true
    }

    const relatedAnimals = getEventAnimalIds(event)
      .map((animalId) => resolveAnimalById(animalId))
      .filter(Boolean)

    const haystack = [
      event.notes,
      event.amount,
      getEventTypeMeta(event.type).label,
      ...relatedAnimals.flatMap((animal) => [
        animal?.tag,
        animal?.name,
        animal?.species,
        animal?.breed,
      ]),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(query)
  })
}
