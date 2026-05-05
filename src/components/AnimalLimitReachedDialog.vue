<template>
  <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
    <q-card class="app-dialog-card" style="width: 100%; max-width: 420px">
      <q-card-section class="row items-start justify-between no-wrap">
        <div>
          <div class="text-overline text-weight-bold text-primary">{{ t('animals.overline') }}</div>
          <div class="text-h6 text-weight-bold">{{ t('animals.premiumBlockedTitle') }}</div>
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
        {{ t('animals.premiumBlocked') }}
      </q-card-section>

      <q-card-actions align="right" class="app-dialog-card__actions">
        <q-btn
          unelevated
          no-caps
          color="primary"
          text-color="white"
          :label="t('animals.goToAccount')"
          @click="onDialogOK"
        />
        <q-btn flat no-caps color="grey-7" :label="t('common.close')" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useDialogPluginComponent } from 'quasar'
import { useI18nText } from 'src/i18n'

defineEmits([
  ...useDialogPluginComponent.emits,
])

const { t } = useI18nText()
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
</script>
