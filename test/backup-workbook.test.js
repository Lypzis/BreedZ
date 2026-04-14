import test from 'node:test'
import assert from 'node:assert/strict'
import * as XLSX from 'xlsx'

import {
  parseBackupWorkbook,
  readBackupWorkbookFromArrayBuffer,
  writeBackupWorkbookArray,
} from '../src/utils/backup-workbook.js'
import { validateAndNormalizeBackupPayload } from '../src/utils/backup-data.js'

test('round-trips backup data through the Excel workbook format', () => {
  const workbookArray = writeBackupWorkbookArray({
    schemaVersion: 1,
    exportedAt: '2026-04-08T12:00:00.000Z',
    animals: [
      {
        id: 'animal-1',
        tag: '001',
        name: 'Bella',
        species: 'Cattle',
        breed: 'Nellore',
        isBreeder: true,
        sex: 'female',
        birthDate: '2024-01-10',
        status: 'active',
        damId: '',
        sireId: '',
        notes: 'Dam line',
        createdAt: '2026-04-01T12:00:00.000Z',
        updatedAt: '2026-04-02T12:00:00.000Z',
      },
      {
        id: 'animal-2',
        tag: '002',
        name: 'Ranger',
        species: 'Cattle',
        breed: 'Angus',
        isBreeder: true,
        sex: 'male',
        birthDate: '2023-01-10',
        status: 'active',
        damId: '',
        sireId: '',
        notes: 'Sire line',
        createdAt: '2026-04-01T12:10:00.000Z',
        updatedAt: '2026-04-02T12:10:00.000Z',
      },
    ],
    events: [
      {
        id: 'event-1',
        animalId: 'animal-1',
        type: 'breeding',
        partnerAnimalId: 'animal-2',
        date: '2026-04-03',
        notes: 'Healthy pairing',
        createdAt: '2026-04-03T12:00:00.000Z',
        updatedAt: '2026-04-03T12:00:00.000Z',
      },
    ],
  })

  const parsedPayload = readBackupWorkbookFromArrayBuffer(workbookArray)
  const normalizedPayload = validateAndNormalizeBackupPayload(parsedPayload)

  assert.equal(normalizedPayload.animals.length, 2)
  assert.equal(normalizedPayload.animals[0].isBreeder, true)
  assert.equal(normalizedPayload.animals[0].name, 'Bella')
  assert.equal(normalizedPayload.animals[0].breed, 'Nellore')
  assert.equal(normalizedPayload.events.length, 1)
  assert.equal(normalizedPayload.events[0].partnerAnimalId, 'animal-2')
  assert.equal(normalizedPayload.events[0].type, 'breeding')
})

test('rejects Excel backups missing the Animals sheet', () => {
  const workbook = XLSX.utils.book_new()
  const eventsSheet = XLSX.utils.json_to_sheet([
    {
      ID: 'event-1',
      'Animal ID': 'animal-1',
      Type: 'custom',
      Date: '2026-04-08',
      Notes: 'Test',
    },
  ])

  XLSX.utils.book_append_sheet(workbook, eventsSheet, 'Events')

  assert.throws(
    () => parseBackupWorkbook(workbook),
    /missing "Animals" sheet/,
  )
})

test('rejects Excel backups missing the Events sheet', () => {
  const workbook = XLSX.utils.book_new()
  const animalsSheet = XLSX.utils.json_to_sheet([
    {
      ID: 'animal-1',
      Tag: '001',
      Name: 'Bella',
      Species: 'Cattle',
    },
  ])

  XLSX.utils.book_append_sheet(workbook, animalsSheet, 'Animals')

  assert.throws(
    () => parseBackupWorkbook(workbook),
    /missing "Events" sheet/,
  )
})
