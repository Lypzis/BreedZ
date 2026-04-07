export function groupBreedingsByPartner(currentAnimalId, animals, events) {
  const animalsById = new Map(animals.map((animal) => [animal.id, animal]))
  const breedingGroups = new Map()

  for (const event of events) {
    if (event.type !== 'breeding' || !event.partnerAnimalId) {
      continue
    }

    let otherAnimalId = ''

    if (event.animalId === currentAnimalId) {
      otherAnimalId = event.partnerAnimalId
    } else if (event.partnerAnimalId === currentAnimalId) {
      otherAnimalId = event.animalId
    } else {
      continue
    }

    const existingGroup = breedingGroups.get(otherAnimalId) ?? {
      partnerAnimalId: otherAnimalId,
      partnerAnimal: animalsById.get(otherAnimalId) ?? null,
      count: 0,
      latestDate: '',
      events: [],
      offspringAnimals: [],
    }

    existingGroup.count += 1
    existingGroup.events.push(event)

    if ((event.date ?? '') > existingGroup.latestDate) {
      existingGroup.latestDate = event.date ?? ''
    }

    breedingGroups.set(otherAnimalId, existingGroup)
  }

  for (const group of breedingGroups.values()) {
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
