export const GUIDE_MANIFEST = Object.freeze({
  breedingDates: Object.freeze({
    internalPath: '/guides/track-cattle-breeding-dates',
    messageKey: 'guideBreedingDates',
    publishedAt: '2026-04-03',
    modifiedAt: '2026-08-02',
    image: '/images/landing/breeding-event.png',
  }),
  cattleLineage: Object.freeze({
    internalPath: '/guides/how-to-track-cattle-lineage',
    messageKey: 'guideCattleLineage',
    publishedAt: '2026-04-08',
    modifiedAt: '2026-05-12',
    image: '/images/landing/parent-records.png',
  }),
  cowPregnancy: Object.freeze({
    internalPath: '/guides/how-long-is-cow-pregnancy',
    messageKey: 'guideCowPregnancy',
    publishedAt: '2026-04-23',
    modifiedAt: '2026-05-12',
    image: '/images/landing/hero-farm.webp',
  }),
  cattleRecordKeeping: Object.freeze({
    internalPath: '/guides/best-cattle-record-keeping-methods',
    messageKey: 'guideCattleRecordKeeping',
    publishedAt: '2026-04-27',
    modifiedAt: '2026-05-12',
    image: '/images/landing/record-events.png',
  }),
  lostBreedingRecords: Object.freeze({
    internalPath: '/guides/lost-breeding-records-what-to-do',
    messageKey: 'guideLostBreedingRecords',
    publishedAt: '2026-04-29',
    modifiedAt: '2026-08-02',
    image: '/images/landing/paper-notes.webp',
  }),
  breedingRecordsApp: Object.freeze({
    internalPath: '/guides/breeding-records-app',
    messageKey: 'guideBreedingRecordsApp',
    publishedAt: '2026-05-06',
    modifiedAt: '2026-05-12',
    image: '/images/landing/animal-details.png',
  }),
  cattleGestationCalculator: Object.freeze({
    internalPath: '/guides/cattle-gestation-calculator',
    messageKey: 'guideCattleGestationCalculator',
    publishedAt: '2026-05-14',
    modifiedAt: '2026-08-02',
    image: '/images/landing/expected-birth.png',
  }),
  breedingManagementApp: Object.freeze({
    internalPath: '/guides/breeding-management-app',
    messageKey: 'guideBreedingManagementApp',
    publishedAt: '2026-05-21',
    modifiedAt: '2026-05-21',
    image: '/images/landing/resolve-lifecycle.png',
  }),
  cattleBreedingRecordKeepingSystem: Object.freeze({
    internalPath: '/guides/cattle-breeding-record-keeping-system',
    messageKey: 'guideCattleBreedingRecordKeepingSystem',
    publishedAt: '2026-06-02',
    modifiedAt: '2026-06-02',
    image: '/images/landing/breeding-history.png',
  }),
})

export const GUIDE_ENTRIES = Object.freeze(Object.values(GUIDE_MANIFEST))

export function getGuideManifestEntry(key) {
  const entry = GUIDE_MANIFEST[key]

  if (!entry) {
    throw new Error(`Unknown guide manifest key: ${key}`)
  }

  return entry
}
