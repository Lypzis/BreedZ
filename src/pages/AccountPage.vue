<template>
  <AppPageShell>
        <q-card flat class="account-card">
          <q-card-section class="row items-start justify-between q-col-gutter-md">
            <div class="col-12 col-md">
              <div class="text-overline text-weight-bold text-primary">{{ t('account.overline') }}</div>
              <div class="text-h4 text-weight-bold q-mt-sm q-mb-sm">{{ t('account.title') }}</div>
              <div class="text-body1 text-grey-7">
                {{ t('account.description') }}
              </div>
            </div>
          </q-card-section>

          <q-card-section v-if="errorMessage" class="q-pt-none">
            <q-banner rounded class="bg-red-1 text-negative">
              {{ errorMessage }}
            </q-banner>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-card v-if="!isLoaded" flat bordered>
              <q-card-section class="row items-center q-gutter-sm">
                <q-spinner color="primary" size="24px" />
                <div class="text-body2 text-grey-7">
                  {{ t('account.loadingAccount') }}
                </div>
              </q-card-section>
            </q-card>

            <q-banner v-else-if="isSignedIn" rounded class="bg-green-1 text-primary">
              <template #avatar>
                <q-icon name="account_circle" color="primary" />
              </template>
              <div class="text-subtitle2 text-weight-bold">{{ t('account.signedInTitle') }}</div>
              <div class="text-caption text-grey-8 q-mt-xs">
                {{ user?.email || t('account.emailUnavailable') }}
              </div>
              <div class="text-caption text-grey-8 q-mt-sm">
                {{ premiumStatusLabel }}
              </div>

              <div class="row q-gutter-sm q-mt-md">
                <q-btn
                  flat
                  color="primary"
                  icon="logout"
                  :label="t('account.signOut')"
                  :loading="isLoading"
                  @click="handleSignOut"
                />
              </div>
            </q-banner>

            <q-card v-else flat bordered>
              <q-card-section>
                <q-btn-toggle
                  v-model="authMode"
                  unelevated
                  no-caps
                  color="green-1"
                  text-color="primary"
                  toggle-color="primary"
                  toggle-text-color="white"
                  :options="authModeOptions"
                />
              </q-card-section>

              <q-card-section class="q-pt-none">
                <q-form class="column q-gutter-md" @submit.prevent="submitAuth">
                  <q-input
                    v-model="email"
                    outlined
                    type="email"
                    autocomplete="email"
                    :label="t('account.email')"
                  />
                  <q-input
                    v-model="password"
                    outlined
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="current-password"
                    :label="t('account.password')"
                  >
                    <template #append>
                      <q-btn
                        flat
                        round
                        dense
                        :icon="showPassword ? 'visibility_off' : 'visibility'"
                        :aria-label="t('account.togglePassword')"
                        :title="t('account.togglePassword')"
                        @click="showPassword = !showPassword"
                      />
                    </template>
                  </q-input>

                  <q-checkbox
                    v-if="authMode === 'sign-up'"
                    v-model="receiveUpdates"
                    color="primary"
                    :label="t('account.receiveUpdates')"
                  />

                  <q-btn
                    unelevated
                    color="primary"
                    type="submit"
                    :loading="isLoading"
                    :label="authMode === 'sign-in' ? t('account.signIn') : t('account.createAccount')"
                  />

                  <q-btn
                    v-if="authMode === 'sign-in'"
                    flat
                    no-caps
                    color="primary"
                    class="self-end q-px-sm"
                    :disable="isLoading"
                    :label="t('account.forgotPassword')"
                    @click="handlePasswordReset"
                  />
                </q-form>
              </q-card-section>
            </q-card>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-banner rounded class="bg-grey-1 text-grey-8">
                  <template #avatar>
                    <q-icon name="workspace_premium" color="primary" />
                  </template>
                  <div class="text-subtitle2 text-weight-bold text-primary">{{ t('account.planTitle') }}</div>
                  <div class="text-caption q-mt-xs">
                    {{ currentPlanLabel }}
                  </div>
                </q-banner>
              </div>

              <div class="col-12 col-md-6">
                <q-banner rounded class="bg-grey-1 text-grey-8">
                  <template #avatar>
                    <q-icon name="credit_card" color="primary" />
                  </template>
                  <div class="text-subtitle2 text-weight-bold text-primary">{{ t('account.billingTitle') }}</div>
                  <div class="text-caption q-mt-xs" v-html="billingDescriptionLabel" />
                </q-banner>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div v-if="isSignedIn && isPremium" class="row q-col-gutter-md">
              <div class="col-12">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-overline text-primary text-weight-bold">
                      {{ t('account.activeSubscriptionOverline') }}
                    </div>
                    <div class="text-h5 text-weight-bold q-mt-sm">
                      {{ currentPremiumPriceLabel }}
                    </div>
                    <div class="text-body2 text-grey-7 q-mt-sm">
                      {{ currentPremiumDescriptionLabel }}
                    </div>
                  </q-card-section>
                  <q-card-actions align="right">
                    <q-btn
                      unelevated
                      color="primary"
                      :loading="portalLoading"
                      :label="t('account.manageSubscription')"
                      @click="openCustomerPortal"
                    />
                  </q-card-actions>
                </q-card>
              </div>
            </div>

            <template v-else>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-card flat bordered>
                    <q-card-section>
                      <div class="text-overline text-primary text-weight-bold">
                        {{ t('account.monthlyPlanOverline') }}
                      </div>
                      <div class="text-h5 text-weight-bold q-mt-sm">
                        {{ t('account.monthlyPlanPrice') }}
                      </div>
                      <div class="text-body2 text-grey-7 q-mt-sm">
                        {{ t('account.monthlyPlanDescription') }}
                      </div>
                    </q-card-section>
                    <q-card-actions align="right">
                      <q-btn
                        unelevated
                        color="primary"
                        :disable="!isSignedIn"
                        :loading="checkoutLoading === 'monthly'"
                        :label="t('account.subscribeMonthly')"
                        @click="startCheckout('monthly')"
                      />
                    </q-card-actions>
                  </q-card>
                </div>

                <div class="col-12 col-md-6">
                  <q-card flat bordered>
                    <q-card-section>
                      <div class="text-overline text-primary text-weight-bold">
                        {{ t('account.yearlyPlanOverline') }}
                      </div>
                      <div class="text-h5 text-weight-bold q-mt-sm">
                        {{ t('account.yearlyPlanPrice') }}
                      </div>
                      <div class="text-body2 text-grey-7 q-mt-sm">
                        {{ t('account.yearlyPlanDescription') }}
                      </div>
                      <div class="text-caption text-primary text-weight-medium q-mt-sm">
                        {{ t('account.yearlyPlanSavings') }}
                      </div>
                    </q-card-section>
                    <q-card-actions align="right">
                      <q-btn
                        unelevated
                        color="primary"
                        :disable="!isSignedIn"
                        :loading="checkoutLoading === 'yearly'"
                        :label="t('account.subscribeYearly')"
                        @click="startCheckout('yearly')"
                      />
                    </q-card-actions>
                  </q-card>
                </div>
              </div>

              <q-banner
                v-if="!isSignedIn"
                rounded
                class="bg-warning text-white q-mt-md"
              >
                {{ t('account.signInToSubscribe') }}
              </q-banner>
            </template>
          </q-card-section>

          <q-inner-loading :showing="showAccountLoading" color="primary">
            <q-spinner color="primary" size="40px" />
            <div class="text-body2 text-primary text-weight-medium q-mt-md">
              {{ accountLoadingLabel }}
            </div>
          </q-inner-loading>
        </q-card>
  </AppPageShell>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import AppPageShell from 'src/components/AppPageShell.vue'
