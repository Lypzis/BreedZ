<template>
  <AppPageShell>
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
                  <div class="row no-wrap items-start q-col-gutter-sm">
                    <div class="col-auto">
                      <q-icon name="download" color="primary" size="md" />
                    </div>
                    <div class="col">
                      <div class="text-subtitle2 text-weight-bold">{{ t('settings.exportTitle') }}</div>
                      <div class="text-caption text-grey-8 q-mt-xs">
                        {{ t('settings.exportDescription') }}
                      </div>
                    </div>
                  </div>
                  <q-btn
                    unelevated
                    color="primary"
                    :label="t('settings.exportExcel')"
                    icon="download"
                    class="q-mt-md full-width"
                    :loading="isExporting"
                    @click="handleExport"
                  />
                </q-banner>
              </div>

              <div class="col-12 col-md-4">
                <q-banner rounded class="bg-grey-1 text-grey-8">
                  <div class="row no-wrap items-start q-col-gutter-sm">
                    <div class="col-auto">
                      <q-icon name="upload_file" color="primary" size="md" />
                    </div>
                    <div class="col">
                      <div class="text-subtitle2 text-weight-bold text-primary">{{ t('settings.importTitle') }}</div>
                      <div class="text-caption q-mt-xs">
                        {{ t('settings.importDescription') }}
                      </div>
                    </div>
                  </div>

                  <q-file
                    v-model="selectedBackupFile"
                    outlined
                    dense
                    clearable
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    :label="t('settings.backupFile')"
                    class="q-mt-md"
                  />

                  <q-btn
                    unelevated
                    color="primary"
                    :label="t('settings.importExcel')"
                    icon="upload"
                    class="q-mt-md full-width"
                    :disable="!selectedBackupFile"
                    :loading="isImporting"
                    @click="handleImport"
                  />

                  <div class="text-caption text-grey-7 q-mt-sm">
                    {{ t('settings.excelHint') }}
                  </div>
                </q-banner>
              </div>

              <div class="col-12 col-md-4">
                <q-banner rounded class="bg-grey-1 text-grey-8">
                  <div class="row no-wrap items-start q-col-gutter-sm">
                    <div class="col-auto">
                      <q-icon name="download_for_offline" color="primary" size="md" />
                    </div>
                    <div class="col">
                      <div class="text-subtitle2 text-weight-bold text-primary">{{ t('settings.installTitle') }}</div>
                      <div class="text-caption q-mt-xs">
                        {{ t('settings.installDescription') }}
                      </div>
                    </div>
                  </div>

                  <q-btn
                    unelevated
                    color="primary"
                    :label="installButtonLabel"
                    icon="download"
                    class="q-mt-md full-width"
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
  </AppPageShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import AppPageShell from 'src/components/AppPageShell.vue'
import { useInstallPrompt } from 'src/composables/useInstallPrompt'
import { useI18nText } from 'src/i18n'
import { useAnimalsStore } from 'src/stores/animals-store'
import { useEventsStore } from 'src/stores/events-store'

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

let backupServicePromise

function loadBackupService() {
  backupServicePromise ??= import('src/services/backup-service')
  return backupServicePromise
}

onMounted(() => {
  void loadBackupService()
})

async function handleExport() {
  isExporting.value = true
  statusMessage.value = ''

  try {
    const { buildBackupWorkbookArray } = await loadBackupService()
    const workbookArray = await buildBackupWorkbookArray()
    const blob = new Blob([workbookArray], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const timestamp = new Date().toISOString().replaceAll(':', '-')

    link.href = url
    link.download = `breedz-backup-${timestamp}.xlsx`
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
    const { importBackupWorkbookArrayBuffer } = await loadBackupService()
    const arrayBuffer = await selectedBackupFile.value.arrayBuffer()
    await importBackupWorkbookArrayBuffer(arrayBuffer)
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
