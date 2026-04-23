<template>
  <AppPageShell>
    <q-card flat>
      <q-card-section class="row items-start justify-between q-col-gutter-md">
        <div class="col-12 col-md">
          <div class="text-overline text-weight-bold text-primary">{{ t('overview.overline') }}</div>
          <div class="text-h4 text-weight-bold q-mt-sm q-mb-sm">{{ t('overview.title') }}</div>
          <div class="text-body1 text-grey-7">
            {{ t('overview.description') }}
          </div>
        </div>
      </q-card-section>

      <q-card-section v-if="loadErrorMessage" class="q-pt-none">
        <q-banner rounded class="bg-red-1 text-negative">
          {{ loadErrorMessage }}
        </q-banner>
      </q-card-section>

      <q-card-section v-if="isBusy" class="q-py-xl">
        <div class="row justify-center">
          <q-spinner color="primary" size="40px" />
        </div>
      </q-card-section>

      <template v-else>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div
              v-for="item in animalMetricCards"
              :key="item.key"
              class="col-12 col-sm-6 col-lg-3"
            >
              <q-banner rounded class="bg-green-1 text-primary overview-metric">
                <template #avatar>
                  <q-icon :name="item.icon" color="primary" />
                </template>
                <div class="text-h5 text-weight-bold">{{ item.value }}</div>
                <div class="text-caption text-grey-8">{{ item.label }}</div>
              </q-banner>
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <q-card bordered flat>
            <q-card-section>
              <div class="text-h6 text-weight-bold">{{ t('overview.financialTitle') }}</div>
              <div class="text-caption text-grey-7">{{ t('overview.financialHint') }}</div>
            </q-card-section>

            <q-list separator>
              <q-item v-for="item in financialRows" :key="item.key">
                <q-item-section avatar>
                  <q-avatar :color="item.color" text-color="white" :icon="item.icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ item.label }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-weight-bold" :class="item.textClass">
                    {{ item.value }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </q-card-section>
      </template>
    </q-card>
  </AppPageShell>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppPageShell from 'src/components/AppPageShell.vue'
import { useI18nText } from 'src/i18n'
import { useAnimalsStore } from 'src/stores/animals-store'
import { useEventsStore } from 'src/stores/events-store'
import { formatEventAmount } from 'src/utils/event-display'
import { buildOverviewSummary } from 'src/utils/overview-aggregates'

const { t } = useI18nText()
const animalsStore = useAnimalsStore()
const eventsStore = useEventsStore()

const { animals, errorMessage: animalsErrorMessage, isLoading: animalsLoading } = storeToRefs(animalsStore)
const { errorMessage: eventsErrorMessage, events, isLoading: eventsLoading } = storeToRefs(eventsStore)

const isBusy = computed(() => animalsLoading.value || eventsLoading.value)
const loadErrorMessage = computed(() => animalsErrorMessage.value || eventsErrorMessage.value)
const overview = computed(() => buildOverviewSummary(animals.value, events.value))
const animalMetricCards = computed(() => [
  {
    key: 'total',
    icon: 'pets',
    label: t('overview.totalAnimals'),
    value: overview.value.animalStatusCounts.total,
  },
  {
    key: 'active',
    icon: 'check_circle',
    label: t('overview.activeAnimals'),
    value: overview.value.animalStatusCounts.active,
  },
  {
    key: 'sold',
    icon: 'sell',
    label: t('overview.soldAnimals'),
    value: overview.value.animalStatusCounts.sold,
  },
  {
    key: 'breeders',
    icon: 'bookmark',
    label: t('overview.breeders'),
    value: overview.value.animalStatusCounts.breeders,
  },
])
const financialRows = computed(() => [
  {
    key: 'sales',
    icon: 'payments',
    color: 'positive',
    label: t('overview.salesTotal'),
    value: amountLabel(overview.value.financials.salesTotal),
  },
  {
    key: 'purchase',
    icon: 'shopping_cart',
    color: 'primary',
    label: t('overview.purchaseTotal'),
    value: amountLabel(overview.value.financials.purchaseTotal),
  },
  {
    key: 'costs',
    icon: 'receipt_long',
    color: 'warning',
    label: t('overview.recordedExpenses'),
    value: amountLabel(overview.value.financials.recordedCosts),
  },
  {
    key: 'balance',
    icon: 'account_balance_wallet',
    color: overview.value.financials.recordedBalance >= 0 ? 'positive' : 'negative',
    label: t('overview.netRecordedResult'),
    value: amountLabel(overview.value.financials.recordedBalance),
    textClass: overview.value.financials.recordedBalance >= 0 ? 'text-positive' : 'text-negative',
  },
])

function amountLabel(value) {
  return formatEventAmount(value) || '0.00'
}

onMounted(async () => {
  try {
    if (!animalsStore.isLoaded) {
      await animalsStore.loadAnimals()
    }

    if (!eventsStore.isLoaded) {
      await eventsStore.loadEvents()
    }
  } catch {
    // store error messages are already exposed to the UI
  }
})
</script>

<style scoped>
.overview-metric {
  min-height: 112px;
}
</style>