import { useI18nText } from 'src/i18n'
import { useAuthStore } from 'src/stores/auth-store'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const { t } = useI18nText()
const authStore = useAuthStore()
const { errorMessage, isLoaded, isLoading, isPremium, isSignedIn, subscription, user } =
  storeToRefs(authStore)

const authMode = ref('sign-in')
const email = ref('')
const password = ref('')
const receiveUpdates = ref(false)
const showPassword = ref(false)
const checkoutLoading = ref('')
const portalLoading = ref(false)
const awaitingCheckoutSync = ref(false)
let checkoutSyncTimeout = null

const authModeOptions = computed(() => [
  { label: t('account.signIn'), value: 'sign-in' },
  { label: t('account.createAccount'), value: 'sign-up' },
])

const currentPlanLabel = computed(() =>
  isPremium.value ? t('account.planPremium') : t('account.planFree'),
)

const currentPremiumPriceLabel = computed(() => {
  if (subscription.value?.plan === 'yearly') {
    return t('account.yearlyPlanPrice')
  }

  return t('account.monthlyPlanPrice')
})

const currentPremiumDescriptionLabel = computed(() => {
  if (subscription.value?.plan === 'yearly') {
    return t('account.currentYearlyPlanDescription')
  }

  return t('account.currentMonthlyPlanDescription')
})

const showAccountLoading = computed(
  () => !isLoaded.value || checkoutLoading.value !== '' || awaitingCheckoutSync.value,
)

const accountLoadingLabel = computed(() => {
  if (!isLoaded.value) {
    return t('account.loadingAccount')
  }

  if (checkoutLoading.value !== '') {
    return t('account.redirectingToCheckout')
  }

  if (awaitingCheckoutSync.value) {
    return t('account.finalizingCheckout')
  }

  return ''
})

const billingDescriptionLabel = computed(() => {
  if (!isSignedIn.value) {
    return t('account.billingDescriptionSignedOut')
  }

  if (isPremium.value) {
    return t('account.billingDescriptionPremium')
  }

  return t('account.billingDescription')
})

const premiumStatusLabel = computed(() => {
  const plan = subscription.value?.plan || 'free'
  const status = subscription.value?.status || 'inactive'

  if (isPremium.value) {
    return t('account.premiumStatusActive', { plan })
  }

  return t('account.premiumStatusInactive', { status })
})

