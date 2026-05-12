const HERD_SCOPE_EVENT_TYPES = new Set([
  'feed_cost',
  'labor_cost',
  'supply_cost',
  'maintenance_cost',
  'other_expense',
  'other_income',
])

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
  if (HERD_SCOPE_EVENT_TYPES.has(type)) {
    return 'optionalMulti'
  }

  if (type === 'breeding') {
    return 'breeding'
  }

  if (
    type === 'birth'
    || type === 'expected_birth'
    || type === 'pregnancy_check'
    || type === 'breeding_failed'
    || type === 'abortion'
    || type === 'weaning'
  ) {
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

  if (selectionMode === 'optionalMulti') {
    return uniqueIds(animalIds)
  }

  if (selectionMode === 'breeding') {
    return uniqueIds([fixedAnimalId || animalId, partnerAnimalId])
  }

  if (selectionMode === 'single') {
    return uniqueIds([fixedAnimalId || animalId])
  }

  return uniqueIds(animalIds)
}

export function getEventAmountLabelKey(type) {
  if (type === 'sale' || type === 'purchase') {
    return 'events.price'
  }

  if (
    type === 'vaccination'
    || type === 'health_issue'
    || type === 'feed_cost'
    || type === 'labor_cost'
    || type === 'supply_cost'
    || type === 'maintenance_cost'
    || type === 'other_expense'
  ) {
    return 'events.cost'
  }

  return 'events.amount'
}
