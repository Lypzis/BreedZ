import { defineBoot } from '#q-app/wrappers'
import { initFirebaseAppCheck } from 'src/services/firebase'

export default defineBoot(() => {
  initFirebaseAppCheck()
})
