import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { getCurrentLocaleValue, t } from 'src/i18n'
import { auth, db } from 'src/services/firebase'
import { createDefaultSubscription, isPremiumSubscription } from 'src/utils/subscription'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const subscription = ref(createDefaultSubscription())
  const isLoaded = ref(false)
  const isLoading = ref(false)
  const errorMessage = ref('')
  let unsubscribeAuth = null
  let unsubscribeSubscription = null

  const isSignedIn = computed(() => user.value !== null)
  const isPremium = computed(() => isPremiumSubscription(subscription.value))

  function clearError() {
    errorMessage.value = ''
  }

  function getFriendlyAuthErrorMessage(error, fallbackKey) {
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'auth/network-request-failed') {
        return t('account.offlineAuthError')
      }

      if (error.code === 'auth/invalid-credential') {
        return t('account.invalidCredentialError')
      }

      if (error.code === 'auth/email-already-in-use') {
        return t('account.emailAlreadyInUseError')
      }

      if (error.code === 'auth/invalid-email') {
        return t('account.invalidEmailError')
      }

      if (error.code === 'auth/missing-password') {
        return t('account.missingPasswordError')
      }

      if (error.code === 'auth/weak-password') {
        return t('account.weakPasswordError')
      }
    }

    return error instanceof Error ? error.message : t(fallbackKey)
  }

  function stopSubscriptionListener() {
    if (unsubscribeSubscription) {
      unsubscribeSubscription()
      unsubscribeSubscription = null
    }
  }

  function watchSubscription(uid) {
    stopSubscriptionListener()

    const subscriptionRef = doc(db, 'subscriptions', uid)

    unsubscribeSubscription = onSnapshot(
      subscriptionRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          subscription.value = createDefaultSubscription(uid)
          return
        }

        subscription.value = {
          ...createDefaultSubscription(uid),
          ...snapshot.data(),
        }
      },
      (error) => {
        errorMessage.value = error instanceof Error ? error.message : 'Failed to sync subscription.'
      },
    )
  }

  async function ensureUserDocuments(firebaseUser, options = {}) {
    const userRef = doc(db, 'users', firebaseUser.uid)
    const payload = {
      email: firebaseUser.email ?? '',
      updatedAt: serverTimestamp(),
    }

    if (Object.hasOwn(options, 'receiveUpdates')) {
      payload.receiveUpdates = options.receiveUpdates === true
    }

    await setDoc(
      userRef,
      payload,
      { merge: true },
    )
  }

  function initialize() {
    if (unsubscribeAuth) {
      return unsubscribeAuth
    }

    unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      user.value = firebaseUser
      clearError()

      if (!firebaseUser) {
        stopSubscriptionListener()
        subscription.value = createDefaultSubscription()
        isLoaded.value = true
        return
      }

      try {
        await ensureUserDocuments(firebaseUser)
        watchSubscription(firebaseUser.uid)
      } catch (error) {
        errorMessage.value = getFriendlyAuthErrorMessage(error, 'account.loadFailed')
      } finally {
        isLoaded.value = true
      }
    })

    return unsubscribeAuth
  }

  async function signUp(email, password, options = {}) {
    isLoading.value = true
    clearError()

    try {
      const credentials = await createUserWithEmailAndPassword(auth, email, password)
      await ensureUserDocuments(credentials.user, options)
      user.value = credentials.user
      return credentials.user
    } catch (error) {
      errorMessage.value = getFriendlyAuthErrorMessage(error, 'account.signUpFailed')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function signIn(email, password) {
    isLoading.value = true
    clearError()

    try {
      const credentials = await signInWithEmailAndPassword(auth, email, password)
      await ensureUserDocuments(credentials.user)
      user.value = credentials.user
      return credentials.user
    } catch (error) {
      errorMessage.value = getFriendlyAuthErrorMessage(error, 'account.signInFailed')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function signOutUser() {
    isLoading.value = true
    clearError()

    try {
      await signOut(auth)
      stopSubscriptionListener()
      user.value = null
      subscription.value = createDefaultSubscription()
    } catch (error) {
      errorMessage.value = getFriendlyAuthErrorMessage(error, 'account.signOutFailed')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function requestPasswordReset(email) {
    isLoading.value = true
    clearError()

    try {
      auth.languageCode = getCurrentLocaleValue()

      await sendPasswordResetEmail(auth, email, {
        url: typeof window === 'undefined'
          ? 'https://breedz.app/account'
          : `${window.location.origin}/account`,
      })
    } catch (error) {
      errorMessage.value = getFriendlyAuthErrorMessage(error, 'account.passwordResetFailed')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    errorMessage,
    initialize,
    isLoaded,
    isLoading,
    isPremium,
    isSignedIn,
    requestPasswordReset,
    signIn,
    signOutUser,
    signUp,
    subscription,
    user,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
