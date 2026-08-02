const GESTATION_DAYS_BY_SPECIES = {
  cattle: 283,
  sheep: 147,
  goat: 150,
  pig: 114,
  horse: 340,
}

const SPECIES_ALIASES = {
  cattle: ['cattle', 'cow', 'bovine', 'bovino', 'bovina', 'vaca', 'gado', 'ganado'],
  sheep: ['sheep', 'ewe', 'ovine', 'ovino', 'ovina', 'ovelha', 'oveja'],
  goat: ['goat', 'doe', 'caprine', 'caprino', 'caprina', 'cabra'],
  pig: ['pig', 'swine', 'sow', 'porcine', 'porcino', 'porcina', 'porco', 'porca', 'suino'],
  horse: ['horse', 'mare', 'equine', 'equino', 'equina', 'cavalo', 'egua', 'yegua'],
}

function normalizeSpecies(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

function parseDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value ?? ''))) {
    return null
  }

  const [year, month, day] = value.split('-').map(Number)
  const parsedDate = new Date(Date.UTC(year, month - 1, day))

  if (
    parsedDate.getUTCFullYear() !== year
    || parsedDate.getUTCMonth() !== month - 1
    || parsedDate.getUTCDate() !== day
  ) {
    return null
  }

  return parsedDate
}

function formatDateString(value) {
  const year = value.getUTCFullYear()
  const month = String(value.getUTCMonth() + 1).padStart(2, '0')
  const day = String(value.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function addDaysToDateString(value, days) {
  const parsedDate = parseDateString(value)
  const normalizedDays = Number(days)

  if (!parsedDate || !Number.isFinite(normalizedDays)) {
    return ''
  }

  parsedDate.setUTCDate(parsedDate.getUTCDate() + normalizedDays)
  return formatDateString(parsedDate)
}

export function buildGestationWatchWindow(breedingDate, gestationDays = 283, windowDays = 7) {
  const estimatedDate = addDaysToDateString(breedingDate, gestationDays)
  const normalizedWindowDays = Number(windowDays)

  if (!estimatedDate || !Number.isFinite(normalizedWindowDays) || normalizedWindowDays < 0) {
    return {
      estimatedDate: '',
      windowStart: '',
      windowEnd: '',
    }
  }

  return {
    estimatedDate,
    windowStart: addDaysToDateString(estimatedDate, -normalizedWindowDays),
    windowEnd: addDaysToDateString(estimatedDate, normalizedWindowDays),
  }
}

export function getGestationDaysForSpecies(species) {
  const normalizedSpecies = normalizeSpecies(species)

  if (!normalizedSpecies) {
    return null
  }

  const matchedSpecies = Object.entries(SPECIES_ALIASES).find(([, aliases]) =>
    aliases.some((alias) => normalizedSpecies.includes(alias)),
  )?.[0]

  return matchedSpecies ? GESTATION_DAYS_BY_SPECIES[matchedSpecies] : null
}

export function buildExpectedBirthDate(breedingDate, species) {
  const gestationDays = getGestationDaysForSpecies(species)
  const parsedBreedingDate = parseDateString(breedingDate)

  if (!gestationDays || !parsedBreedingDate) {
    return ''
  }

  return addDaysToDateString(formatDateString(parsedBreedingDate), gestationDays)
}

export function shouldApplyExpectedBirthSuggestion({
  currentDate = '',
  force = false,
  isManuallyEdited = false,
  previousSuggestedDate = '',
} = {}) {
  return Boolean(
    force
    || !isManuallyEdited
    || !currentDate
    || currentDate === previousSuggestedDate,
  )
}
