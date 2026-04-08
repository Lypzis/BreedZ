import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  clearParentReferences,
  createAnimal,
  deleteAnimal,
  listAnimals,
  updateAnimal,
} from 'src/services/animals-db'
import { syncAnimalStatusesFromEvents } from 'src/services/animal-status-sync'
import { deleteEventsForAnimal } from 'src/services/events-db'
import { ANIMAL_LIMIT_REACHED_ERROR, canCreateAnimal } from 'src/utils/premium-limits'

export const useAnimalsStore = defineStore('animals', () => {
  const animals = ref([])
  const isLoaded = ref(false)
  const isLoading = ref(false)
  const errorMessage = ref('')

  const activeAnimals = computed(() => animals.value.filter((animal) => animal.status === 'active'))

  async function loadAnimals() {
    isLoading.value = true
    errorMessage.value = ''

    try {
      await syncAnimalStatusesFromEvents()
      animals.value = await listAnimals()
      isLoaded.value = true
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Failed to load animals.'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function addAnimal(payload, options = {}) {
    if (!canCreateAnimal(animals.value.length, options)) {
      const error = new Error(ANIMAL_LIMIT_REACHED_ERROR)
      error.code = ANIMAL_LIMIT_REACHED_ERROR
      throw error
    }

    const animal = await createAnimal(payload)
    animals.value = [animal, ...animals.value]
    return animal
  }

  async function editAnimal(id, payload) {
    const animal = await updateAnimal(id, payload)
    animals.value = animals.value.map((item) => (item.id === id ? animal : item))
    animals.value.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    return animal
  }

  async function removeAnimal(id) {
    await clearParentReferences(id)
    await deleteEventsForAnimal(id)
    await deleteAnimal(id)
    await loadAnimals()
  }

  function getAnimalById(id) {
    return animals.value.find((animal) => animal.id === id) ?? null
  }

  function getOffspringForAnimal(id) {
    return animals.value
      .filter((animal) => animal.id !== id && (animal.damId === id || animal.sireId === id))
      .sort((left, right) => {
        const leftValue = left.birthDate || left.updatedAt || left.createdAt || ''
        const rightValue = right.birthDate || right.updatedAt || right.createdAt || ''

        return rightValue.localeCompare(leftValue)
      })
  }

  return {
    activeAnimals,
    animals,
    errorMessage,
    isLoaded,
    isLoading,
    addAnimal,
    editAnimal,
    getAnimalById,
    getOffspringForAnimal,
    loadAnimals,
    removeAnimal,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAnimalsStore, import.meta.hot))
}
