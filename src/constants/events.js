import { t } from '../i18n/index.js'

const EVENT_TYPE_META = {
  breeding: { labelKey: 'eventTypes.breeding', icon: 'favorite', color: 'primary' },
  birth: { labelKey: 'eventTypes.birth', icon: 'child_friendly', color: 'secondary' },
  expected_birth: {
    labelKey: 'eventTypes.expected_birth',
    icon: 'event_repeat',
    color: 'secondary',
  },
  vaccination: { labelKey: 'eventTypes.vaccination', icon: 'vaccines', color: 'accent' },
  health_issue: { labelKey: 'eventTypes.health_issue', icon: 'healing', color: 'negative' },
  purchase: { labelKey: 'eventTypes.purchase', icon: 'shopping_cart', color: 'positive' },
  sale: { labelKey: 'eventTypes.sale', icon: 'sell', color: 'info' },
  death: { labelKey: 'eventTypes.death', icon: 'warning', color: 'dark' },
  custom: { labelKey: 'eventTypes.custom', icon: 'assignment', color: 'primary' },
  feed_cost: { labelKey: 'eventTypes.feed_cost', icon: 'grass', color: 'warning' },
  labor_cost: { labelKey: 'eventTypes.labor_cost', icon: 'engineering', color: 'warning' },
  supply_cost: { labelKey: 'eventTypes.supply_cost', icon: 'inventory_2', color: 'warning' },
  maintenance_cost: { labelKey: 'eventTypes.maintenance_cost', icon: 'build', color: 'warning' },
  other_expense: { labelKey: 'eventTypes.other_expense', icon: 'receipt_long', color: 'warning' },
  other_income: { labelKey: 'eventTypes.other_income', icon: 'payments', color: 'positive' },
}

export const HERD_SCOPE_EVENT_TYPES = new Set([
  'feed_cost',
  'labor_cost',
  'supply_cost',
  'maintenance_cost',
  'other_expense',
  'other_income',
])

export function canEventUseHerdScope(type) {
  return HERD_SCOPE_EVENT_TYPES.has(type)
}

export function getEventTypeOptions() {
  return Object.entries(EVENT_TYPE_META).map(([value, meta]) => ({
    label: t(meta.labelKey),
    icon: meta.icon,
    color: meta.color,
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
