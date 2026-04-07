import { t } from '../i18n/index.js'

const EVENT_TYPE_META = {
  birth: { labelKey: 'eventTypes.birth', icon: 'child_friendly', color: 'secondary' },
  breeding: { labelKey: 'eventTypes.breeding', icon: 'favorite', color: 'primary' },
  sale: { labelKey: 'eventTypes.sale', icon: 'sell', color: 'info' },
  vaccination: { labelKey: 'eventTypes.vaccination', icon: 'vaccines', color: 'accent' },
  health_issue: { labelKey: 'eventTypes.health_issue', icon: 'healing', color: 'negative' },
  death: { labelKey: 'eventTypes.death', icon: 'warning', color: 'dark' },
  custom: { labelKey: 'eventTypes.custom', icon: 'assignment', color: 'primary' },
}

export function getEventTypeOptions() {
  return Object.entries(EVENT_TYPE_META).map(([value, meta]) => ({
    label: t(meta.labelKey),
    value,
  }))
}

export function getEventTypeMeta(type) {
  const meta = EVENT_TYPE_META[type] ?? EVENT_TYPE_META.custom

  return {
    ...meta,
    label: t(meta.labelKey),
  }
}
