import { normalizeEventRecord } from './event-records.js'

export function groupBreedingsByPartner(currentAnimalId, animals, events) {
  const animalsById = new Map(animals.map((animal) => [animal.id, animal]))
  const breedingGroups = new Map()
  const normalizedEvents = events.map((event) => normalizeEventRecord(event))

  for (const event of normalizedEvents) {
    if (
      event.type !== 'breeding'
      || event.animalIds.length < 2
      || !event.animalIds.includes(currentAnimalId)
    ) {
      continue
    }

    const otherAnimalId = event.animalIds.find((animalId) => animalId !== currentAnimalId) ?? ''

    if (!otherAnimalId) {
      continue
    }

    const existingGroup = breedingGroups.get(otherAnimalId) ?? {
      partnerAnimalId: otherAnimalId,
      partnerAnimal: animalsById.get(otherAnimalId) ?? null,
      count: 0,
      latestDate: '',
      latestEvent: null,
      events: [],
      offspringAnimals: [],
      expectedBirthEvent: null,
      pregnancyCheckEvent: null,
    }

    existingGroup.count += 1
    existingGroup.events.push(event)

    if ((event.date ?? '') > existingGroup.latestDate) {
      existingGroup.latestDate = event.date ?? ''
      existingGroup.latestEvent = event
    }

    breedingGroups.set(otherAnimalId, existingGroup)
  }

  for (const group of breedingGroups.values()) {
    const breedingEventIds = new Set(group.events.map((event) => event.id).filter(Boolean))
    const latestBreedingEventId = group.latestEvent?.id ?? ''

    group.expectedBirthEvent = normalizedEvents
      .filter((event) =>
        event.type === 'expected_birth'
        && (
          (latestBreedingEventId && event.linkedEventId === latestBreedingEventId)
          || (group.latestEvent?.linkedEventId && event.id === group.latestEvent.linkedEventId)
        ),
      )
      .sort((left, right) => String(right.date ?? '').localeCompare(String(left.date ?? '')))[0] ?? null

    group.pregnancyCheckEvent = normalizedEvents
      .filter((event) =>
        event.type === 'pregnancy_check'
        && breedingEventIds.has(event.details?.linkedBreedingEventId),
      )
      .sort((left, right) => String(right.date ?? '').localeCompare(String(left.date ?? '')))[0] ?? null

    group.offspringAnimals = animals
      .filter((animal) =>
        (animal.damId === currentAnimalId && animal.sireId === group.partnerAnimalId)
        || (animal.sireId === currentAnimalId && animal.damId === group.partnerAnimalId),
      )
      .sort((left, right) => {
        const leftValue = left.birthDate || left.updatedAt || left.createdAt || ''
        const rightValue = right.birthDate || right.updatedAt || right.createdAt || ''

        return rightValue.localeCompare(leftValue)
      })
  }

  return [...breedingGroups.values()].sort((left, right) => {
    const leftDate = left.latestDate || ''
    const rightDate = right.latestDate || ''

    return rightDate.localeCompare(leftDate)
  })
}
