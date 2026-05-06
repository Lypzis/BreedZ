import { isPendingEvent, normalizeEventAmount, normalizeEventRecord } from './event-records.js'

const COST_EVENT_TYPES = new Set([
  'purchase',
  'vaccination',
  'health_issue',
  'breeding',
  'feed_cost',
  'labor_cost',
  'supply_cost',
  'maintenance_cost',
  'other_expense',
])
const INCOME_EVENT_TYPES = new Set(['sale', 'other_income'])

export function buildOverviewSummary(animals = [], events = []) {
  const animalStatusCounts = {
    total: animals.length,
    active: 0,
    sold: 0,
    dead: 0,
    breeders: 0,
  }
  const financials = {
    incomeTotal: 0,
    otherIncomeTotal: 0,
    purchaseTotal: 0,
    salesTotal: 0,
    otherExpenseTotal: 0,
    recordedCosts: 0,
    recordedBalance: 0,
  }

  for (const animal of animals) {
    if (animal.status === 'active') {
      animalStatusCounts.active += 1
    } else if (animal.status === 'sold') {
      animalStatusCounts.sold += 1
    } else if (animal.status === 'dead') {
      animalStatusCounts.dead += 1
    }

    if (animal.isBreeder === true) {
      animalStatusCounts.breeders += 1
    }
  }

  for (const rawEvent of events) {
    const event = normalizeEventRecord(rawEvent)

    if (isPendingEvent(event)) {
      continue
    }

    const type = event.type || 'custom'
    const amount = normalizeEventAmount(event.amount) ?? 0

    if (type === 'purchase') {
      financials.purchaseTotal += amount
    }

    if (type === 'sale') {
      financials.salesTotal += amount
    }

    if (type === 'other_income') {
      financials.otherIncomeTotal += amount
    }

    if (INCOME_EVENT_TYPES.has(type)) {
      financials.incomeTotal += amount
    }

    if (COST_EVENT_TYPES.has(type) && type !== 'purchase') {
      financials.otherExpenseTotal += amount
    }

    if (COST_EVENT_TYPES.has(type)) {
      financials.recordedCosts += amount
    }
  }

  financials.recordedBalance = financials.incomeTotal - financials.recordedCosts

  return {
    animalStatusCounts,
    financials,
  }
}
