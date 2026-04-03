import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { createEvent, deleteEvent, listEvents, updateEvent } from 'src/services/events-db'

export const useEventsStore = defineStore('events', () => {
  const events = ref([])
  const isLoaded = ref(false)
  const isLoading = ref(false)
  const errorMessage = ref('')

  const totalEvents = computed(() => events.value.length)

  function sortEvents(items) {
    return [...items].sort((left, right) => {
      const leftValue = left.date ?? left.updatedAt ?? left.createdAt ?? ''
      const rightValue = right.date ?? right.updatedAt ?? right.createdAt ?? ''

      return rightValue.localeCompare(leftValue)
    })
  }

  async function loadEvents() {
    isLoading.value = true
    errorMessage.value = ''

    try {
      events.value = sortEvents(await listEvents())
      isLoaded.value = true
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Failed to load events.'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function addEvent(payload) {
    const event = await createEvent(payload)
    events.value = sortEvents([event, ...events.value])
    return event
  }

  async function editEvent(id, payload) {
    const updatedEvent = await updateEvent(id, payload)
    events.value = sortEvents(
      events.value.map((event) => (event.id === id ? updatedEvent : event)),
    )
    return updatedEvent
  }

  async function removeEvent(id) {
    await deleteEvent(id)
    events.value = events.value.filter((event) => event.id !== id)
  }

  function eventsForAnimal(animalId) {
    return events.value.filter((event) => event.animalId === animalId)
  }

  return {
    errorMessage,
    events,
    isLoaded,
    isLoading,
    totalEvents,
    addEvent,
    editEvent,
    eventsForAnimal,
    loadEvents,
    removeEvent,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEventsStore, import.meta.hot))
}
