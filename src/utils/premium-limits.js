export const FREE_ANIMAL_SOFT_REMINDER_COUNT = 15
export const FREE_ANIMAL_STRONG_REMINDER_COUNT = 18
export const FREE_ANIMAL_CAP = 20
export const FREE_ANIMAL_EXTRA_CAP = 21
export const ANIMAL_LIMIT_REACHED_ERROR = 'ANIMAL_LIMIT_REACHED'

export function canCreateAnimal(currentCount, { isPremium = false } = {}) {
  if (isPremium) {
    return true
  }

  return currentCount < FREE_ANIMAL_EXTRA_CAP
}

export function getAnimalLimitReminder(totalCount, { isPremium = false } = {}) {
  if (isPremium) {
    return null
  }

  if (totalCount === FREE_ANIMAL_SOFT_REMINDER_COUNT) {
    return {
      color: 'info',
      icon: 'workspace_premium',
      messageKey: 'animals.premiumReminder15',
    }
  }

  if (totalCount === FREE_ANIMAL_STRONG_REMINDER_COUNT) {
    return {
      color: 'warning',
      icon: 'workspace_premium',
      messageKey: 'animals.premiumReminder18',
    }
  }

  if (totalCount === FREE_ANIMAL_CAP) {
    return {
      color: 'warning',
      icon: 'workspace_premium',
      messageKey: 'animals.premiumReminder20',
    }
  }

  if (totalCount === FREE_ANIMAL_EXTRA_CAP) {
    return {
      color: 'negative',
      icon: 'workspace_premium',
      messageKey: 'animals.premiumReminder21',
    }
  }

  return null
}
