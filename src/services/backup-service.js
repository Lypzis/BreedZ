import { replaceAppData } from 'src/services/app-db'
import { listAnimals } from 'src/services/animals-db'
import { listEvents } from 'src/services/events-db'
import { validateAndNormalizeBackupPayload } from 'src/utils/backup-data'

export async function buildBackupPayload() {
  const [animals, events] = await Promise.all([listAnimals(), listEvents()])

  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    animals,
    events,
  }
}

export async function importBackupPayload(payload) {
  const normalizedPayload = validateAndNormalizeBackupPayload(payload)
  await replaceAppData(normalizedPayload)
  return normalizedPayload
}
