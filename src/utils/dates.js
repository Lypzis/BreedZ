import { getCurrentLocaleValue, t } from '../i18n/index.js'

function parseDateValue(value) {
  if (!value) {
    return null
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const parsedDate = new Date(value)

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

export function formatDisplayDate(value) {
  const date = parseDateValue(value)

  if (!date) {
    return ''
  }

  return new Intl.DateTimeFormat(getCurrentLocaleValue(), { dateStyle: 'medium' }).format(date)
}

export function formatDisplayDateTime(value) {
  const date = parseDateValue(value)

  if (!date) {
    return ''
  }

  return new Intl.DateTimeFormat(getCurrentLocaleValue(), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function formatAgeLabel(value, referenceDate = new Date()) {
  const birthDate = parseDateValue(value)

  if (!birthDate) {
    return ''
  }

  const comparisonDate = parseDateValue(referenceDate) || new Date()

  if (birthDate > comparisonDate) {
    return ''
  }

  let years = comparisonDate.getFullYear() - birthDate.getFullYear()
  let months = comparisonDate.getMonth() - birthDate.getMonth()

  if (comparisonDate.getDate() < birthDate.getDate()) {
    months -= 1
  }

  if (months < 0) {
    years -= 1
    months += 12
  }

  const parts = []

  if (years >= 2) {
    parts.push(t('common.ageYears', { count: years }))
  } else if (years === 1) {
    parts.push(t('common.ageOneYear'))
  }

  if (months >= 2) {
    parts.push(t('common.ageMonths', { count: months }))
  } else if (months === 1) {
    parts.push(t('common.ageOneMonth'))
  }

  if (parts.length > 0) {
    return parts.join(', ')
  }

  return t('common.ageUnderOneMonth')
}

export function todayDateString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
