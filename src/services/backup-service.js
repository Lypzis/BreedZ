import { replaceAppData } from 'src/services/app-db'
import { listAnimals } from 'src/services/animals-db'
import { listEvents } from 'src/services/events-db'
import { validateAndNormalizeBackupPayload } from 'src/utils/backup-data'
import {
  readBackupWorkbookFromArrayBuffer,
  writeBackupWorkbookArray,
} from 'src/utils/backup-workbook'

export async function buildBackupPayload() {
  const [animals, events] = await Promise.all([listAnimals(), listEvents()])

  return {
    schemaVersion: 3,
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

export async function buildBackupWorkbookArray() {
  const payload = await buildBackupPayload()
  return writeBackupWorkbookArray(payload)
}

export async function importBackupWorkbookArrayBuffer(arrayBuffer) {
  const payload = readBackupWorkbookFromArrayBuffer(arrayBuffer)
  return importBackupPayload(payload)
}
