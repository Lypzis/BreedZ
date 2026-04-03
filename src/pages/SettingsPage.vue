<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <q-card flat>
          <q-card-section>
            <div class="text-overline text-weight-bold text-primary">{{ t('settings.overline') }}</div>
            <div class="text-h4 text-weight-bold q-mt-sm q-mb-sm">{{ t('settings.title') }}</div>
            <div class="text-body1 text-grey-7">
              {{ t('settings.description') }}
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="row q-col-gutter-md">
              

              <div class="col-12 col-md-4">
                <q-banner rounded class="bg-green-1 text-primary">
                  <template #avatar>
                    <q-icon name="download" color="primary" />
                  </template>
                  <div class="text-subtitle2 text-weight-bold">{{ t('settings.exportTitle') }}</div>
                  <div class="text-caption text-grey-8 q-mt-xs">
                    {{ t('settings.exportDescription') }}
                  </div>
                  <q-btn
                    unelevated
                    color="primary"
                    :label="t('settings.exportJson')"
                    icon="download"
                    class="q-mt-md"
                    :loading="isExporting"
                    @click="handleExport"
                  />
                </q-banner>
              </div>

              <div class="col-12 col-md-4">
                <q-banner rounded class="bg-grey-1 text-grey-8">
                  <template #avatar>
                    <q-icon name="upload_file" color="primary" />
                  </template>
                  <div class="text-subtitle2 text-weight-bold text-primary">{{ t('settings.importTitle') }}</div>
                  <div class="text-caption q-mt-xs">
                    {{ t('settings.importDescription') }}
                  </div>

                  <q-file
                    v-model="selectedBackupFile"
                    outlined
                    dense
                    clearable
                    accept=".json,application/json"
                    :label="t('settings.backupFile')"
                    class="q-mt-md"
                  />

                  <q-btn
                    unelevated
                    color="primary"
                    :label="t('settings.importJson')"
                    icon="upload"
                    class="q-mt-md"
                    :disable="!selectedBackupFile"
                    :loading="isImporting"
                    @click="handleImport"
                  />
                </q-banner>
              </div>

              <div class="col-12 col-md-4">
                <q-banner rounded class="bg-grey-1 text-grey-8">
                  <template #avatar>
                    <q-icon name="download_for_offline" color="primary" />
                  </template>
                  <div class="text-subtitle2 text-weight-bold text-primary">{{ t('settings.installTitle') }}</div>
                  <div class="text-caption q-mt-xs">
                    {{ t('settings.installDescription') }}
                  </div>

                  <q-btn
                    unelevated
                    color="primary"
                    :label="installButtonLabel"
                    icon="download"
                    class="q-mt-md"
                    :disable="isInstalled"
                    @click="handleInstallClick"
                  />

                  <q-banner
                    v-if="installHintVisible || installStatusMessage"
                    rounded
                    class="bg-white text-grey-8 q-mt-md"
                  >
                    {{ installStatusMessage || installInstructions }}
                  </q-banner>
                </q-banner>
              </div>
            </div>
          </q-card-section>

          <q-card-section v-if="statusMessage" class="q-pt-none">
            <q-banner rounded :class="statusBannerClass">
              {{ statusMessage }}
            </q-banner>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="text-overline text-weight-bold text-accent">{{ t('settings.backedUpOverline') }}</div>
            <q-list>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="pets" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ t('settings.animalsTitle') }}</q-item-label>
                  <q-item-label caption>{{ t('settings.animalsDescription') }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="timeline" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ t('settings.eventsTitle') }}</q-item-label>
                  <q-item-label caption>{{ t('settings.eventsDescription') }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useInstallPrompt } from 'src/composables/useInstallPrompt'
import { useI18nText } from 'src/i18n'
import { useAnimalsStore } from 'src/stores/animals-store'
import { useEventsStore } from 'src/stores/events-store'
import { buildBackupPayload, importBackupPayload } from 'src/services/backup-service'

const $q = useQuasar()
const { t } = useI18nText()
const animalsStore = useAnimalsStore()
const eventsStore = useEventsStore()
const {
  installButtonLabel,
  installHintVisible,
  installInstructions,
  installStatusMessage,
  isInstalled,
  handleInstallClick,
} = useInstallPrompt()

const isExporting = ref(false)
const isImporting = ref(false)
const selectedBackupFile = ref(null)
const statusMessage = ref('')
const statusType = ref('positive')

const statusBannerClass = computed(() =>
  statusType.value === 'negative' ? 'bg-red-1 text-negative' : 'bg-green-1 text-primary',
)

async function handleExport() {
  isExporting.value = true
  statusMessage.value = ''

  try {
    const payload = await buildBackupPayload()
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const timestamp = new Date().toISOString().replaceAll(':', '-')

    link.href = url
    link.download = `breedz-backup-${timestamp}.json`
    link.click()
    URL.revokeObjectURL(url)

    statusType.value = 'positive'
    statusMessage.value = t('settings.exportSuccess')
  } catch (error) {
    statusType.value = 'negative'
    statusMessage.value = error instanceof Error ? error.message : t('settings.exportFailed')
  } finally {
    isExporting.value = false
  }
}

async function handleImport() {
  if (!selectedBackupFile.value) {
    return
  }

  isImporting.value = true
  statusMessage.value = ''

  try {
    const fileText = await selectedBackupFile.value.text()
    const parsedPayload = JSON.parse(fileText)

    await importBackupPayload(parsedPayload)
    await Promise.all([animalsStore.loadAnimals(), eventsStore.loadEvents()])

    statusType.value = 'positive'
    statusMessage.value = t('settings.importSuccess')
    selectedBackupFile.value = null

    $q.notify({
      color: 'positive',
      message: t('settings.importReplaced'),
      position: 'top',
    })
  } catch (error) {
    statusType.value = 'negative'
    statusMessage.value = error instanceof Error ? error.message : t('settings.importFailed')

    $q.notify({
      color: 'negative',
      message: statusMessage.value,
      position: 'top',
    })
  } finally {
    isImporting.value = false
  }
}
</script>
