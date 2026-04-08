import { defineBoot } from '#q-app/wrappers'
import { useAuthStore } from 'src/stores/auth-store'

export default defineBoot(() => {
  const authStore = useAuthStore()
  authStore.initialize()
})
