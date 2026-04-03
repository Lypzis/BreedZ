export const EVENT_TYPE_OPTIONS = [
  { label: 'Calving', value: 'birth' },
  { label: 'Breeding', value: 'breeding' },
  { label: 'Vaccination', value: 'vaccination' },
  { label: 'Health issue', value: 'health_issue' },
  { label: 'Death', value: 'death' },
  { label: 'Custom event', value: 'custom' },
]

const EVENT_TYPE_META = {
  birth: { label: 'Calving', icon: 'child_friendly', color: 'secondary' },
  breeding: { label: 'Breeding', icon: 'favorite', color: 'primary' },
  vaccination: { label: 'Vaccination', icon: 'vaccines', color: 'accent' },
  health_issue: { label: 'Health issue', icon: 'healing', color: 'negative' },
  death: { label: 'Death', icon: 'warning', color: 'dark' },
  custom: { label: 'Custom event', icon: 'assignment', color: 'primary' },
}

export function getEventTypeMeta(type) {
  return EVENT_TYPE_META[type] ?? EVENT_TYPE_META.custom
}
