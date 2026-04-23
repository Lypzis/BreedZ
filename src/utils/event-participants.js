function uniqueIds(values = []) {
  const seen = new Set()
  const normalized = []

  for (const value of values) {
    const id = String(value || '').trim()

    if (!id || seen.has(id)) {
      continue
    }

    seen.add(id)
    normalized.push(id)
  }

  return normalized
}

export function getEventSelectionMode(type) {
  if (type === 'breeding') {
    return 'breeding'
  }

  if (type === 'birth') {
    return 'single'
  }

  return 'multi'
}

export function buildEventAnimalIds({
  type = '',
  animalId = '',
  animalIds = [],
  partnerAnimalId = '',
  fixedAnimalId = '',
} = {}) {
  const selectionMode = getEventSelectionMode(type)

  if (selectionMode === 'breeding') {
    return uniqueIds([fixedAnimalId || animalId, partnerAnimalId])
  }

  if (selectionMode === 'single') {
    return uniqueIds([fixedAnimalId || animalId])
  }

  return uniqueIds([
    fixedAnimalId,
    ...animalIds,
  ])
}

export function getEventAmountLabelKey(type) {
  if (type === 'sale' || type === 'purchase') {
    return 'events.price'
  }

  if (type === 'vaccination' || type === 'health_issue') {
    return 'events.cost'
  }

  return 'events.amount'
}
