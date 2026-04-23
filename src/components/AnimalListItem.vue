<template>
  <q-item
    :clickable="clickable"
    :class="itemClass"
    @click="emitOpen"
  >
    <q-item-section avatar>
      <q-avatar color="primary" text-color="white" :icon="avatarIcon" />
    </q-item-section>

    <q-item-section>
      <q-item-label class="text-weight-medium">
        {{ animalDisplayName }}
      </q-item-label>
      <div v-if="hasChips" class="row q-gutter-xs q-mt-xs">
        <q-chip
          v-if="showBreeder && animal.isBreeder"
          square
          dense
          color="info"
          text-color="white"
          class="animal-list-item__chip"
        >
          {{ t('common.reproducer') }}
        </q-chip>
        <q-chip
          v-if="showStatus"
          square
          dense
          :color="statusColor"
          text-color="white"
          class="animal-list-item__chip"
        >
          {{ statusLabel }}
        </q-chip>
      </div>
      <q-item-label v-if="captionText" caption>
        {{ captionText }}
      </q-item-label>
    </q-item-section>

    <q-item-section v-if="detailTarget || $slots.actions" side :top="sideTop">
      <div class="column items-end q-gutter-sm">
        <div class="row q-gutter-xs">
          <q-btn
            v-if="detailTarget"
            flat
            round
            dense
            color="primary"
            icon="visibility"
            :aria-label="t('animals.viewAnimal')"
            :title="t('animals.viewAnimal')"
            :to="detailTarget"
            @click.stop
          />
          <slot name="actions" :animal="animal" />
        </div>
      </div>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { computed } from 'vue'
import { useI18nText } from 'src/i18n'
import { formatAnimalDisplayName, formatAnimalSpeciesBreed } from 'src/utils/animal-display'
import { formatAgeLabel, formatDisplayDate } from 'src/utils/dates'
import { formatAnimalSex } from 'src/utils/parent-candidates'

const props = defineProps({
  animal: {
    type: Object,
    required: true,
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
  captionSuffix: {
    type: String,
    default: '',
  },
  showAge: {
    type: Boolean,
    default: true,
  },
  showSex: {
    type: Boolean,
    default: true,
  },
  showStatus: {
    type: Boolean,
    default: true,
  },
  showBreeder: {
    type: Boolean,
    default: true,
  },
  sideTop: {
    type: Boolean,
    default: false,
  },
  avatarIcon: {
    type: String,
    default: 'pets',
  },
})

const emit = defineEmits(['open'])
const { t } = useI18nText()

const animalDisplayName = computed(() => formatAnimalDisplayName(props.animal))
const animalSummary = computed(() => formatAnimalSpeciesBreed(props.animal))
const sexLabel = computed(() => props.showSex ? formatAnimalSex(props.animal.sex) : '')
const ageSummary = computed(() => {
  if (!props.showAge || !props.animal.birthDate) {
    return ''
  }

  return formatAgeLabel(props.animal.birthDate) || formatDate(props.animal.birthDate)
})
const captionText = computed(() =>
  [
    animalSummary.value,
    sexLabel.value,
    ageSummary.value,
    props.captionSuffix,
  ].filter(Boolean).join(' • '),
)
const statusLabel = computed(() => t(`common.status.${props.animal.status}`))
const hasChips = computed(() => (props.showBreeder && props.animal.isBreeder) || props.showStatus)
const statusColor = computed(() => {
  if (props.animal.status === 'sold') {
    return 'accent'
  }

  if (props.animal.status === 'dead') {
    return 'negative'
  }

  return 'primary'
})

function formatDate(value) {
  if (!value) {
    return ''
  }

  return formatDisplayDate(value)
}

function emitOpen() {
  if (!props.clickable) {
    return
  }

  emit('open', props.animal)
}
</script>

<style scoped>
.animal-list-item__chip {
  margin-left: 0;
}
</style>
