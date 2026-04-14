function normalizeLabel(value) {
  const trimmed = String(value || '')
    .trim()
    .replace(/\s+/g, ' ')

  if (!trimmed) {
    return ''
  }

  return trimmed
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

export function normalizeSpeciesLabel(value) {
  return normalizeLabel(value)
}

export function normalizeBreedLabel(value) {
  return normalizeLabel(value)
}
