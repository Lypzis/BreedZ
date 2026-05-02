<template>
  <q-item
    :clickable="clickable"
    :class="itemClass"
    @click="emitOpen"
  >
    <q-item-section avatar>
      <q-avatar
        :color="eventMeta.color"
        text-color="white"
        :icon="eventMeta.icon"
      />
    </q-item-section>

    <q-item-section>
      <q-item-label class="text-weight-medium">
        {{ titleText }}
      </q-item-label>
      <q-item-label v-if="captionText" caption>
        {{ captionText }}
      </q-item-label>
      <q-item-label v-if="affectedAnimalsText" caption>
        {{ affectedAnimalsText }}
      </q-item-label>
      <q-item-label v-if="notesText" caption class="text-grey-7">
        {{ notesText }}
      </q-item-label>
    </q-item-section>

    <q-item-section v-if="detailTarget || $slots.actions" side :top="sideTop">
      <div class="row q-gutter-xs">
        <q-btn
          v-if="detailTarget"
          flat
          round
          dense
          color="primary"
          icon="visibility"
          :aria-label="t('events.viewEvent')"
          :title="t('events.viewEvent')"
          :to="detailTarget"
          @click.stop
        />
        <slot name="actions" :event="event" />
      </div>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { computed } from 'vue'
import { getEventTypeMeta } from 'src/constants/events'
import { useI18nText } from 'src/i18n'
import {
  formatEventAmount,
  formatEventAnimalsSummary,
  formatEventSpeciesBreedSummary,
  getEventAnimalIds,
} from 'src/utils/event-display'
import { isEventNeedingConfirmation, isFutureScheduledEvent } from 'src/utils/event-records'
import { getEventAmountLabelKey } from 'src/utils/event-participants'
import { formatDisplayDate } from 'src/utils/dates'

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
  animalResolver: {
    type: Function,
    default: () => null,
  },
  detailTarget: {
    type: [Object, String],
    default: null,
  },
  clickable: {
    type: Boolean,
    default: true,
  },
  itemClass: {
    type: String,
    default: '',
  },
  titleMode: {
    type: String,
    default: 'eventForAnimals',
  },
  showAnimalMeta: {
    type: Boolean,
    default: true,
  },
  showDate: {
    type: Boolean,
    default: true,
  },
  showAffectedAnimals: {
    type: Boolean,
    default: false,
  },
  showNotes: {
    type: Boolean,
    default: true,
  },
  notesFallback: {
    type: String,
    default: '',
  },
  maxAnimalNames: {
    type: Number,
    default: 2,
  },
  sideTop: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['open'])
const { t } = useI18nText()

const eventMeta = computed(() => getEventTypeMeta(props.event.type))
const animalSummary = computed(() =>
  formatEventAnimalsSummary(props.event, props.animalResolver, {
    herdLabel: t('events.wholeHerd'),
    maxNames: props.maxAnimalNames,
  }),
)
const eventAmountText = computed(() => {
  const amount = formatEventAmount(props.event.amount)

  if (!amount) {
    return ''
  }

  return `${t(getEventAmountLabelKey(props.event.type))}: ${amount}`
})
const titleText = computed(() => {
  if (props.titleMode === 'type') {
    return eventMeta.value.label
  }

  return t('common.eventForAnimal', {
    eventType: eventMeta.value.label,
    animal: animalSummary.value,
  })
})
const captionText = computed(() => {
  const parts = []
  const stateText = isEventNeedingConfirmation(props.event)
    ? t('events.needsConfirmationState')
    : isFutureScheduledEvent(props.event)
      ? t('events.scheduledState')
      : ''
  const dateText = props.showDate
    ? formatDisplayDate(props.event.date) || t('common.dateNotSet')
    : ''
  const animalMeta = props.showAnimalMeta
    ? formatEventSpeciesBreedSummary(props.event, props.animalResolver)
    : ''

  if (stateText) {
    parts.push(stateText)
  }

  if (dateText) {
    parts.push(dateText)
  }

  if (animalMeta) {
    parts.push(animalMeta)
  }

  if (eventAmountText.value) {
    parts.push(eventAmountText.value)
  }

  return parts.join(' • ')
})
const affectedAnimalsText = computed(() => {
  if (!props.showAffectedAnimals || getEventAnimalIds(props.event).length <= 1) {
    return ''
  }

  return `${t('events.affectedAnimals')}: ${animalSummary.value}`
})
const notesText = computed(() => {
  if (!props.showNotes) {
    return ''
  }

  return props.event.notes || props.notesFallback
})

function emitOpen() {
  if (!props.clickable) {
    return
  }

  emit('open', props.event)
}
</script>
