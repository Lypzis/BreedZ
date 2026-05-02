import * as XLSX from 'xlsx'

const ANIMALS_SHEET = 'Animals'
const EVENTS_SHEET = 'Events'
const INSTRUCTIONS_SHEET = 'Instructions'

const ANIMAL_COLUMNS = [
  ['id', 'ID'],
  ['tag', 'Tag'],
  ['name', 'Name'],
  ['species', 'Species'],
  ['breed', 'Breed'],
  ['weight', 'Weight (kg)'],
  ['sex', 'Sex'],
  ['baseStatus', 'Base Status'],
  ['status', 'Status'],
  ['birthDate', 'Birth Date'],
  ['damId', 'Dam ID'],
  ['sireId', 'Sire ID'],
  ['isBreeder', 'Breeder'],
  ['notes', 'Notes'],
  ['createdAt', 'Created At'],
  ['updatedAt', 'Updated At'],
]

const EVENT_COLUMNS = [
  ['id', 'ID'],
  ['animalIds', 'Animal IDs'],
  ['animalId', 'Animal ID'],
  ['scope', 'Scope'],
  ['type', 'Type'],
  ['linkedEventId', 'Linked Event ID'],
  ['confirmationStatus', 'Confirmation Status'],
  ['amount', 'Amount'],
  ['date', 'Date'],
  ['partnerAnimalId', 'Partner Animal ID'],
  ['notes', 'Notes'],
  ['createdAt', 'Created At'],
  ['updatedAt', 'Updated At'],
]

function toSheetRows(items, columns) {
  return items.map((item) =>
    Object.fromEntries(
      columns.map(([key, label]) => [
        label,
        key === 'isBreeder'
          ? (item[key] === true ? 'yes' : 'no')
          : key === 'animalIds'
            ? Array.isArray(item[key]) ? item[key].join(', ') : (item[key] ?? '')
          : (item[key] ?? ''),
      ]),
    ),
  )
}

function fromSheetRows(rows, columns) {
  return rows.map((row) =>
    Object.fromEntries(
      columns.map(([key, label]) => [key, row[label] ?? '']),
    ),
  )
}

export function buildBackupWorkbook(payload) {
  const workbook = XLSX.utils.book_new()

  const animalsSheet = XLSX.utils.json_to_sheet(toSheetRows(payload.animals, ANIMAL_COLUMNS))
  const eventsSheet = XLSX.utils.json_to_sheet(toSheetRows(payload.events, EVENT_COLUMNS))
  const instructionsSheet = XLSX.utils.aoa_to_sheet([
    ['BreedZ Excel backup'],
    ['Open this file in Excel or Google Sheets.'],
    ['Do not change IDs unless you know what you are doing.'],
    ['Animals and Events are the two sheets used for restore.'],
    ['Exported At', payload.exportedAt ?? new Date().toISOString()],
  ])

  XLSX.utils.book_append_sheet(workbook, animalsSheet, ANIMALS_SHEET)
  XLSX.utils.book_append_sheet(workbook, eventsSheet, EVENTS_SHEET)
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, INSTRUCTIONS_SHEET)

  return workbook
}

export function parseBackupWorkbook(workbook) {
  const animalsSheet = workbook.Sheets[ANIMALS_SHEET]
  const eventsSheet = workbook.Sheets[EVENTS_SHEET]

  if (!animalsSheet) {
    throw new Error(`Backup file is invalid: missing "${ANIMALS_SHEET}" sheet.`)
  }

  if (!eventsSheet) {
    throw new Error(`Backup file is invalid: missing "${EVENTS_SHEET}" sheet.`)
  }

  const animalRows = XLSX.utils.sheet_to_json(animalsSheet, { defval: '', raw: false })
  const eventRows = XLSX.utils.sheet_to_json(eventsSheet, { defval: '', raw: false })

  return {
    schemaVersion: 4,
    exportedAt: new Date().toISOString(),
    animals: fromSheetRows(animalRows, ANIMAL_COLUMNS),
    events: fromSheetRows(eventRows, EVENT_COLUMNS),
  }
}

export function writeBackupWorkbookArray(payload) {
  const workbook = buildBackupWorkbook(payload)
  return XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  })
}

export function readBackupWorkbookFromArrayBuffer(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  return parseBackupWorkbook(workbook)
}
