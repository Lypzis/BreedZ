export function formatAnimalDisplayName(animal, options = {}) {
  if (!animal) {
    return options.missingLabel ?? 'Unknown animal'
  }

  const tag = animal.tag?.trim() ?? ''
  const name = animal.name?.trim() ?? ''

  if (name && tag) {
    return `${name} - ${tag}`
  }

  return tag || name || (options.emptyLabel ?? 'Unnamed animal')
}
