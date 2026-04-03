export function normalizeSpeciesLabel(value) {
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
