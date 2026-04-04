import { createId, STORE_NAMES, withStore } from 'src/services/app-db'
import { normalizeAnimalBreeder } from 'src/utils/breeder'
import { normalizeSpeciesLabel } from 'src/utils/species'

function normalizeStoredAnimal(animal) {
  return {
    ...animal,
    isBreeder: normalizeAnimalBreeder(animal?.isBreeder, animal?.purpose),
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

export async function createAnimal(input) {
  const timestamp = new Date().toISOString()
  const animal = {
    id: createId('animal'),
    tag: input.tag?.trim() ?? '',
    name: input.name?.trim() ?? '',
    species: normalizeSpeciesLabel(input.species),
    isBreeder: normalizeAnimalBreeder(input.isBreeder, input.purpose),
    sex: input.sex ?? 'unknown',
    birthDate: input.birthDate ?? '',
    status: input.status ?? 'active',
    damId: input.damId || '',
    sireId: input.sireId || '',
    notes: input.notes?.trim() ?? '',
    createdAt: timestamp,
    updatedAt: timestamp,
  }

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
    isBreeder: normalizeAnimalBreeder(input.isBreeder, input.purpose),
    sex: input.sex ?? 'unknown',
    birthDate: input.birthDate ?? '',
    status: input.status ?? 'active',
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
