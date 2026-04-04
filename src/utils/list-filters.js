import { getEventTypeMeta } from '../constants/events.js'
import { normalizeSpeciesLabel } from './species.js'

export function filterAnimalsList(animals, filters = {}) {
  const query = String(filters.searchTerm ?? '')
    .trim()
    .toLowerCase()
  const status = String(filters.status ?? '').trim().toLowerCase()
  const species = normalizeSpeciesLabel(filters.species).toLowerCase()
  const breedersOnly = Boolean(filters.breedersOnly)

  return animals.filter((animal) => {
    if (status && String(animal.status ?? '').toLowerCase() !== status) {
      return false
    }

    if (species && normalizeSpeciesLabel(animal.species).toLowerCase() !== species) {
      return false
    }

    if (breedersOnly && animal.isBreeder !== true) {
      return false
    }

    if (!query) {
      return true
    }

    return [animal.tag, animal.name, animal.species, animal.status, animal.isBreeder ? 'breeding' : 'cut'].some((value) =>
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

    const animal = resolveAnimalById(event.animalId)
    const haystack = [
      event.notes,
      getEventTypeMeta(event.type).label,
      animal?.tag,
      animal?.name,
      animal?.species,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(query)
  })
}