async function submitAuth() {
  try {
    if (authMode.value === 'sign-in') {
      await authStore.signIn(email.value, password.value)
      $q.notify({ color: 'positive', message: t('account.signInSuccess'), position: 'top' })
    } else {
      await authStore.signUp(email.value, password.value, {
        receiveUpdates: receiveUpdates.value,
      })
      $q.notify({ color: 'positive', message: t('account.signUpSuccess'), position: 'top' })
    }

    password.value = ''
    receiveUpdates.value = false
  } catch {
    $q.notify({
      color: 'negative',
      message: errorMessage.value || t('account.authFailed'),
      position: 'top',
    })
  }
}

async function handleSignOut() {
  try {
    await authStore.signOutUser()
    password.value = ''
    $q.notify({ color: 'positive', message: t('account.signOutSuccess'), position: 'top' })
  } catch {
    $q.notify({
      color: 'negative',
      message: errorMessage.value || t('account.signOutFailed'),
      position: 'top',
    })
  }
}

async function handlePasswordReset() {
  if (!email.value.trim()) {
    $q.notify({
      color: 'warning',
      message: t('account.passwordResetMissingEmail'),
      position: 'top',
    })
    return
  }

  try {
    await authStore.requestPasswordReset(email.value.trim())
    $q.notify({
      color: 'positive',
      message: t('account.passwordResetSent'),
      position: 'top',
    })
  } catch {
    $q.notify({
      color: 'negative',
      message: errorMessage.value || t('account.passwordResetFailed'),
      position: 'top',
    })
  }
}

async function startCheckout(plan) {
  if (!user.value) {
    $q.notify({
      color: 'warning',
      message: t('account.signInToSubscribe'),
      position: 'top',
    })
    return
  }

  checkoutLoading.value = plan

  try {
    const idToken = await user.value.getIdToken()
    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan }),
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok || !payload.url) {
      throw new Error(payload.error || t('account.checkoutStartFailed'))
    }

    awaitingCheckoutSync.value = true
    window.location.assign(payload.url)
  } catch (error) {
    $q.notify({
      color: 'negative',
      message:
        error instanceof Error ? error.message : t('account.checkoutStartFailed'),
      position: 'top',
    })
  } finally {
    checkoutLoading.value = ''
  }
}

async function openCustomerPortal() {
  if (!user.value) {
    return
  }

  portalLoading.value = true

  try {
    const idToken = await user.value.getIdToken()
    const response = await fetch('/.netlify/functions/create-customer-portal-session', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok || !payload.url) {
      throw new Error(payload.error || t('account.manageSubscriptionFailed'))
    }

    window.location.assign(payload.url)
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: error instanceof Error ? error.message : t('account.manageSubscriptionFailed'),
      position: 'top',
    })
  } finally {
    portalLoading.value = false
  }
}

async function handleCheckoutQuery(checkoutState) {
  if (checkoutState === 'success') {
    if (isPremium.value) {
      $q.notify({
        color: 'positive',
        message: t('account.checkoutSuccess'),
        position: 'top',
      })
      await router.replace({
        path: route.path,
        query: {
          ...route.query,
          checkout: undefined,
        },
      })
      return
    }

    awaitingCheckoutSync.value = true
    clearCheckoutQueryAfterDelay()
  } else if (checkoutState === 'cancelled') {
    awaitingCheckoutSync.value = false
    $q.notify({
      color: 'warning',
      message: t('account.checkoutCancelled'),
      position: 'top',
    })
  } else {
    return
  }

  await router.replace({
    path: route.path,
    query: {
      ...route.query,
      checkout: undefined,
    },
  })
}

function clearCheckoutQueryAfterDelay() {
  if (checkoutSyncTimeout) {
    clearTimeout(checkoutSyncTimeout)
  }

  checkoutSyncTimeout = window.setTimeout(() => {
    if (!awaitingCheckoutSync.value) {
      return
    }

    awaitingCheckoutSync.value = false
    $q.notify({
      color: 'info',
      message: t('account.checkoutSuccess'),
      position: 'top',
    })
    void router.replace({
      path: route.path,
      query: {
        ...route.query,
        checkout: undefined,
      },
    })
  }, 12000)
}

watch(
  () => route.query.checkout,
  (checkoutState) => {
    if (typeof checkoutState === 'string') {
      void handleCheckoutQuery(checkoutState)
    }
  },
  { immediate: true },
)

watch(isPremium, async (premiumActive) => {
  if (!premiumActive || !awaitingCheckoutSync.value) {
    return
  }

  if (checkoutSyncTimeout) {
    clearTimeout(checkoutSyncTimeout)
    checkoutSyncTimeout = null
  }

  awaitingCheckoutSync.value = false
  $q.notify({
    color: 'positive',
    message: t('account.checkoutSuccess'),
    position: 'top',
  })
  await router.replace({
    path: route.path,
    query: {
      ...route.query,
      checkout: undefined,
    },
  })
})
</script>

<style scoped>
.account-card {
  position: relative;
}
</style>
