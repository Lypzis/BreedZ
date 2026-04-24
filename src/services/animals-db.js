import { createId, STORE_NAMES, withStore } from './app-db.js'
import { normalizeAnimalBreeder } from '../utils/breeder.js'
import { normalizeBreedLabel, normalizeSpeciesLabel } from '../utils/species.js'

function normalizeStatusValue(value) {
  const normalizedValue = String(value || '').trim().toLowerCase()

  if (normalizedValue === 'sold' || normalizedValue === 'dead' || normalizedValue === 'active') {
    return normalizedValue
  }

  return 'active'
}

function normalizeStoredAnimal(animal) {
  return {
    ...animal,
    weight: typeof animal?.weight === 'string' ? animal.weight.trim() : '',
    isBreeder: normalizeAnimalBreeder(animal?.isBreeder, animal?.purpose),
    baseStatus: normalizeStatusValue(animal?.baseStatus ?? animal?.status),
    status: normalizeStatusValue(animal?.status ?? animal?.baseStatus),
  }
}

export async function listAnimals() {
  const animals = (await withStore(STORE_NAMES.animals, 'readonly', (store) => store.getAll())) ?? []

  return animals.map(normalizeStoredAnimal).sort((left, right) => {
    const leftValue = left.updatedAt ?? left.createdAt ?? ''
    const rightValue = right.updatedAt ?? right.createdAt ?? ''

    return rightValue.localeCompare(leftValue)
  })
}

export async function hasSavedAnimals() {
  const count = await withStore(STORE_NAMES.animals, 'readonly', (store) => store.count())

  return Number(count ?? 0) > 0
}

export function buildAnimalRecord(input, options = {}) {
  const timestamp = options.timestamp ?? new Date().toISOString()

  return {
    id: options.id ?? createId('animal'),
    tag: input.tag?.trim() ?? '',
    name: input.name?.trim() ?? '',
    species: normalizeSpeciesLabel(input.species),
    breed: normalizeBreedLabel(input.breed),
    weight: input.weight?.trim() ?? '',
    isBreeder: normalizeAnimalBreeder(input.isBreeder, input.purpose),
    sex: input.sex ?? 'unknown',
    birthDate: input.birthDate ?? '',
    baseStatus: normalizeStatusValue(input.status),
    status: normalizeStatusValue(input.status),
    damId: input.damId || '',
    sireId: input.sireId || '',
    notes: input.notes?.trim() ?? '',
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export async function createAnimal(input) {
  const animal = buildAnimalRecord(input)

  await withStore(STORE_NAMES.animals, 'readwrite', (store) => store.put(animal))

  return animal
}

export async function updateAnimal(id, input) {
  const existingAnimal = await getAnimal(id)

  if (!existingAnimal) {
    throw new Error('Animal not found.')
  }

  const updatedAnimal = {
    ...existingAnimal,
    tag: input.tag?.trim() ?? '',
    name: input.name?.trim() ?? '',
    species: normalizeSpeciesLabel(input.species),
    breed: normalizeBreedLabel(input.breed),
    weight: input.weight?.trim() ?? '',
    isBreeder: normalizeAnimalBreeder(input.isBreeder, input.purpose),
    sex: input.sex ?? 'unknown',
    birthDate: input.birthDate ?? '',
    baseStatus: normalizeStatusValue(input.status ?? existingAnimal.baseStatus),
    status: normalizeStatusValue(input.status ?? existingAnimal.baseStatus),
    damId: input.damId || '',
    sireId: input.sireId || '',
    notes: input.notes?.trim() ?? '',
    updatedAt: new Date().toISOString(),
  }

  await withStore(STORE_NAMES.animals, 'readwrite', (store) => store.put(updatedAnimal))

  return updatedAnimal
}

export async function getAnimal(id) {
  if (!id) {
    return null
  }

  const animal = (await withStore(STORE_NAMES.animals, 'readonly', (store) => store.get(id))) ?? null

  return animal ? normalizeStoredAnimal(animal) : null
}

export async function deleteAnimal(id) {
  if (!id) {
    return
  }

  await withStore(STORE_NAMES.animals, 'readwrite', (store) => store.delete(id))
}

export async function touchAnimalUpdatedAt(id) {
  const existingAnimal = await getAnimal(id)

  if (!existingAnimal) {
    return null
  }

  const updatedAnimal = {
    ...existingAnimal,
    updatedAt: new Date().toISOString(),
  }

  await withStore(STORE_NAMES.animals, 'readwrite', (store) => store.put(updatedAnimal))

  return updatedAnimal
}

export async function clearParentReferences(parentId) {
  if (!parentId) {
    return
  }

  const animals = await listAnimals()
  const animalsToUpdate = animals.filter(
    (animal) => animal.damId === parentId || animal.sireId === parentId,
  )

  for (const animal of animalsToUpdate) {
    await withStore(STORE_NAMES.animals, 'readwrite', (store) =>
      store.put({
        ...animal,
        damId: animal.damId === parentId ? '' : animal.damId ?? '',
        sireId: animal.sireId === parentId ? '' : animal.sireId ?? '',
        updatedAt: new Date().toISOString(),
      }),
    )
  }
}
