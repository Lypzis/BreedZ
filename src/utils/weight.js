const LB_PER_KG = 2.2046226218

function parseWeightNumber(value) {
  const normalized = String(value ?? '').trim().replace(',', '.')

  if (!normalized) {
    return null
  }

  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : null
}

function formatWeightNumber(value) {
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

export function convertStoredWeightToUnit(value, unit = 'kg') {
  const parsed = parseWeightNumber(value)

  if (parsed === null) {
    return ''
  }

  const converted = unit === 'lb' ? parsed * LB_PER_KG : parsed
  return formatWeightNumber(converted)
}

export function convertInputWeightToStored(value, unit = 'kg') {
  const parsed = parseWeightNumber(value)

  if (parsed === null) {
    return ''
  }

  const converted = unit === 'lb' ? parsed / LB_PER_KG : parsed
  return formatWeightNumber(converted)
}

export function formatStoredWeightForDisplay(value, unit = 'kg') {
  const converted = convertStoredWeightToUnit(value, unit)

  if (!converted) {
    return ''
  }

  return `${converted} ${unit}`
}
