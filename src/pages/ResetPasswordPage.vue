<template>
  <AppPageShell :md="8" :lg="6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-overline text-weight-bold text-primary">
              {{ t('account.overline') }}
            </div>
            <div class="text-h4 text-weight-bold q-mt-sm q-mb-sm">
              {{ t('account.resetPasswordPageTitle') }}
            </div>
            <div class="text-body1 text-grey-7">
              {{ t('account.resetPasswordPageDescription') }}
            </div>
          </q-card-section>

          <q-card-section v-if="isCheckingCode" class="q-pt-none">
            <q-card flat bordered>
              <q-card-section class="row items-center q-gutter-sm">
                <q-spinner color="primary" size="24px" />
                <div class="text-body2 text-grey-7">
                  {{ t('account.resetPasswordCheckingCode') }}
                </div>
              </q-card-section>
            </q-card>
          </q-card-section>

          <q-card-section v-else-if="isResetComplete" class="q-pt-none">
            <q-banner rounded class="bg-green-1 text-primary">
              <div class="text-subtitle2 text-weight-bold">
                {{ t('account.resetPasswordSuccessTitle') }}
              </div>
              <div class="text-body2 q-mt-sm">
                {{ t('account.resetPasswordSuccessBody') }}
              </div>
            </q-banner>

            <div class="q-mt-md">
              <q-btn
                unelevated
                color="primary"
                :label="t('account.resetPasswordBackToAccount')"
                @click="goBackToAccount"
              />
            </div>
          </q-card-section>

          <q-card-section v-else-if="pageError" class="q-pt-none">
            <q-banner rounded class="bg-red-1 text-negative">
              <div class="text-subtitle2 text-weight-bold">
                {{ t('account.resetPasswordInvalidTitle') }}
              </div>
              <div class="text-body2 q-mt-sm">
                {{ pageError }}
              </div>
            </q-banner>

            <div class="q-mt-md">
              <q-btn
                flat
                color="primary"
                :label="t('account.resetPasswordBackToAccount')"
                @click="goBackToAccount"
              />
            </div>
          </q-card-section>

          <q-card-section v-else class="q-pt-none">
            <q-banner rounded class="bg-grey-1 text-grey-8 q-mb-md">
              <div class="text-subtitle2 text-weight-bold text-primary">
                {{ t('account.resetPasswordForEmail') }}
              </div>
              <div class="text-body2 q-mt-xs">
                {{ resetEmail }}
              </div>
            </q-banner>

            <q-form class="column q-gutter-md" @submit.prevent="submitReset">
              <q-input
                v-model="newPassword"
                outlined
                :type="showNewPassword ? 'text' : 'password'"
                autocomplete="new-password"
                :label="t('account.resetPasswordNewPassword')"
              >
                <template #append>
                  <q-btn
                    flat
                    round
                    dense
                    :icon="showNewPassword ? 'visibility_off' : 'visibility'"
                    :aria-label="t('account.togglePassword')"
                    :title="t('account.togglePassword')"
                    @click="showNewPassword = !showNewPassword"
                  />
                </template>
              </q-input>

              <q-input
                v-model="confirmPassword"
                outlined
                :type="showConfirmPassword ? 'text' : 'password'"
                autocomplete="new-password"
                :label="t('account.resetPasswordConfirmPassword')"
              >
                <template #append>
                  <q-btn
                    flat
                    round
                    dense
                    :icon="showConfirmPassword ? 'visibility_off' : 'visibility'"
                    :aria-label="t('account.togglePassword')"
                    :title="t('account.togglePassword')"
                    @click="showConfirmPassword = !showConfirmPassword"
                  />
                </template>
              </q-input>

              <q-btn
                unelevated
                color="primary"
                type="submit"
                :loading="isSubmitting"
                :label="t('account.resetPasswordSubmit')"
              />
            </q-form>
          </q-card-section>
        </q-card>
  </AppPageShell>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth'
import AppPageShell from 'src/components/AppPageShell.vue'
import { setLocale, useI18nText } from 'src/i18n'
import { auth } from 'src/services/firebase'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const { t } = useI18nText()

const resetEmail = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isCheckingCode = ref(true)
const isSubmitting = ref(false)
const isResetComplete = ref(false)
const pageError = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const actionCode = String(route.query.oobCode || '')
const actionMode = String(route.query.mode || '')
const continueUrl = String(route.query.continueUrl || '/account')
const lang = String(route.query.lang || '')

function resolvePageError(error) {
  if (error && typeof error === 'object' && 'code' in error) {
    if (error.code === 'auth/expired-action-code' || error.code === 'auth/invalid-action-code') {
      return t('account.resetPasswordInvalidBody')
    }

    if (error.code === 'auth/weak-password') {
      return t('account.resetPasswordWeakPassword')
    }
  }

  return error instanceof Error ? error.message : t('account.resetPasswordFailed')
}

async function initializeResetPage() {
  if (lang) {
    setLocale(lang, { persist: false })
  }

  if (actionMode !== 'resetPassword' || !actionCode) {
    pageError.value = t('account.resetPasswordInvalidBody')
    isCheckingCode.value = false
    return
  }

  try {
    resetEmail.value = await verifyPasswordResetCode(auth, actionCode)
  } catch (error) {
    pageError.value = resolvePageError(error)
  } finally {
    isCheckingCode.value = false
  }
}

function goBackToAccount() {
  if (continueUrl.startsWith('/')) {
    void router.replace(continueUrl)
    return
  }

  try {
    const targetUrl = new URL(continueUrl)

    if (typeof window !== 'undefined' && targetUrl.origin === window.location.origin) {
      void router.replace(`${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`)
      return
    }
  } catch {
    // Fallback below for invalid URLs.
  }

  void router.replace('/account')
}

async function submitReset() {
  if (!newPassword.value || !confirmPassword.value) {
    pageError.value = t('account.resetPasswordMissingPassword')
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    pageError.value = t('account.resetPasswordMismatch')
    return
  }

  isSubmitting.value = true
  pageError.value = ''

  try {
    await confirmPasswordReset(auth, actionCode, newPassword.value)
    isResetComplete.value = true
    $q.notify({
      color: 'positive',
      message: t('account.resetPasswordSuccessTitle'),
      position: 'top',
    })
  } catch (error) {
    pageError.value = resolvePageError(error)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  void initializeResetPage()
})
</script>
