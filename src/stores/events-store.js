import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { confirmEvent, createEvent, deleteEvent, listEvents, updateEvent } from 'src/services/events-db'
import { createPurchaseEventWithAnimals } from 'src/services/purchase-events-db'
import { eventIncludesAnimal } from 'src/utils/event-records'

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

  function findEventById(id) {
    return events.value.find((event) => event.id === id) ?? null
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
    const { expectedBirthPlan = null, ...primaryPayload } = payload ?? {}
    const createdEvents = []
    let event = await createEvent(primaryPayload)
    createdEvents.push(event)

    if (
      primaryPayload.type === 'breeding'
      && expectedBirthPlan?.enabled
      && expectedBirthPlan.date
      && expectedBirthPlan.animalId
    ) {
      const linkedEvent = await createEvent({
        animalId: expectedBirthPlan.animalId,
        animalIds: [expectedBirthPlan.animalId],
        scope: 'animals',
        type: 'expected_birth',
        linkedEventId: event.id,
        date: expectedBirthPlan.date,
        notes: '',
      })

      event = await updateEvent(event.id, { linkedEventId: linkedEvent.id })
      createdEvents[0] = event
      createdEvents.push(linkedEvent)
    }

    events.value = sortEvents([...createdEvents, ...events.value])
    return event
  }

  async function addPurchaseEvent(payload) {
    const { event, animals } = await createPurchaseEventWithAnimals(payload)
    events.value = sortEvents([event, ...events.value])
    return { event, animals }
  }

  async function editEvent(id, payload) {
    const existingEvent = findEventById(id)
    const { expectedBirthPlan = null, ...primaryPayload } = payload ?? {}
    let updatedEvent = await updateEvent(id, primaryPayload)
    const nextEvents = events.value.map((event) => (event.id === id ? updatedEvent : event))

    if (updatedEvent.type === 'breeding') {
      const linkedExpectedBirthId = existingEvent?.linkedEventId || updatedEvent.linkedEventId || ''

      if (expectedBirthPlan?.enabled && expectedBirthPlan.date && expectedBirthPlan.animalId) {
        if (linkedExpectedBirthId) {
          const updatedLinkedEvent = await updateEvent(linkedExpectedBirthId, {
            animalId: expectedBirthPlan.animalId,
            animalIds: [expectedBirthPlan.animalId],
            scope: 'animals',
            type: 'expected_birth',
            linkedEventId: updatedEvent.id,
            date: expectedBirthPlan.date,
            notes: '',
          })

          updatedEvent = await updateEvent(updatedEvent.id, { linkedEventId: updatedLinkedEvent.id })

          events.value = sortEvents(
            nextEvents.map((event) => {
              if (event.id === updatedEvent.id) {
                return updatedEvent
              }

              if (event.id === updatedLinkedEvent.id) {
                return updatedLinkedEvent
              }

              return event
            }),
          )

          return updatedEvent
        }

        const createdLinkedEvent = await createEvent({
          animalId: expectedBirthPlan.animalId,
          animalIds: [expectedBirthPlan.animalId],
          scope: 'animals',
          type: 'expected_birth',
          linkedEventId: updatedEvent.id,
          date: expectedBirthPlan.date,
          notes: '',
        })

        updatedEvent = await updateEvent(updatedEvent.id, { linkedEventId: createdLinkedEvent.id })
        events.value = sortEvents([createdLinkedEvent, ...nextEvents.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))])
        return updatedEvent
      }

      if (linkedExpectedBirthId) {
        await deleteEvent(linkedExpectedBirthId)
        updatedEvent = await updateEvent(updatedEvent.id, { linkedEventId: '' })
        events.value = sortEvents(
          nextEvents
            .filter((event) => event.id !== linkedExpectedBirthId)
            .map((event) => (event.id === updatedEvent.id ? updatedEvent : event)),
        )
        return updatedEvent
      }
    }

    events.value = sortEvents(nextEvents)
    return updatedEvent
  }

  async function removeEvent(id) {
    const event = findEventById(id)

    if (!event) {
      return
    }

    if (event.type === 'breeding' && event.linkedEventId) {
      await deleteEvent(event.linkedEventId)
      await deleteEvent(id)
      events.value = events.value.filter(
        (currentEvent) => currentEvent.id !== id && currentEvent.id !== event.linkedEventId,
      )
      return
    }

    if (event.type === 'expected_birth' && event.linkedEventId) {
      const linkedBreedingEvent = findEventById(event.linkedEventId)

      if (linkedBreedingEvent) {
        const updatedBreedingEvent = await updateEvent(linkedBreedingEvent.id, { linkedEventId: '' })
        await deleteEvent(id)
        events.value = sortEvents(
          events.value
            .filter((currentEvent) => currentEvent.id !== id)
            .map((currentEvent) => (currentEvent.id === updatedBreedingEvent.id ? updatedBreedingEvent : currentEvent)),
        )
        return
      }
    }

    await deleteEvent(id)
    events.value = events.value.filter((event) => event.id !== id)
  }

  async function confirmEventById(id) {
    const updatedEvent = await confirmEvent(id)
    events.value = sortEvents(
      events.value.map((event) => (event.id === id ? updatedEvent : event)),
    )
    return updatedEvent
  }

  function eventsForAnimal(animalId) {
    return events.value.filter((event) => eventIncludesAnimal(event, animalId))
  }

  return {
    errorMessage,
    events,
    isLoaded,
    isLoading,
    totalEvents,
    addEvent,
    addPurchaseEvent,
    confirmEventById,
    editEvent,
    eventsForAnimal,
    loadEvents,
    removeEvent,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEventsStore, import.meta.hot))
}
