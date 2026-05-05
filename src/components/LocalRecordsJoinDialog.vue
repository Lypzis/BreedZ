<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="app-dialog-card" style="width: 100%; max-width: 420px">
      <q-card-section class="row items-start justify-between no-wrap">
        <div>
          <div class="text-overline text-weight-bold text-primary">{{ t('settings.syncOverline') }}</div>
          <div class="text-h6 text-weight-bold">{{ t('settings.localRecordsJoinTitle') }}</div>
        </div>
        <q-btn
          flat
          round
          dense
          icon="close"
          :aria-label="t('common.closeDialog')"
          :title="t('common.closeDialog')"
          @click="onDialogCancel"
        />
      </q-card-section>

      <q-card-section class="app-dialog-card__body q-pt-none text-body2 text-grey-8">
        {{ t('settings.localRecordsJoinMessage', { animals, events }) }}
      </q-card-section>

      <q-card-actions align="right" class="app-dialog-card__actions">
        <q-btn
          unelevated
          color="primary"
          text-color="white"
          :label="t('settings.localRecordsJoinConfirm')"
          @click="onDialogOK"
        />
        <q-btn flat color="primary" :label="t('settings.localRecordsJoinCancel')" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useDialogPluginComponent } from 'quasar'
import { useI18nText } from 'src/i18n'

defineProps({
  animals: {
    type: Number,
    default: 0,
  },
  events: {
    type: Number,
    default: 0,
  },
})

defineEmits([
  ...useDialogPluginComponent.emits,
])

const { t } = useI18nText()
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
</script>
