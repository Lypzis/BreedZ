import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { confirmEvent, createEvent, deleteEvent, listEvents, updateEvent } from 'src/services/events-db'
import { createPurchaseEventWithAnimals } from 'src/services/purchase-events-db'
import { requestPremiumSync } from 'src/services/sync-scheduler'
import { EXPECTED_BIRTH_OUTCOME_TYPES, eventIncludesAnimal, isExpectedBirthResolved } from 'src/utils/event-records'

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

  async function resolveExpectedBirthWithOutcome(expectedBirthId, outcomeEvent) {
    const expectedBirthEvent = findEventById(expectedBirthId)

    if (!expectedBirthEvent || expectedBirthEvent.type !== 'expected_birth') {
      return null
    }

    if (isExpectedBirthResolved(expectedBirthEvent)) {
      return expectedBirthEvent
    }

    return updateEvent(expectedBirthEvent.id, {
      details: {
        ...(expectedBirthEvent.details ?? {}),
        resolutionStatus: 'resolved',
        outcomeType: outcomeEvent.type,
        linkedOutcomeEventId: outcomeEvent.id,
        resolvedAt: new Date().toISOString(),
      },
      confirmationStatus: 'confirmed',
    })
  }

  async function clearExpectedBirthResolutionForOutcome(outcomeEvent) {
    const expectedBirthId = outcomeEvent?.details?.linkedExpectedBirthEventId ?? ''

    if (!expectedBirthId) {
      return null
    }

    const expectedBirthEvent = findEventById(expectedBirthId)

    if (
      !expectedBirthEvent
      || expectedBirthEvent.type !== 'expected_birth'
      || expectedBirthEvent.details?.linkedOutcomeEventId !== outcomeEvent.id
    ) {
      return null
    }

    return updateEvent(expectedBirthEvent.id, {
      details: {
        ...(expectedBirthEvent.details ?? {}),
        resolutionStatus: '',
        outcomeType: '',
        linkedOutcomeEventId: '',
        resolvedAt: '',
      },
      confirmationStatus: 'pending',
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
    const { expectedBirthPlan = null, ...primaryPayload } = payload ?? {}
    const createdEvents = []
    let updatedExpectedBirth = null
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

    if (
      event.type === 'pregnancy_check'
      && event.details?.result === 'open'
      && event.details?.linkedExpectedBirthEventId
    ) {
      updatedExpectedBirth = await resolveExpectedBirthWithOutcome(
        event.details.linkedExpectedBirthEventId,
        event,
      )
    }

    events.value = sortEvents([
      ...createdEvents,
      ...events.value.map((currentEvent) =>
        currentEvent.id === updatedExpectedBirth?.id ? updatedExpectedBirth : currentEvent,
      ),
    ])
    requestPremiumSync('event-created')
    return event
  }

  async function addExpectedBirthOutcome(expectedBirthId, payload) {
    const expectedBirthEvent = findEventById(expectedBirthId)

    if (!expectedBirthEvent || expectedBirthEvent.type !== 'expected_birth') {
      throw new Error('Expected birth event not found.')
    }

    if (!EXPECTED_BIRTH_OUTCOME_TYPES.has(payload?.type) || payload.type === 'pregnancy_check') {
      throw new Error('Unsupported expected birth outcome.')
    }

    if (isExpectedBirthResolved(expectedBirthEvent)) {
      throw new Error('Expected birth is already resolved.')
    }

    const outcomeEvent = await createEvent({
      ...payload,
      linkedEventId: payload.linkedEventId || expectedBirthEvent.id,
      details: {
        ...(payload.details ?? {}),
        linkedExpectedBirthEventId: expectedBirthEvent.id,
        linkedBreedingEventId: expectedBirthEvent.linkedEventId ?? '',
      },
    })
    const updatedExpectedBirth = await resolveExpectedBirthWithOutcome(expectedBirthEvent.id, outcomeEvent)

    events.value = sortEvents([
      outcomeEvent,
      ...events.value.map((event) =>
        event.id === updatedExpectedBirth?.id ? updatedExpectedBirth : event,
      ),
    ])
    requestPremiumSync('expected-birth-resolved')

    return { outcomeEvent, expectedBirth: updatedExpectedBirth }
  }

  async function addPurchaseEvent(payload) {
    const { event, animals } = await createPurchaseEventWithAnimals(payload)
    events.value = sortEvents([event, ...events.value])
    requestPremiumSync('purchase-created')
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

          requestPremiumSync('event-updated')
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
        requestPremiumSync('event-updated')
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
        requestPremiumSync('event-updated')
        return updatedEvent
      }
    }

    events.value = sortEvents(nextEvents)
    requestPremiumSync('event-updated')
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
      requestPremiumSync('event-deleted')
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
        requestPremiumSync('event-deleted')
        return
      }
    }

    const updatedExpectedBirth = await clearExpectedBirthResolutionForOutcome(event)

    await deleteEvent(id)
    events.value = sortEvents(
      events.value
        .filter((currentEvent) => currentEvent.id !== id)
        .map((currentEvent) =>
          currentEvent.id === updatedExpectedBirth?.id ? updatedExpectedBirth : currentEvent,
        ),
    )
    requestPremiumSync('event-deleted')
  }

  async function confirmEventById(id) {
    const updatedEvent = await confirmEvent(id)
    events.value = sortEvents(
      events.value.map((event) => (event.id === id ? updatedEvent : event)),
    )
    requestPremiumSync('event-confirmed')
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
    addExpectedBirthOutcome,
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
