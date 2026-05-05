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

      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">{{ t('settings.preferencesOverline') }}</div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">{{ t('settings.preferencesTitle') }}</div>

        <q-banner rounded class="bg-grey-1 text-grey-8">
          <div class="row no-wrap items-start q-col-gutter-sm">
            <div class="col-auto">
              <q-icon name="balance" color="primary" size="md" />
            </div>
            <div class="col">
              <div class="text-subtitle2 text-weight-bold text-primary">{{ t('settings.weightUnitTitle') }}</div>
              <div class="text-caption q-mt-xs">
                {{ t('settings.weightUnitDescription') }}
              </div>
            </div>
          </div>

          <q-btn-toggle v-model="selectedWeightUnit" unelevated no-caps spread toggle-color="primary" color="grey-3"
            text-color="grey-8" :options="weightUnitOptions" class="q-mt-md" />

          <div class="text-caption text-grey-7 q-mt-sm">
            {{ t('settings.weightUnitHint') }}
          </div>
        </q-banner>
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">{{ t('settings.dataSafetyOverline') }}</div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">{{ t('settings.dataSafetyTitle') }}</div>

        <q-banner rounded :class="syncStatusBannerClass" class="q-mb-md">
          <div class="row no-wrap items-start q-col-gutter-sm">
            <div class="col-auto">
              <q-icon :name="syncStatusIcon" :color="syncStatusIconColor" size="md" />
            </div>
            <div class="col">
              <div class="text-subtitle2 text-weight-bold" :class="syncStatusTitleClass">{{ syncStatusTitle }}</div>
              <div class="text-caption q-mt-xs">
                {{ syncStatusDescription }}
              </div>
              <div v-if="pendingSyncTotal > 0" class="text-caption q-mt-xs">
                {{ t('settings.syncPendingBreakdown', { animals: pendingSyncAnimals, events: pendingSyncEvents }) }}
              </div>
              <div v-if="!isSyncingNow && syncErrorMessage" class="text-caption text-negative q-mt-xs">
                {{ syncErrorMessage }}
              </div>
            </div>
          </div>


          <q-btn v-if="!isSignedIn || !isPremium" unelevated color="primary" icon="workspace_premium"
            class="q-mt-md full-width" :label="syncAccountButtonLabel" to="/account" />

          <q-btn v-else unelevated color="primary" icon="sync" :label="t('settings.syncNow')" class="q-mt-md full-width"
            :disable="!canRunManualSync" :loading="isSyncingNow" @click="handleManualSync" />

        </q-banner>

        <div class="row q-col-gutter-md">
          <div class="col-12">
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
              <q-btn unelevated color="primary" :label="t('settings.exportExcel')" icon="download"
                class="q-mt-md full-width" :loading="isExporting" @click="handleExport" />
            </q-banner>
          </div>

          <div class="col-12">
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

              <q-file v-model="selectedBackupFile" outlined dense clearable
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                :label="t('settings.backupFile')" class="q-mt-md" />

              <q-btn unelevated color="primary" :label="t('settings.importExcel')" icon="upload"
                class="q-mt-md full-width" :disable="!selectedBackupFile" :loading="isImporting"
                @click="handleImport" />

              <div class="text-caption text-grey-7 q-mt-sm">
                {{ t('settings.excelHint') }}
              </div>
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

      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">{{ t('settings.appOverline') }}</div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">{{ t('settings.appTitle') }}</div>

        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-banner rounded class="bg-grey-1 text-grey-8 full-height">
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

              <q-btn unelevated color="primary" :label="installButtonLabel" icon="download" class="q-mt-md full-width"
                :disable="isInstalled" @click="handleInstallClick" />

              <q-banner v-if="installHintVisible || installStatusMessage" rounded class="bg-white text-grey-8 q-mt-md">
                {{ installStatusMessage || installInstructions }}
              </q-banner>
            </q-banner>
          </div>

          <!-- Removed Until Version 1.0.0 -->
          <!--<div class="col-12 col-md-6">
            <q-banner rounded class="bg-grey-1 text-grey-8 full-height">
              <div class="row no-wrap items-start q-col-gutter-sm">
                <div class="col-auto">
                  <q-icon name="info" color="primary" size="md" />
                </div>
                <div class="col">
                  <div class="text-subtitle2 text-weight-bold text-primary">{{ t('settings.versionTitle') }}</div>
                  <div class="text-caption q-mt-xs">
                    {{ t('settings.versionDescription') }}
                  </div>
                </div>
              </div>

              <q-list dense separator class="q-mt-md rounded-borders bg-white">
                <q-item>
                  <q-item-section>
                    <q-item-label caption>{{ t('settings.versionLabel') }}</q-item-label>
                    <q-item-label class="text-weight-bold">{{ appVersionLabel }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>{{ t('settings.buildLabel') }}</q-item-label>
                    <q-item-label class="text-weight-bold">{{ appBuildLabel }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-banner>
          </div>-->
        </div>
      </q-card-section>

      <q-card-section>
        <div class="text-overline text-weight-bold text-primary">{{ t('settings.accountOverline') }}</div>
        <div class="text-h6 text-weight-bold q-mt-sm q-mb-md">{{ t('settings.accountTitle') }}</div>

        <q-banner rounded class="bg-grey-1 text-grey-8">
          <div class="row no-wrap items-start q-col-gutter-sm">
            <div class="col-auto">
              <q-icon name="manage_accounts" color="primary" size="md" />
            </div>
            <div class="col">
              <div class="text-subtitle2 text-weight-bold text-primary">{{ t('settings.accountCardTitle') }}</div>
              <div class="text-caption q-mt-xs">
                {{ t('settings.accountDescription') }}
              </div>
            </div>
          </div>

          <q-btn outline color="primary" icon="arrow_forward" :label="t('settings.openAccount')"
            class="q-mt-md full-width" to="/account" />
        </q-banner>
      </q-card-section>
    </q-card>
  </AppPageShell>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import AppPageShell from 'src/components/AppPageShell.vue'
import { useInstallPrompt } from 'src/composables/useInstallPrompt'
import { useI18nText } from 'src/i18n'
import { buildBackupWorkbookArray, importBackupWorkbookArrayBuffer } from 'src/services/backup-service'
import { listPendingSyncRecords } from 'src/services/sync-queue'
import { requestPremiumSyncNow, usePremiumSyncStatus } from 'src/services/sync-scheduler'
import { useAnimalsStore } from 'src/stores/animals-store'
import { useAuthStore } from 'src/stores/auth-store'
import { useEventsStore } from 'src/stores/events-store'
import { useSettingsStore } from 'src/stores/settings-store'
// import { buildAppBuildLabel, buildAppVersionLabel } from 'src/utils/app-version'

const $q = useQuasar()
const { t } = useI18nText()
const animalsStore = useAnimalsStore()
const authStore = useAuthStore()
const eventsStore = useEventsStore()
const settingsStore = useSettingsStore()
const { isLoaded: authLoaded, isPremium, isSignedIn } = storeToRefs(authStore)
const { weightUnit } = storeToRefs(settingsStore)
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
const isManualSyncing = ref(false)
const pendingSyncAnimals = ref(0)
const pendingSyncEvents = ref(0)
const syncErrorMessage = ref('')
const { isSyncing: isPremiumSyncing } = usePremiumSyncStatus()

const selectedWeightUnit = computed({
  get: () => weightUnit.value,
  set: (value) => settingsStore.setWeightUnit(value),
})

const weightUnitOptions = computed(() => [
  { label: t('settings.weightUnitKilograms'), value: 'kg' },
  { label: t('settings.weightUnitPounds'), value: 'lb' },
])
// const appVersionLabel = buildAppVersionLabel()
// const appBuildLabel = buildAppBuildLabel() || t('settings.localBuild')

const statusBannerClass = computed(() =>
  statusType.value === 'negative' ? 'bg-red-1 text-negative' : 'bg-green-1 text-primary',
)
const pendingSyncTotal = computed(() => pendingSyncAnimals.value + pendingSyncEvents.value)
const isSyncingNow = computed(() => isManualSyncing.value || isPremiumSyncing.value)
const canRunManualSync = computed(() =>
  authLoaded.value && isSignedIn.value && isPremium.value,
)
const hasSyncError = computed(() => !isSyncingNow.value && Boolean(syncErrorMessage.value))
const syncStatusBannerClass = computed(() => {
  if (isSyncingNow.value) {
    return 'bg-green-1 text-primary'
  }

  if (hasSyncError.value) {
    return 'bg-red-1 text-negative'
  }

  if (!isSignedIn.value || !isPremium.value) {
    return 'bg-grey-1 text-grey-8'
  }

  if (pendingSyncTotal.value > 0) {
    return 'bg-orange-1 text-warning'
  }

  return 'bg-green-1 text-primary'
})
const syncStatusIcon = computed(() => {
  if (isSyncingNow.value) {
    return 'sync'
  }

  if (hasSyncError.value) {
    return 'sync_problem'
  }

  if (!isSignedIn.value) {
    return 'cloud_off'
  }

  if (!isPremium.value) {
    return 'lock'
  }

  if (pendingSyncTotal.value > 0) {
    return 'cloud_upload'
  }

  return 'cloud_done'
})
const syncStatusIconColor = computed(() => {
  if (isSyncingNow.value) {
    return 'primary'
  }

  if (hasSyncError.value) {
    return 'negative'
  }

  if (!isSignedIn.value || !isPremium.value) {
    return 'primary'
  }

  if (pendingSyncTotal.value > 0) {
    return 'warning'
  }

  return 'primary'
})
const syncStatusTitleClass = computed(() => {
  if (hasSyncError.value) {
    return 'text-negative'
  }

  if (isSyncingNow.value || !isSignedIn.value || !isPremium.value) {
    return 'text-primary'
  }

  return ''
})
const syncStatusTitle = computed(() => {
  if (isSyncingNow.value) {
    return t('settings.syncingTitle')
  }

  if (hasSyncError.value) {
    return t('settings.syncFailedTitle')
  }

  if (!isSignedIn.value) {
    return t('settings.syncLocalOnlyTitle')
  }

  if (!isPremium.value) {
    return t('settings.syncPremiumLockedTitle')
  }

  if (pendingSyncTotal.value > 0) {
    return t('settings.syncPendingTitle', { count: pendingSyncTotal.value })
  }

  return t('settings.syncActiveTitle')
})
const syncStatusDescription = computed(() => {
  if (isSyncingNow.value) {
    return t('settings.syncingDescription')
  }

  if (hasSyncError.value) {
    return t('settings.syncFailedDescription')
  }

  if (!isSignedIn.value) {
    return t('settings.syncLocalOnlyDescription')
  }

  if (!isPremium.value) {
    return t('settings.syncPremiumLockedDescription')
  }

  if (pendingSyncTotal.value > 0) {
    return t('settings.syncPendingDescription')
  }

  return t('settings.syncActiveDescription')
})
const syncAccountButtonLabel = computed(() =>
  isSignedIn.value ? t('settings.upgradeForSync') : t('settings.signInForSync'),
)

async function refreshPendingSyncStatus() {
  const pending = await listPendingSyncRecords()
  const records = [...pending.animals, ...pending.events]
  const failedRecord = records.find((record) => record.sync?.error)

  pendingSyncAnimals.value = pending.animals.length
  pendingSyncEvents.value = pending.events.length
  syncErrorMessage.value = failedRecord?.sync?.error ?? ''
}

async function handleManualSync() {
  if (!canRunManualSync.value) {
    return
  }

  isManualSyncing.value = true
  syncErrorMessage.value = ''

  try {
    const result = await requestPremiumSyncNow('settings-manual')
    await refreshPendingSyncStatus()

    if (result?.skippedReason === 'offline') {
      $q.notify({
        color: 'warning',
        message: t('settings.syncOffline'),
        position: 'top',
      })
      return
    }

    if (result?.skippedReason) {
      $q.notify({
        color: 'warning',
        message: t('settings.syncSkipped'),
        position: 'top',
      })
      return
    }

    if (result?.failed > 0) {
      syncErrorMessage.value = t('settings.syncFailedDescription')
      return
    }

    $q.notify({
      color: 'positive',
      message: t('settings.syncSuccess'),
      position: 'top',
    })
  } catch (error) {
    syncErrorMessage.value = error instanceof Error ? error.message : t('settings.syncFailedDescription')
  } finally {
    isManualSyncing.value = false
  }
}

async function handleExport() {
  isExporting.value = true
  statusMessage.value = ''

  try {
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
    const arrayBuffer = await selectedBackupFile.value.arrayBuffer()
    await importBackupWorkbookArrayBuffer(arrayBuffer)
    await Promise.all([animalsStore.loadAnimals(), eventsStore.loadEvents()])
    await refreshPendingSyncStatus()

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

onMounted(() => {
  void refreshPendingSyncStatus()
})

watch(isPremiumSyncing, (isSyncing, wasSyncing) => {
  if (isSyncing) {
    syncErrorMessage.value = ''
    return
  }

  if (wasSyncing) {
    void refreshPendingSyncStatus()
  }
})
</script>
