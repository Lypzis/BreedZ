<template>
  <q-page class="page-padding">
    <div class="page-grid">
      <section class="hero-card q-pa-lg">
        <div class="row items-center q-col-gutter-sm q-mb-md">
          <div class="col-auto">
            <q-badge color="dark" class="metric-pill">Field-ready</q-badge>
          </div>
          <div class="col-auto">
            <q-badge color="positive" class="metric-pill">Offline mode</q-badge>
          </div>
          <div class="col-auto">
            <q-badge color="warning" text-color="dark" class="metric-pill">PWA installable</q-badge>
          </div>
        </div>

        <div class="text-overline text-weight-bold text-positive">BreedZ MVP</div>
        <h1 class="hero-title">Track animals and events in seconds, even without signal.</h1>
        <p class="hero-copy">
          This starter shell is optimized for the product spec already in the workspace: fast animal
          lookup, event capture, timeline visibility, and reliable offline operation.
        </p>

        <div class="row q-col-gutter-sm q-mt-lg">
          <div class="col-auto">
            <q-btn unelevated color="dark" label="View animals" icon="pets" />
          </div>
          <div class="col-auto">
            <q-btn outline color="dark" label="Add event" icon="add_task" />
          </div>
        </div>
      </section>

      <section class="section-card q-pa-lg">
        <div class="section-label">Today</div>
        <div class="text-h5 text-weight-bold q-mb-md">Actionable, not analytical.</div>

        <div class="status-stack">
          <div v-for="item in todayItems" :key="item.title" class="status-row">
            <div>
              <div class="text-subtitle1 text-weight-bold">{{ item.title }}</div>
              <div class="text-caption text-grey-7">{{ item.caption }}</div>
            </div>
            <q-chip square dense :color="item.color" text-color="white">
              {{ item.value }}
            </q-chip>
          </div>
        </div>
      </section>

      <section class="section-card q-pa-lg">
        <div class="section-label">Core Flow</div>
        <div class="text-h5 text-weight-bold q-mb-md">The main interaction path stays short.</div>

        <div class="flow-stack">
          <div v-for="step in quickFlow" :key="step.title" class="flow-row">
            <div class="flow-index">{{ step.step }}</div>
            <div>
              <div class="text-subtitle1 text-weight-bold">{{ step.title }}</div>
              <div class="text-caption text-grey-7">{{ step.caption }}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="section-card q-pa-lg">
        <div class="section-label">Timeline Preview</div>
        <div class="text-h5 text-weight-bold q-mb-md">
          Each animal’s history is the value screen.
        </div>

        <div class="timeline-stack">
          <div v-for="event in timelinePreview" :key="event.title" class="timeline-row">
            <div class="timeline-dot" />
            <div>
              <div class="text-subtitle2 text-weight-bold">{{ event.title }}</div>
              <div class="text-caption text-grey-7">{{ event.date }} • {{ event.caption }}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="section-card q-pa-lg">
        <div class="section-label">Offline Safety</div>
        <div class="text-h5 text-weight-bold q-mb-md">
          Prepared for weak connectivity from the start.
        </div>

        <div class="offline-grid">
          <div v-for="feature in offlineFeatures" :key="feature.title" class="offline-card">
            <q-icon :name="feature.icon" size="24px" class="q-mb-sm" />
            <div class="text-subtitle2 text-weight-bold">{{ feature.title }}</div>
            <div class="text-caption text-grey-7">{{ feature.caption }}</div>
          </div>
        </div>
      </section>
    </div>
  </q-page>
</template>

<script setup>
const todayItems = [
  {
    title: 'Vaccinations due',
    caption: 'Focus the dashboard on immediate work in the field.',
    value: '2',
    color: 'negative',
  },
  {
    title: 'Breeding checks',
    caption: 'Expected follow-up windows remain visible at a glance.',
    value: '1',
    color: 'warning',
  },
  {
    title: 'New events logged',
    caption: 'Capture stays lightweight and mobile friendly.',
    value: '7',
    color: 'positive',
  },
]

const quickFlow = [
  {
    step: '1',
    title: 'Find animal',
    caption: 'Search by tag or name with minimal taps.',
  },
  {
    step: '2',
    title: 'Log event',
    caption: 'Birth, breeding, vaccination, health issue, death, or custom note.',
  },
  {
    step: '3',
    title: 'Save locally',
    caption: 'Store records on-device first, sync later when a backend exists.',
  },
]

const timelinePreview = [
  {
    title: 'Vaccination',
    date: 'Jan 10',
    caption: 'Cow 014 received annual booster',
  },
  {
    title: 'Breeding',
    date: 'Feb 02',
    caption: 'Cow 014 flagged for follow-up observation',
  },
  {
    title: 'Birth',
    date: 'Mar 05',
    caption: 'Calf recorded and linked to mother',
  },
]

const offlineFeatures = [
  {
    title: 'IndexedDB-ready',
    caption: 'The app structure is ready for local storage and offline reads.',
    icon: 'storage',
  },
  {
    title: 'PWA install',
    caption: 'Install on mobile home screens for faster field access.',
    icon: 'download_for_offline',
  },
  {
    title: 'JSON backup path',
    caption: 'Import/export is planned as the MVP safety mechanism.',
    icon: 'dataset',
  },
]
</script>
